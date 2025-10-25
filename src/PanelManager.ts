import { 
  Panel, 
  PanelConfig, 
  PanelManagerOptions, 
  AddPanelResult, 
  PanelInfo
} from './types.js';
import { 
  generateSecureId, 
  isValidId, 
  calculateExpiryTime, 
  isExpired,
  generateCacheKey,
  formatDateTime
} from './utils.js';
import { executeMysqlQuery, executeRedisCommand, getRedisClient } from './database.js';
import { ValidationError } from './utils/errors.js';

export class PanelManager {
  private options: Required<PanelManagerOptions>;
  private baseUrl: string;

  constructor(baseUrl: string, options: PanelManagerOptions = {}) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.options = {
      defaultTtl: options.defaultTtl || 24 * 60 * 60 * 7 , // 7天
      maxTtl: options.maxTtl || 24 * 60 * 60 * 30,  // 30天
      idLength: options.idLength || 16
    };
  }

  
  async addPanel(osspath: string, options?: {
    user_id?: string;
    title?: string;
    description?: string;
    is_public?: boolean;
    ttl?: number;
  }): Promise<AddPanelResult> {
    const finalTtl = options?.ttl || this.options.defaultTtl;
    
    // 验证输入参数
    if (!osspath || typeof osspath !== 'string' || osspath.length === 0) {
      throw new Error('文件路径不能为空');
    }

    if (finalTtl > this.options.maxTtl) {
      throw new Error(`TTL不能超过最大值 ${this.options.maxTtl} 秒`);
    }

    // 生成唯一ID
    const id = await this.generateUniqueId();
    const expiresAt = calculateExpiryTime(finalTtl);

    try {
      await this.insertPanelToDatabase(id, osspath, expiresAt, {
        user_id: options?.user_id,
        title: options?.title,
        description: options?.description,
        is_public: options?.is_public || false
      });

      
      await this.cachePanelData(id, osspath, finalTtl);

      
      const url = `${this.baseUrl}/panel/${id}`;

      return {
        id,
        url,
        osspath,
        title: options?.title,
        description: options?.description,
        is_public: options?.is_public || false,
        expires_at: expiresAt,
        ttl: finalTtl
      };
    } catch (error) {
      // 如果缓存写入失败，尝试清理数据库记录
      try {
        await this.deletePanelFromDatabase(id);
      } catch (cleanupError) {
        console.error('清理数据库记录失败', cleanupError);
      }
      throw error;
    }
  }


  async getPanel(id: string): Promise<string | null> {
    if (!isValidId(id, this.options.idLength)) {
      return null;
    }

    try {
      // 1. 先查询Redis缓存
      const cachedPath = await this.getCachedPanelData(id);
      if (cachedPath) {
        const panel = await this.getPanelFromDatabase(id);
        if (!panel || isExpired(panel.expires_at)) {
          this.markPanelAsExpired(id).catch(err =>
            console.error('标记Panel为过期失败', err)
          );
          return null;
        }

        // 未过期，更新访问计数并返回缓存的路径
        this.updateVisitCount(id).catch(err =>
          console.error('更新访问计数失败:', err)
        );
        return cachedPath;
      }

      // 2. 缓存未命中，查询MySQL数据库
      const panel = await this.getPanelFromDatabase(id);
      if (!panel) {
        return null;
      }

      // 3. 检查是否过期
      if (isExpired(panel.expires_at)) {
        // 标记为过期并从缓存中删除
        this.markPanelAsExpired(id).catch(err => 
          console.error('标记Panel为过期失败', err)
        );
        return null;
      }

      // 4. 缓存预热：将数据写回Redis
      const remainingTtl = Math.floor((panel.expires_at.getTime() - Date.now()) / 1000);
      if (remainingTtl > 0) {
        this.cachePanelData(id, panel.osspath, remainingTtl).catch(err => 
          console.error('缓存预热失败:', err)
        );
      }

      // 5. 更新访问计数
      this.updateVisitCount(id).catch(err => 
        console.error('更新访问计数失败:', err)
      );

      return panel.osspath;
    } catch (error) {
      console.error('获取Panel失败:', error);
      return null;
    }
  }

  
  /**
   * 获取用户 Panels 列表
   */
  async getUserPanels(args: import('./types.js').GetUserPanelsArgs): Promise<import('./types.js').UserPanelsResult> {
    const { user_id, page = 1, limit = 10, status = 'all', is_public } = args;
    
    // 验证参数
    if (!user_id) {
      throw new Error('用户ID不能为空');
    }
    
    // 严格验证分页参数，防止SQL注入
    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)));
    
    if (!Number.isFinite(safePage) || !Number.isFinite(safeLimit)) {
      throw new Error('分页参数无效');
    }

    try {
      // 构建查询条件
      let whereConditions = ['user_id = ?'];
      let queryParams: any[] = [user_id];
      
      // 状态过滤
      if (status === 'active') {
        whereConditions.push('status = ? AND expires_at > NOW()');
        queryParams.push('active');
      } else if (status === 'expired') {
        whereConditions.push('(status = ? OR expires_at <= NOW())');
        queryParams.push('expired');
      }
      
      // 公开状态过滤
      if (is_public !== undefined) {
        whereConditions.push('is_public = ?');
        queryParams.push(is_public ? 1 : 0);
      }
      
      const whereClause = whereConditions.join(' AND ');
      
      // 查询总数
      const countResult = await executeMysqlQuery<Array<{count: number}>>(
        `SELECT COUNT(*) as count FROM panels WHERE ${whereClause}`,
        queryParams
      );
      const total = countResult[0]?.count || 0;
      
      // 查询列表数据 - 使用安全的分页参数
      const offset = (safePage - 1) * safeLimit;
      const panels = await executeMysqlQuery<Panel[]>(
        `SELECT * FROM panels WHERE ${whereClause} ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${offset}`,
        queryParams
      );
      
      // 转换为 PanelInfo 格式并检查缓存状态
      const panelInfos: import('./types.js').PanelInfo[] = await Promise.all(
        panels.map(async (panel) => {
          const is_cached = await this.isPanelCached(panel.id);
          return {
            id: panel.id,
            user_id: panel.user_id,
            osspath: panel.osspath,
            title: panel.title,
            description: panel.description,
            is_public: panel.is_public,
            created_at: panel.created_at,
            expires_at: panel.expires_at,
            visit_count: panel.visit_count,
            status: panel.status,
            is_cached
          };
        })
      );
      
      return {
        panels: panelInfos,
        total,
        page,
        limit,
        has_more: total > page * limit
      };
      
    } catch (error) {
      throw new Error(`获取用户Panels失败: ${error}`);
    }
  }

  /**
   * 更新 Panel 信息
   */
  async updatePanelInfo(panelId: string, updates: {
    title?: string;
    description?: string;
    is_public?: boolean;
  }): Promise<void> {
    if (!panelId) {
      throw new ValidationError('Panel ID不能为空');
    }

    // 构建更新字段
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (updates.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(updates.title);
    }
    
    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(updates.description);
    }
    
    if (updates.is_public !== undefined) {
      updateFields.push('is_public = ?');
      updateValues.push(updates.is_public);
    }
    
    if (updateFields.length === 0) {
      throw new ValidationError('没有提供要更新的字段');
    }
    
    updateFields.push('updated_at = NOW()');
    updateValues.push(panelId);
    
    try {
      const result = await executeMysqlQuery(
        `UPDATE panels SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
      
      // 检查是否实际更新了记录
      if ((result as any).affectedRows === 0) {
        throw new ValidationError('Panel不存在或无权限修改');
      }
      
    } catch (error) {
      throw new Error(`更新Panel信息失败: ${error}`);
    }
  }

  async getPanelInfo(id: string): Promise<PanelInfo | null> {
    if (!isValidId(id, this.options.idLength)) {
      throw new ValidationError('无效的Panel ID格式');
    }

    try {
      // 查询数据库获取完整信息
      const panel = await this.getPanelFromDatabase(id);
      if (!panel) {
        return null;
      }

      // 检查是否在缓存中
      const isCached = await this.isPanelCached(id);

      return {
        id: panel.id,
        user_id: panel.user_id,
        osspath: panel.osspath,
        title: panel.title,
        description: panel.description,
        is_public: panel.is_public,
        created_at: panel.created_at,
        expires_at: panel.expires_at,
        visit_count: panel.visit_count,
        status: isExpired(panel.expires_at) ? 'expired' : panel.status,
        is_cached: isCached
      };
    } catch (error) {
      throw new Error(`获取Panel信息失败: ${error}`);
    }
  }

  /**
   * 生成唯一ID
   */
  private async generateUniqueId(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const id = generateSecureId(this.options.idLength);
      
      // 检查ID是否已存�?
      const exists = await this.checkIdExists(id);
      if (!exists) {
        return id;
      }
      
      attempts++;
    }

    throw new Error('无法生成唯一ID，请稍后重试');
  }

  /**
   * 检查ID是否已存在
   */
  private async checkIdExists(id: string): Promise<boolean> {
    try {
      const result = await executeMysqlQuery<any[]>(
        'SELECT 1 FROM panels WHERE id = ? LIMIT 1',
        [id]
      );
      return result.length > 0;
    } catch (error) {
      throw new Error(`检查ID存在性失败: ${error}`);
    }
  }

  /**
   * 将Panel插入数据库
   */
  private async insertPanelToDatabase(
    id: string, 
    osspath: string, 
    expiresAt: Date,
    options?: {
      user_id?: string;
      title?: string;
      description?: string;
      is_public?: boolean;
    }
  ): Promise<void> {
    try {
      await executeMysqlQuery(
        'INSERT INTO panels (id, user_id, osspath, title, description, is_public, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          id, 
          options?.user_id || null, 
          osspath, 
          options?.title || null, 
          options?.description || null, 
          options?.is_public || false, 
          expiresAt
        ]
      );
    } catch (error) {
      throw new Error(`插入Panel到数据库失败: ${error}`);
    }
  }

  /**
   * 从数据库获取Panel
   */
  private async getPanelFromDatabase(id: string): Promise<Panel | null> {
    try {
      const result = await executeMysqlQuery<Panel[]>(
        'SELECT * FROM panels WHERE id = ? LIMIT 1',
        [id]
      );
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      throw new Error(`从数据库获取Panel失败: ${error}`);
    }
  }

  /**
   * 从数据库删除Panel
   */
  private async deletePanelFromDatabase(id: string): Promise<void> {
    try {
      await executeMysqlQuery(
        'DELETE FROM panels WHERE id = ?',
        [id]
      );
    } catch (error) {
      throw new Error(`从数据库删除Panel失败: ${error}`);
    }
  }

  /**
   * 缓存Panel数据到Redis
   */
  private async cachePanelData(id: string, osspath: string, ttl: number): Promise<void> {
    try {
      await executeRedisCommand(async () => {
        const client = getRedisClient();
        const key = generateCacheKey(id);
        await client.setEx(key, ttl, osspath);
      });
    } catch (error) {
      throw new Error(`缓存Panel数据失败: ${error}`);
    }
  }

  /**
   * 从Redis获取缓存的Panel数据
   */
  private async getCachedPanelData(id: string): Promise<string | null> {
    try {
      return await executeRedisCommand(async () => {
        const client = getRedisClient();
        const key = generateCacheKey(id);
        return await client.get(key);
      });
    } catch (error) {
      console.error('获取缓存Panel数据失败:', error);
      return null;
    }
  }

  /**
   * 检查Panel是否在缓存中
   */
  private async isPanelCached(id: string): Promise<boolean> {
    try {
      return await executeRedisCommand(async () => {
        const client = getRedisClient();
        const key = generateCacheKey(id);
        const exists = await client.exists(key);
        return exists === 1;
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * 更新访问计数
   */
  private async updateVisitCount(id: string): Promise<void> {
    try {
      await executeMysqlQuery(
        'UPDATE panels SET visit_count = visit_count + 1 WHERE id = ?',
        [id]
      );
    } catch (error) {
      throw new Error(`更新访问计数失败: ${error}`);
    }
  }

  /**
   * 标记Panel为过期
   */
  private async markPanelAsExpired(id: string): Promise<void> {
    try {
      // 更新数据库状态
      await executeMysqlQuery(
        'UPDATE panels SET status = "expired" WHERE id = ?',
        [id]
      );

      await executeRedisCommand(async () => {
        const client = getRedisClient();
        const key = generateCacheKey(id);
        await client.del(key);
      });
    } catch (error) {
      console.error('标记Panel为过期失败', error);
    }
  }
}
