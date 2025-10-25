import { BaseApiService } from './BaseApiService';
import type { 
  Connection, 
  ExecutionResult, 
  Schema,
  ChatMessage 
} from '../types';
import { STORAGE_KEYS } from '../config/constants';
import { cleanAccessKey, cleanAccessId } from '@/utils/cleanAccessKey';

class SqlApiService extends BaseApiService {
  constructor() {
    super(import.meta.env.VITE_API_URL || '');
  }


  protected getAuthHeaders(): Record<string, string> {
    const headers = super.getAuthHeaders();
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const rawAccessId = userInfo.access_id;
      const rawKey = localStorage.getItem('accessKey');
      
      // 使用专门的清理函数处理 AccessID 和 AccessKey
      const accessId = cleanAccessId(rawAccessId);
      const accessKey = cleanAccessKey(rawKey);
      
      if (accessId && accessKey) {
        headers['AccessID'] = accessId;
        headers['AccessKey'] = accessKey;
        
        // 调试日志
        if (accessKey.length !== 64) {
          console.error('清理后的 AccessKey 长度仍然不正确:', {
            expected: 64,
            actual: accessKey.length,
            rawLength: rawKey?.length
          });
        }
      }
    } catch (error) {
      console.warn('Failed to get auth headers:', error);
    }
    
    return headers;
  }

  /**
   * 测试数据库连接
   * @throws 连接失败时抛出详细错误信息
   */
  async testConnection(connection: Connection): Promise<boolean> {
    await this.post('/api/sql/connection/test', { connection });
    return true;
  }

  /**
   * 执行 SQL 查询
   */
  async executeQuery(
    connection: Connection,
    database: string,
    statement: string
  ): Promise<ExecutionResult> {
    return this.post<ExecutionResult>('/api/sql/execute', {
      connection,
      database,
      statement,
    });
  }

  /**
   * 获取数据库列表
   */
  async getDatabases(connection: Connection): Promise<string[]> {
    return this.post<string[]>('/api/sql/databases', { connection });
  }

  /**
   * 获取数据库架构
   */
  async getTableSchema(
    connection: Connection,
    database: string
  ): Promise<Schema[]> {
    return this.post<Schema[]>('/api/sql/schema', {
      connection,
      database,
    });
  }

  /**
   * SQL 聊天
   */
  async sendChatMessage(
    message: string,
    connection?: Connection,
    database?: string
  ): Promise<ChatMessage> {
    return this.post<ChatMessage>('/api/sql/chat', {
      message,
      connection,
      database,
    });
  }

  /**
   * 保存连接配置（使用 localStorage）
   */
  saveConnection(connection: Connection): void {
    const connections = this.getSavedConnections();
    const existingIndex = connections.findIndex(c => c.id === connection.id);
    
    if (existingIndex >= 0) {
      connections[existingIndex] = connection;
    } else {
      connections.push(connection);
    }
    
    localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(connections));
  }

  /**
   * 获取保存的连接配置
   */
  getSavedConnections(): Connection[] {
    const saved = localStorage.getItem(STORAGE_KEYS.CONNECTIONS);
    return saved ? JSON.parse(saved) : [];
  }

  /**
   * 删除连接配置
   */
  deleteConnection(connectionId: string): void {
    const connections = this.getSavedConnections();
    const filtered = connections.filter(c => c.id !== connectionId);
    localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(filtered));
  }

  /**
   * 将查询结果可视化
   */
  async visualizeQueryResult(params: {
    data: any[][];
    schema: Array<{ name: string; type: string }>;
    chartType?: string;
    title?: string;
    axisLabels?: { x?: string; y?: string };
    style?: {
      theme?: string;
      customColors?: string[];
      animation?: boolean;
      responsive?: boolean;
      showLegend?: boolean;
    };
  }): Promise<{
    panelUrl: string;
    panelId: string;
    chartType: string;
    chartTypeName: string;
  }> {
    return this.post('/api/sql/visualize', params);
  }
}

export const sqlApiService = new SqlApiService();