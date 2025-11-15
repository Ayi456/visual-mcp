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
  'combo': '组合图',
  'funnel': '漏斗图',
  'sankey': '桑基图',
  'treemap': '矩形树图',
  'gauge': '仪表盘',
  'waterfall': '瀑布图',
  'boxplot': '箱线图',
  'auto': '自动'
};

// 多系列图表调色板 - 确保颜色区分度高
export const MULTI_SERIES_COLOR_PALETTE = [
  {
    border: 'rgb(54, 162, 235)',      // 蓝色
    background: 'rgba(54, 162, 235, 0.2)'
  },
  {
    border: 'rgb(255, 99, 132)',      // 红色
    background: 'rgba(255, 99, 132, 0.2)'
  },
  {
    border: 'rgb(75, 192, 192)',      // 青色
    background: 'rgba(75, 192, 192, 0.2)'
  },
  {
    border: 'rgb(255, 206, 86)',      // 黄色
    background: 'rgba(255, 206, 86, 0.2)'
  },
  {
    border: 'rgb(153, 102, 255)',     // 紫色
    background: 'rgba(153, 102, 255, 0.2)'
  },
  {
    border: 'rgb(255, 159, 64)',      // 橙色
    background: 'rgba(255, 159, 64, 0.2)'
  },
  {
    border: 'rgb(201, 203, 207)',     // 灰色
    background: 'rgba(201, 203, 207, 0.2)'
  },
  {
    border: 'rgb(83, 211, 87)',       // 绿色
    background: 'rgba(83, 211, 87, 0.2)'
  },
  {
    border: 'rgb(237, 100, 166)',     // 粉色
    background: 'rgba(237, 100, 166, 0.2)'
  },
  {
    border: 'rgb(131, 232, 90)',      // 亮绿色
    background: 'rgba(131, 232, 90, 0.2)'
  }
];

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
