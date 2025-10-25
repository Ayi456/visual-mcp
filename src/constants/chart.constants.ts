import { ChartType } from '../types/chart.types.js';

// 图表类型名称映射
export const CHART_TYPE_NAMES: Record<ChartType, string> = {
  'line': '折线图',
  'bar': '柱状图',
  'pie': '饼图',
  'scatter': '散点图',
  'radar': '雷达图',
  'area': '面积图',
  'heatmap': '热力图',
  'bubble': '气泡图',
  'auto': '自动'
};

// HTML保存配置
export const HTML_SAVE_CONFIG = {
  baseDir: process.cwd(),
  subDir: 'visualization-reports',
};

// 默认图表配置
export const DEFAULT_CHART_CONFIG = {
  animation: true,
  responsive: true,
  showLegend: true,
  showGrid: true,
  showTooltips: true,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {}
  }
};
