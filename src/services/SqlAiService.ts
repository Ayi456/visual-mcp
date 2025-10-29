
import { Connection, Schema, Column } from '../types/sql.types.js';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { isReadOnlySql } from '../utils/sqlUtils.js';

export interface SqlGenerationContext {
  connection: Connection;
  database?: string;
  tableSchema?: Schema[];
  previousQueries?: string[];
}

export interface SqlGenerationResult {
  sql: string;
  explanation: string;
  confidence: number;
  suggestedDatabase?: string;
  warnings?: string[];
}

export interface AiConfig {
  apiUrl?: string;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  enableCache?: boolean;
  cacheTTL?: number;
}

// 环境配置
interface EnvironmentProfile {
  name: string;
  ai: {
    timeout: number;
    maxTokens: number;
    temperature: number;
  };
  cache: {
    enabled: boolean;
    ttl: number;
  };
  schema: {
    maxTables: number;
    maxColumnsPerTable: number;
    maxSchemaLength: number;
  };
}

export class SqlAiService {
  private aiConfig: AiConfig;
  private isScfEnvironment: boolean;
  private profile: EnvironmentProfile;
  
  // 环境配置预设
  private readonly profiles: Record<string, EnvironmentProfile> = {
    local: {
      name: 'local',
      ai: {
        timeout: 30000,
        maxTokens: 2048,
        temperature: 0.7
      },
      cache: {
        enabled: false,
        ttl: 0
      },
      schema: {
        maxTables: -1,  // 无限制
        maxColumnsPerTable: -1,
        maxSchemaLength: -1
      }
    },
    scf: {
      name: 'scf',
      ai: {
        timeout: 25000,   
        maxTokens: 1500,     
        temperature: 0.5     
      },
      cache: {
        enabled: true,       
        ttl: 3600          // 缓存 1 小时
      },
      schema: {
        maxTables: 10,       
        maxColumnsPerTable: 20,
        maxSchemaLength: 2000
      }
    }
  };

  constructor(config?: AiConfig) {
    // 检测运行环境
    this.isScfEnvironment = process.env.FORCE_CLOUD_FUNCTION === 'true';
    
    // 选择环境配置
    this.profile = this.isScfEnvironment ? this.profiles.scf : this.profiles.local;
    
    this.aiConfig = {
      apiUrl: config?.apiUrl || process.env.AI_API_URL,
      apiKey: config?.apiKey || process.env.AI_API_KEY, 
      model: config?.model || process.env.AI_MODEL,
      temperature: config?.temperature ||
                   parseFloat(process.env.AI_TEMPERATURE || String(this.profile.ai.temperature)),
      maxTokens: config?.maxTokens ||
                 parseInt(process.env.AI_MAX_TOKENS || String(this.profile.ai.maxTokens)),
      timeout: config?.timeout ||
               parseInt(process.env.AI_TIMEOUT || String(this.profile.ai.timeout)),
      enableCache: config?.enableCache ??
                   (process.env.ENABLE_AI_CACHE === 'true' || this.profile.cache.enabled),
      cacheTTL: config?.cacheTTL ||
                parseInt(process.env.AI_CACHE_TTL || String(this.profile.cache.ttl))
    };

    // 必填校验：缺少 API Key 直接抛错，避免隐式使用无效凭证
    if (!this.aiConfig.apiKey) {
      throw new Error('Missing AI_API_KEY: please set env AI_API_KEY or pass SqlAiService({ apiKey })');
    }

    console.log(`SqlAiService initialized:`, {
      environment: this.profile.name,
      timeout: this.aiConfig.timeout,
      maxTokens: this.aiConfig.maxTokens,
      cacheEnabled: this.aiConfig.enableCache
    });
  }
  /**
   * 根据自然语言生成 SQL（AI-only + 重试）
   */
  async generateSql(
    message: string,
    context: SqlGenerationContext
  ): Promise<SqlGenerationResult> {
    const startTime = Date.now();

    // 1) 可选：缓存命中直接返回
    if (this.aiConfig.enableCache) {
      try {
        const cached = await this.getCachedResult(message, context);
        if (cached) {
          console.log(`缓存命中，耗时: ${Date.now() - startTime}ms`);
          return cached;
        }
      } catch (e) {
        console.warn('读取缓存失败，继续调用 AI:', e);
      }
    }

    // 2) 构建 schema 上下文
    const schemaContext = this.buildSchemaContext(context.tableSchema);

    // 3) 读取重试与置信度参数
    const attempts = Math.max(1, parseInt(process.env.AI_RETRY_ATTEMPTS || '2', 10));
    const baseDelay = Math.max(0, parseInt(process.env.AI_RETRY_BASE_DELAY || '800', 10));
    const minConfidence = Math.min(1, Math.max(0, parseFloat(process.env.MIN_SQL_CONFIDENCE || '0.7')));

    let lastError: Error | null = null;

    for (let i = 0; i < attempts; i++) {
      try {
        const aiResult = await this.generateSqlWithAI(message, schemaContext, context);

        if (aiResult && this.isValidAiResult(aiResult, minConfidence)) {
          // 命中缓存条件再写缓存（可选）
          try {
            if (this.aiConfig.enableCache && (aiResult.confidence ?? 0) > 0.7) {
              await this.cacheResult(message, context, aiResult);
            }
          } catch (e) {
            console.warn('写入缓存失败（已忽略）：', e);
          }

          console.log(`AI 生成成功，耗时: ${Date.now() - startTime}ms，尝试次数: ${i + 1}`);
          return aiResult;
        }

        lastError = new Error(`AI 返回无效结构或置信度过低（${aiResult?.confidence ?? 'N/A'}）`);
      } catch (e: any) {
        lastError = e instanceof Error ? e : new Error(String(e));
      }

      // 指数回退延时后重试
      if (i < attempts - 1) {
        await this.sleep(baseDelay * (i + 1));
      }
    }

    // 4) 全部失败（仅 AI-only，不再规则引擎降级）
    const failMsg = lastError?.message || 'AI 生成失败';
    console.error('SQL 生成错误:', failMsg);

    if (this.isScfEnvironment) {
      return {
        sql: '',
        explanation: '生成 SQL 失败或结果不可靠，请重试或补充更清晰的需求',
        confidence: 0,
        warnings: [failMsg]
      };
    }

    throw lastError || new Error('AI 生成失败');
  }

