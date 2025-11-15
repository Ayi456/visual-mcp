import { ThemeConfig, StyleConfig } from '../types/chart.types.js';

// 预设主题配置 - 专业配色方案
export const PRESET_THEMES: { [key: string]: ThemeConfig } = {
  default: {
    name: '默认主题',
    colors: {
      primary: '#2563eb',      // 专业蓝
      secondary: '#3b82f6',
      background: '#ffffff',
      text: '#1f2937',
      grid: 'rgba(107, 114, 128, 0.15)',
      accent: [
        '#2563eb',  // 蓝色
        '#dc2626',  // 红色
        '#16a34a',  // 绿色
        '#ea580c',  // 橙色
        '#9333ea',  // 紫色
        '#0891b2',  // 青色
        '#ca8a04',  // 金色
        '#64748b'   // 灰色
      ]
    },
    fonts: {
      title: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      size: {
        title: 16,
        body: 12,
        axis: 13
      }
    },
    chart: {
      borderWidth: 2,
      pointRadius: 4,
      tension: 0.3,
      opacity: 0.8
    }
  },
  dark: {
    name: '深色主题',
    colors: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      background: '#1f2937',
      text: '#f9fafb',
      grid: 'rgba(156, 163, 175, 0.2)',
      accent: [
        '#3b82f6',  // 蓝色
        '#ef4444',  // 红色
        '#10b981',  // 绿色
        '#f59e0b',  // 琥珀色
        '#8b5cf6',  // 紫色
        '#06b6d4',  // 青色
        '#f97316',  // 橙色
        '#6b7280'   // 灰色
      ]
    },
    fonts: {
      title: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      size: {
        title: 16,
        body: 12,
        axis: 13
      }
    },
    chart: {
      borderWidth: 2,
      pointRadius: 4,
      tension: 0.3,
      opacity: 0.85
    }
  },
  business: {
    name: '商务主题',
    colors: {
      primary: '#0f172a',
      secondary: '#1e293b',
      background: '#f8fafc',
      text: '#0f172a',
      grid: 'rgba(100, 116, 139, 0.15)',
      accent: [
        '#0f172a',  // 深蓝灰
        '#7c3aed',  // 专业紫
        '#0891b2',  // 商务青
        '#059669',  // 商务绿
        '#dc2626',  // 警示红
        '#ea580c',  // 强调橙
        '#4f46e5',  // 靛蓝
        '#64748b'   // 中性灰
      ]
    },
    fonts: {
      title: "'Inter', -apple-system, 'Segoe UI', 'Roboto', sans-serif",
      body: "'Inter', -apple-system, 'Segoe UI', 'Roboto', sans-serif",
      size: {
        title: 15,
        body: 11,
        axis: 12
      }
    },
    chart: {
      borderWidth: 1.5,
      pointRadius: 3,
      tension: 0.2,
      opacity: 0.75
    }
  },
  minimal: {
    name: '极简主题',
    colors: {
      primary: '#18181b',
      secondary: '#27272a',
      background: '#fafafa',
      text: '#18181b',
      grid: 'rgba(161, 161, 170, 0.12)',
      accent: [
        '#18181b',  // 黑色
        '#71717a',  // 灰色
        '#a1a1aa',  // 浅灰
        '#d4d4d8',  // 更浅灰
        '#52525b',  // 中灰
        '#3f3f46',  // 深灰
        '#27272a',  // 更深灰
        '#09090b'   // 最深
      ]
    },
    fonts: {
      title: "'SF Pro Display', -apple-system, 'Segoe UI', sans-serif",
      body: "'SF Pro Text', -apple-system, 'Segoe UI', sans-serif",
      size: {
        title: 14,
        body: 11,
        axis: 11
      }
    },
    chart: {
      borderWidth: 1,
      pointRadius: 2,
      tension: 0.1,
      opacity: 0.65
    }
  },
  vibrant: {
    name: '活力主题',
    colors: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      background: '#ffffff',
      text: '#111827',
      grid: 'rgba(107, 114, 128, 0.12)',
      accent: [
        '#7c3aed',  // 紫色
        '#ec4899',  // 粉色
        '#06b6d4',  // 青色
        '#10b981',  // 绿色
        '#f59e0b',  // 琥珀
        '#ef4444',  // 红色
        '#3b82f6',  // 蓝色
        '#8b5cf6'   // 紫罗兰
      ]
    },
    fonts: {
      title: "'Inter', -apple-system, 'Segoe UI', sans-serif",
      body: "'Inter', -apple-system, 'Segoe UI', sans-serif",
      size: {
        title: 16,
        body: 12,
        axis: 13
      }
    },
    chart: {
      borderWidth: 2.5,
      pointRadius: 5,
      tension: 0.4,
      opacity: 0.8
    }
  },
  print: {
    name: '打印友好主题',
    colors: {
      primary: '#000000',
      secondary: '#404040',
      background: '#ffffff',
      text: '#000000',
      grid: 'rgba(0, 0, 0, 0.1)',
      accent: [
        '#000000',  // 黑色
        '#4a4a4a',  // 深灰
        '#737373',  // 中灰
        '#a3a3a3',  // 浅灰
        '#2a2a2a',  // 暗灰
        '#5a5a5a',  // 灰
        '#8a8a8a',  // 亮灰
        '#b3b3b3'   // 浅灰
      ]
    },
    fonts: {
      title: "'Times New Roman', 'Georgia', serif",
      body: "'Times New Roman', 'Georgia', serif",
      size: {
        title: 14,
        body: 10,
        axis: 11
      }
    },
    chart: {
      borderWidth: 1.5,
      pointRadius: 3,
      tension: 0.1,
      opacity: 0.7
    }
  }
};

