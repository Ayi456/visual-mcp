// 图表相关的类型定义

// 数据类型定义
export type DataType = 'number' | 'string' | 'date' | 'boolean';

// 图表类型定义
export type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'radar' | 'area' | 'heatmap' | 'bubble' | 'auto';

// Schema字段接口
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