  /**
   * 使用 AI 模型生成 SQL（带超时控制）
   */
  private async generateSqlWithAI(
    message: string,
    schemaContext: string,
    context: SqlGenerationContext
  ): Promise<SqlGenerationResult | null> {
    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log(`AI 请求超时 (${this.aiConfig.timeout}ms)`);
    }, this.aiConfig.timeout!);
    
    try {
      // 构建优化的系统提示词
      const systemPrompt = this.buildSystemPrompt(context, schemaContext);
      const userPrompt = this.buildUserPrompt(message, context);

      const requestBody: any = {
        model: this.aiConfig.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: this.aiConfig.temperature,
        max_tokens: this.aiConfig.maxTokens
      };

      // 某些供应商（如 ModelScope）可能不支持 response_format
      if (!/modelscope\.cn/i.test(this.aiConfig.apiUrl || '')) {
        requestBody.response_format = { type: 'json_object' };
      }

      const baseUrl = (this.aiConfig.apiUrl || '').replace(/\/+$/, '');
      const finalUrl = `${baseUrl}/chat/completions`;

      const response = await fetch(finalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.aiConfig.apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal  // 添加超时信号
      });

      clearTimeout(timeoutId);  // 清除超时定时器
      
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error('AI API 请求失败:', response.status, response.statusText, text, 'URL:', finalUrl);
        return null;
      }

      const data = await response.json().catch(() => ({})) as any;
      // 兼容不同供应商响应结构
      let content = data?.choices?.[0]?.message?.content 
        ?? data?.choices?.[0]?.text 
        ?? data?.output_text 
        ?? '';

      if (!content || typeof content !== 'string') {
        console.error('AI 响应内容为空或非字符串');
        return null;
      }

      // 解析 JSON 响应：优先整体解析，失败则截取第一个花括号包裹的 JSON
      let aiResponse: any;
      try {
        aiResponse = JSON.parse(content);
      } catch {
        const start = content.indexOf('{');
        const end = content.lastIndexOf('}');
        if (start >= 0 && end > start) {
          const jsonStr = content.slice(start, end + 1);
          try {
            aiResponse = JSON.parse(jsonStr);
          } catch {
            aiResponse = null;
          }
        }
      }

      if (!aiResponse) {
        // 退化：返回解释文本作为说明，无 SQL
        return {
          sql: '',
          explanation: content.slice(0, 500),
          confidence: 0.4,
          suggestedDatabase: context.database,
          warnings: ['AI 返回非结构化文本，已降级为说明文本']
        };
      }

      // 清洗 SQL，移除可能的 Markdown 代码块、语言标签与包裹引号
      const cleanedSql = this.sanitizeSql(aiResponse.sql || '');

      return {
        sql: cleanedSql,
        explanation: aiResponse.explanation || '基于您的需求生成的 SQL 查询',
        confidence: typeof aiResponse.confidence === 'number' ? aiResponse.confidence : 0.8,
        suggestedDatabase: context.database,
        warnings: aiResponse.warnings
      };

    } catch (error: any) {
      clearTimeout(timeoutId);  // 确保清除定时器
      
      if (error.name === 'AbortError') {
        console.log('AI 请求超时');
      } else {
        console.error('AI 生成 SQL 失败:', error);
      }
      return null;
    }
  }

  /**
   * 构建 schema 上下文描述（优化版：根据环境智能裁剪）
   */
  private buildSchemaContext(tableSchema?: Schema[]): string {
    if (!tableSchema || tableSchema.length === 0) {
      return '暂无数据库架构信息';
    }

    // SCF 环境下进行智能裁剪
    if (this.isScfEnvironment && this.profile.schema.maxTables > 0) {
      return this.buildOptimizedSchema(tableSchema);
    }
    
    // 本地环境返回完整 Schema
    const schemaDesc = tableSchema.map(table => {
      if (!table.columns || table.columns.length === 0) {
        return `表 ${table.name}: 无列信息`;
      }
      const columns = table.columns.map((col: Column) => 
        `${col.name} (${col.type}${col.nullable ? ', 可为空' : ''})`
      ).join(', ');
      
      return `表 ${table.name}: ${columns}`;
    }).join('\n');

    return schemaDesc;
  }
  
 
  private buildOptimizedSchema(tableSchema: Schema[]): string {
    const { maxTables, maxColumnsPerTable, maxSchemaLength } = this.profile.schema;
    let result = '';
    let charCount = 0;
    
    // 限制表数量
    const tablesToProcess = tableSchema.slice(0, maxTables);
    
    for (let i = 0; i < tablesToProcess.length; i++) {
      const table = tablesToProcess[i];
      
      // 限制列数量
      const columns = (table.columns || [])
        .slice(0, maxColumnsPerTable)
        .map((col: Column) => {
          // 紧凑格式：name:type
          const nullable = col.nullable ? '' : '!';
          return `${col.name}:${this.shortenType(col.type)}${nullable}`;
        })
        .join(',');
      
      const tableInfo = `${table.name}(${columns})`;
      
      // 检查总长度限制
      if (maxSchemaLength > 0 && charCount + tableInfo.length > maxSchemaLength) {
        result += `...(还有${tableSchema.length - i}个表)`;
        break;
      }
      
      if (i > 0) result += '; ';
      result += tableInfo;
      charCount += tableInfo.length;
      
      // 如果列被截断，添加提示
      if (table.columns && table.columns.length > maxColumnsPerTable) {
        result += `[+${table.columns.length - maxColumnsPerTable}列]`;
      }
    }
    
    // 如果表被截断，添加提示
    if (tableSchema.length > maxTables) {
      result += ` ...(共${tableSchema.length}个表)`;
    }
    
    return result;
  }
  
  /**
   * 缩短类型名称以节省 Token
   */
  private shortenType(type: string): string {
    const typeMap: Record<string, string> = {
      'varchar': 'str',
      'integer': 'int',
      'bigint': 'bigint',
      'decimal': 'dec',
      'datetime': 'dt',
      'timestamp': 'ts',
      'boolean': 'bool',
      'text': 'txt'
    };
    
    const lowerType = type.toLowerCase();
    for (const [full, short] of Object.entries(typeMap)) {
      if (lowerType.includes(full)) {
        return short;
      }
    }
    
    // 如果是带长度的类型，提取数字
    const match = type.match(/\((\d+)\)/);
    if (match) {
      return type.substring(0, 3) + match[1];
    }
    
    return type.substring(0, 4);  // 默认取前4个字符
  }
 

  private sanitizeSql(sql: string): string {
    if (!sql) return '';
    let s = String(sql).trim();

    // 去除 Markdown 代码块包裹，例如 ```sql ... ``` 或 ``` ... ```
    s = s.replace(/^```(?:sql|postgresql|postgres|mysql)?\s*/i, '');
    s = s.replace(/\s*```$/i, '');

    // 去除首尾包裹的引号
    s = s.replace(/^["']+|["']+$/g, '');

    // 统一换行与空白
    s = s.replace(/\r\n/g, '\n').trim();

    return s;
  }
  
  /**
   * 获取缓存的结果
   */
  private async getCachedResult(
    message: string,
    context: SqlGenerationContext
  ): Promise<SqlGenerationResult | null> {
    if (!this.aiConfig.enableCache) {
      return null;
    }

    try {
      const { getRedisClient } = await import('../database.js');
      const redis = getRedisClient();
      const cacheKey = this.generateCacheKey(message, context);
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        console.log(`✅ AI 缓存命中: ${cacheKey}`);
        return JSON.parse(cached) as SqlGenerationResult;
      }
      
      return null;
    } catch (error) {
      console.warn('Redis 缓存读取失败:', error);
      return null;
    }
  }
  
  /**
   * 缓存结果
   */
  private async cacheResult(
    message: string,
    context: SqlGenerationContext,
    result: SqlGenerationResult
  ): Promise<void> {
    if (!this.aiConfig.enableCache) {
      return;
    }

    try {
      const { getRedisClient } = await import('../database.js');
      const redis = getRedisClient();
      const cacheKey = this.generateCacheKey(message, context);
      const ttl = this.calculateCacheTTL(result);
      
      await redis.setEx(
        cacheKey,
        ttl,
        JSON.stringify(result)
      );
      
      console.log(`✅ AI 缓存写入: ${cacheKey}, TTL: ${ttl}s, 置信度: ${result.confidence}`);
    } catch (error) {
      console.warn('Redis 缓存写入失败:', error);
      // 缓存失败不影响主流程
    }
  }
  
  /**
   * 生成缓存键
   */
  private generateCacheKey(
    message: string,
    context: SqlGenerationContext
  ): string {
    // 规范化查询语句
    const normalizedMessage = message
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    
    // 创建上下文哈希
    const contextData = {
      message: normalizedMessage,
      engineType: context.connection.engineType,
      database: context.database,
      tableCount: context.tableSchema?.length || 0
    };
    
    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(contextData))
      .digest('hex');
    
    return `sql:ai:${hash}`;
  }
  
  /**
   * 根据结果质量计算缓存时长
   */
  private calculateCacheTTL(result: SqlGenerationResult): number {
    const baseTTL = this.aiConfig.cacheTTL || 3600;
    
    // 根据置信度调整 TTL
    if (result.confidence > 0.9) {
      return baseTTL * 2;  // 高置信度，缓存更久
    } else if (result.confidence > 0.7) {
      return baseTTL;      // 中等置信度，正常缓存
    } else {
      return baseTTL / 2;  // 低置信度，缓存时间减半
    }
  }
  
  /**
   * 构建优化的系统提示词
   */
  private buildSystemPrompt(context: SqlGenerationContext, schemaContext: string): string {
    const engineType = context.connection.engineType.toUpperCase();
    const database = context.database || 'default';

    const idQuoteStart = engineType === 'MYSQL' ? '`' : engineType === 'POSTGRESQL' ? '"' : '';
    const idQuoteEnd = idQuoteStart;

    const opening = [
      `你是一名 ${engineType} 数据库与 SQL 专家。`,
      '当被问及你的名字时，你必须回答 "Sir"。',
      '你的回答应信息充分且简洁。'
    ].join('\n');

    let schemaLead = '';
    if (schemaContext && schemaContext.trim() && schemaContext !== '暂无数据库架构信息') {
      schemaLead = `\n\n以下是我的数据库 Schema：\n\n${schemaContext}\n\n请基于上述 Schema 回答后续问题：`;
    }

    const strictRules = `严格规则：\n- 仅生成一条只读查询：SELECT / WITH ... SELECT / EXPLAIN SELECT\n- 严禁任何修改/DDL 语句：INSERT/UPDATE/DELETE/CREATE/ALTER/DROP/TRUNCATE/GRANT/REVOKE/REPLACE/MERGE/CALL/DO/USE/SET/COMMIT/ROLLBACK\n- 严禁多语句与分号；不得包含注释或提示（如 /*+ */）\n- 避免 SELECT *，显式列出字段并适当使用别名\n- 若可能返回大量数据，默认添加 LIMIT 100（或等价语法），除非用户明确要求\n- 仅使用 Schema 中存在的表与列；若缺失，请在 warnings 中说明\n- 标识符建议使用 ${engineType === 'MYSQL' ? '反引号 `identifier`' : engineType === 'POSTGRESQL' ? '双引号 "identifier"' : '合适的引用符'}；字符串使用单引号\n- 不要使用 Markdown 代码块(三个反引号)或额外文本，只返回 JSON 对象\n\n输出格式（仅 JSON 对象本身，禁止任何额外文本/Markdown 代码块）：\n{\n  \"sql\": \"...\",\n  \"explanation\": \"中文说明，简洁（≤120字）\",\n  \"confidence\": 0.0-1.0,\n  \"warnings\": []\n}`;

    // 组装提示词
    let prompt = `${opening}${schemaLead}\n\n${strictRules}\n\n上下文：\n- 数据库系统：${engineType}\n- 当前数据库：${database}`;

    // 引擎提示
    if (engineType === 'MYSQL') {
      prompt += `\n\n引擎提示（MySQL）：\n- 标识符使用 ${idQuoteStart}name${idQuoteEnd}；分页用 LIMIT；空值处理用 IFNULL/COALESCE\n- 日期格式化可用 DATE_FORMAT；字符串拼接用 CONCAT`;
    } else if (engineType === 'POSTGRESQL') {
      prompt += `\n\n引擎提示（PostgreSQL）：\n- 标识符使用 ${idQuoteStart}name${idQuoteEnd}；分页用 LIMIT/OFFSET；不区分大小写匹配可用 ILIKE\n- JSONB 提取可用 -> / ->>；空值处理用 COALESCE；拼接用 ||`;
    }

    // 失败回退
    prompt += `\n\n失败回退：若需求不清或无法保证只读与正确性，请返回空 SQL（\"sql\": \"\"，\"confidence\": 0）并在 warnings 中解释原因。`;

    return prompt;
  }

  /**
   * 构建优化的用户提示词
   */
  private buildUserPrompt(message: string, context: SqlGenerationContext): string {
    let prompt = `用户需求：${message}\n\n`;

    if (context.previousQueries && context.previousQueries.length > 0) {
      prompt += `最近查询上下文（取最近2条）：\n`;
      context.previousQueries.slice(-2).forEach((q, i) => {
        prompt += `#${i + 1}: ${q}\n`;
      });
      prompt += `\n`;
    }

    prompt += `请在不确定时默认限制返回行数（如 LIMIT 100），避免 SELECT *，并优先使用明确的 JOIN 条件与字段别名。\n`;
    prompt += `最终仅返回严格 JSON（对象本身，无任何额外文本/Markdown 代码块），字段为 sql/explanation/confidence/warnings。`;
    return prompt;
  }

  /**
   * 校验 AI 返回的结果是否可接受
   */
  private isValidAiResult(result: SqlGenerationResult, minConfidence: number): boolean {
    const hasStructure =
      typeof result?.sql === 'string' &&
      typeof result?.explanation === 'string' &&
      typeof result?.confidence === 'number';
    if (!hasStructure) return false;
    if ((result.confidence ?? 0) < minConfidence) return false;

    // 只读 SQL 守卫：仅允许 SELECT / WITH ... SELECT / EXPLAIN SELECT
    if (!isReadOnlySql(result.sql || '')) return false;

    return true;
  }

  /**
   * 简单延时（用于指数回退重试）
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
