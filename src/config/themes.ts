import { ThemeConfig, StyleConfig } from '../types/chart.types.js';

// 预设主题配置
export const PRESET_THEMES: { [key: string]: ThemeConfig } = {
  default: {
    name: '默认主题',
    colors: {
      primary: '#4facfe',
      secondary: '#00f2fe',
      background: '#ffffff',
      text: '#333333',
      grid: 'rgba(0, 0, 0, 0.1)',
      accent: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
      ]
    },
    fonts: {
      title: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      body: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      size: {
        title: 16,
        body: 12,
        axis: 14
      }
    },
    chart: {
      borderWidth: 2,
      pointRadius: 6,
      tension: 0.4,
      opacity: 0.8
    }
  },
  dark: {
    name: '深色主题',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      background: '#2d3748',
      text: '#ffffff',
      grid: 'rgba(255, 255, 255, 0.1)',
      accent: [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
      ]
    },
    fonts: {
      title: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      body: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      size: {
        title: 18,
        body: 12,
        axis: 14
      }
    },
    chart: {
      borderWidth: 2,
      pointRadius: 6,
      tension: 0.4,
      opacity: 0.9
    }
  },
  business: {
    name: '商务主题',
    colors: {
      primary: '#2c3e50',
      secondary: '#34495e',
      background: '#ecf0f1',
      text: '#2c3e50',
      grid: 'rgba(44, 62, 80, 0.1)',
      accent: [
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
        '#9b59b6', '#1abc9c', '#34495e', '#95a5a6'
      ]
    },
    fonts: {
      title: "'Arial', sans-serif",
      body: "'Arial', sans-serif",
      size: {
        title: 16,
        body: 11,
        axis: 12
      }
    },
    chart: {
      borderWidth: 1,
      pointRadius: 4,
      tension: 0.2,
      opacity: 0.85
    }
  },
  colorful: {
    name: '彩色主题',
    colors: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      background: '#f8f9fa',
      text: '#495057',
      grid: 'rgba(73, 80, 87, 0.1)',
      accent: [
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
        '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f',
        '#ff7675', '#74b9ff', '#a29bfe', '#fd79a8'
      ]
    },
    fonts: {
      title: "'Comic Sans MS', cursive",
      body: "'Comic Sans MS', cursive",
      size: {
        title: 18,
        body: 13,
        axis: 14
      }
    },
    chart: {
      borderWidth: 3,
      pointRadius: 8,
      tension: 0.6,
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
        dataset.borderColor = accentColor;
        dataset.backgroundColor = accentColor.replace(')', ', 0.3)').replace('rgb', 'rgba');
        dataset.pointBackgroundColor = accentColor;
        dataset.pointBorderColor = theme.colors.background;
        dataset.pointBorderWidth = theme.chart.borderWidth;
        dataset.pointRadius = theme.chart.pointRadius;
        dataset.tension = theme.chart.tension;
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