// 获取主题配置
export function getThemeConfig(themeName: string = 'default'): ThemeConfig {
  return PRESET_THEMES[themeName] || PRESET_THEMES.default;
}

// 应用主题到图表配置
export function applyThemeToChart(chartConfig: any, theme: ThemeConfig, style: StyleConfig = {}): any {
  // 应用颜色主题
  if (chartConfig.data && chartConfig.data.datasets) {
    chartConfig.data.datasets.forEach((dataset: any, index: number) => {
      const colorIndex = index % theme.colors.accent.length;
      const accentColor = style.customColors?.[index] || theme.colors.accent[colorIndex];

      // 根据图表类型应用不同的颜色策略
      if (chartConfig.type === 'pie') {
        dataset.backgroundColor = theme.colors.accent.slice(0, dataset.data.length);
        dataset.borderColor = theme.colors.background;
      } else if (chartConfig.type === 'line' || chartConfig.type === 'area') {
        if (style.isMultiSeries && dataset.borderColor) {
          dataset.pointBorderColor = dataset.pointBorderColor || theme.colors.background;
        } else {
          dataset.borderColor = accentColor;
          dataset.backgroundColor = accentColor.replace(')', ', 0.3)').replace('rgb', 'rgba');
          dataset.pointBackgroundColor = accentColor;
          dataset.pointBorderColor = theme.colors.background;
          dataset.pointBorderWidth = theme.chart.borderWidth;
          dataset.pointRadius = theme.chart.pointRadius;
          dataset.tension = theme.chart.tension;
        }
      } else {
        dataset.backgroundColor = accentColor.replace(')', ', ' + theme.chart.opacity + ')').replace('rgb', 'rgba');
        dataset.borderColor = accentColor;
        dataset.borderWidth = theme.chart.borderWidth;
      }
    });
  }

  // 应用字体和样式
  if (chartConfig.options) {
    // 标题样式
    if (chartConfig.options.plugins?.title) {
      chartConfig.options.plugins.title.font = {
        family: theme.fonts.title,
        size: theme.fonts.size.title
      };
      chartConfig.options.plugins.title.color = theme.colors.text;
    }

    // 图例样式
    if (chartConfig.options.plugins?.legend) {
      chartConfig.options.plugins.legend.labels = {
        font: {
          family: theme.fonts.body,
          size: theme.fonts.size.body
        },
        color: theme.colors.text
      };
    }

    // 坐标轴样式
    if (chartConfig.options.scales) {
      Object.values(chartConfig.options.scales).forEach((scale: any) => {
        scale.ticks = scale.ticks || {};
        scale.ticks.font = {
          family: theme.fonts.body,
          size: theme.fonts.size.axis
        };
        scale.ticks.color = theme.colors.text;
        
        scale.grid = scale.grid || {};
        scale.grid.color = theme.colors.grid;
        
        if (scale.title) {
          scale.title.font = {
            family: theme.fonts.body,
            size: theme.fonts.size.axis
          };
          scale.title.color = theme.colors.text;
        }
      });
    }
  }

  // 应用样式选项
  if (style) {
    if (chartConfig.options) {
      chartConfig.options.animation = style.animation !== false;
      chartConfig.options.responsive = style.responsive !== false;
      
      if (chartConfig.options.plugins) {
        chartConfig.options.plugins.legend = chartConfig.options.plugins.legend || {};
        chartConfig.options.plugins.legend.display = style.showLegend !== false;
        
        chartConfig.options.plugins.tooltip = chartConfig.options.plugins.tooltip || {};
        chartConfig.options.plugins.tooltip.enabled = style.showTooltips !== false;
      }
      
      if (chartConfig.options.scales && style.showGrid === false) {
        Object.values(chartConfig.options.scales).forEach((scale: any) => {
          scale.grid = scale.grid || {};
          scale.grid.display = false;
        });
      }
    }
  }

  return chartConfig;
}