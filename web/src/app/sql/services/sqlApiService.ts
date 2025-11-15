import { BaseApiService } from './BaseApiService';
import type {
  Connection,
  ExecutionResult,
  Schema,
  ChatMessage
} from '../types';
import { STORAGE_KEYS } from '../config/constants';

class SqlApiService extends BaseApiService {
  constructor() {
    super(import.meta.env.VITE_API_URL || '');
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

  /**
   * 从SQL查询结果生成图表
   * 新的 API：立即生成图表、创建Panel、扣费，并可选地添加到Dashboard
   */
  async generateChart(params: {
    sql: string;
    queryResult: {
      columns: string[];
      rows: any[];
    };
    chartConfig: {
      type: string;
      title: string;
      theme?: string;
      xAxis?: string;
      yAxis?: string;
    };
    dashboardId?: string;
  }): Promise<{
    chartId: string;
    panelId: string;
    panelUrl: string;
    ossUrl: string;
    addedToDashboard: boolean;
    dashboardId?: string;
    message: string;
    quota: {
      total: number;
      used: number;
      remaining: number;
    };
  }> {
    return this.post('/api/sql/generate-chart', params);
  }
}

export const sqlApiService = new SqlApiService();