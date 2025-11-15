/**
 * Dashboard相关TypeScript类型定义
 */

import type { EChartsOption } from 'echarts';

export interface Dashboard {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  theme: 'default' | 'dark' | 'business' | 'colorful';
  layoutConfig: LayoutConfig;
  isPublic: boolean;
  shareToken?: string;
  panelUrl?: string;
  createdAt: string;
  updatedAt: string;
  chartCount?: number;
  charts?: DashboardChart[];
}

export interface LayoutConfig {
  gridCols: number;
  rowHeight: number;
  charts: LayoutItem[];
}

export interface LayoutItem {
  i: string; // chart id
  x: number;
  y: number;
  w: number; // width (1-12)
  h: number; // height (number of rows)
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

export interface DashboardChart {
  id: string;
  dashboardId: string;
  chartTitle: string;
  chartType: ChartType;
  // 实际存储的是 EChartsOption（早期命名为 ChartJsConfig，为兼容保留类型名）
  chartConfig: ChartJsConfig;
  dataSource: DataSource;
  position: ChartPosition;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChartPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DataSource {
  type: 'sql-query' | 'api' | 'static';
  connectionId?: string;
  query?: string;
  schema: ColumnSchema[];
  data: any[][];
  refreshInterval?: number;
  lastRefreshTime?: string;
}

export interface ColumnSchema {
  name: string;
  type: string;
}

export type ChartType =
  | 'line'
  | 'bar'
  | 'pie'
  | 'scatter'
  | 'area'
  | 'radar'
  | 'bubble'
  | 'heatmap'
  | 'auto';

// 图表配置类型（当前统一为 EChartsOption，沿用旧名 ChartJsConfig 以兼容旧代码注释）
export type ChartJsConfig = EChartsOption;

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DashboardListResponse {
  id: string;
  title: string;
  description?: string;
  theme: string;
  isPublic: boolean;
  panelUrl?: string;
  createdAt: string;
  updatedAt: string;
  chartCount: number;
}

export interface CreateDashboardRequest {
  title: string;
  description?: string;
  theme?: string;
  layoutConfig?: LayoutConfig;
  charts?: Partial<DashboardChart>[];
}

export interface UpdateDashboardRequest {
  title: string;
  description?: string;
  theme: string;
  layoutConfig: LayoutConfig;
  charts: Partial<DashboardChart>[];
}

export interface PublishDashboardResponse {
  panelUrl: string;
  shareToken: string;
  message: string;
}

// Chart configuration for adding new charts
export interface ChartConfig {
  type: ChartType;
  title: string;
  query?: string;
  config: {
    xAxis?: string;
    yAxis?: string;
    data?: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: any[];
        [key: string]: any;
      }>;
    };
    [key: string]: any;
  };
}
