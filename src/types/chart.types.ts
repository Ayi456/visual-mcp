// 图表相关的类型定义

// 数据类型定义
export type DataType = 'number' | 'string' | 'date' | 'boolean';

// 图表类型定义
export type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'radar' | 'area' | 'heatmap' | 'bubble' | 'auto' | 'combo' | 'funnel' | 'sankey' | 'treemap' | 'gauge' | 'waterfall' | 'boxplot';

export interface SchemaField {
  name: string;
  type: DataType;
  description?: string;
}

// 主题配置接口
export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    grid: string;
    accent: string[];
  };
  fonts: {
    title: string;
    body: string;
    size: {
      title: number;
      body: number;
      axis: number;
    };
  };
  chart: {
    borderWidth: number;
    pointRadius: number;
    tension: number;
    opacity: number;
  };
}

// 样式配置接口
export interface StyleConfig {
  theme?: string;
  customColors?: string[];
  animation?: boolean;
  responsive?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltips?: boolean;
  lineWidth?: number;
  pointStyle?: 'circle' | 'cross' | 'crossRot' | 'dash' | 'line' | 'rect' | 'rectRounded' | 'rectRot' | 'star' | 'triangle';
  pointRadius?: number;
  tension?: number;
  fill?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  isMultiSeries?: boolean;
  // 数据标签配置
  dataLabels?: {
    show?: boolean;
    position?: 'top' | 'center' | 'bottom' | 'inside' | 'outside';
    formatter?: string;
  };
  // 网格线样式
  gridStyle?: {
    type?: 'solid' | 'dashed' | 'dotted';
    opacity?: number;
  };
  // 缩放控制
  zoom?: {
    enabled?: boolean;
    type?: 'x' | 'y' | 'xy';
  };
}

// 可视化数据接口
export interface VisualizationData {
  data: any[][];
  schema: SchemaField[];
  chartType: ChartType;
  title?: string;
  axisLabels?: {
    x?: string;
    y?: string;
  };
  style?: StyleConfig;
}