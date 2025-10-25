/**
 * 图表生成器工具函数
 * 负责根据数据生成Chart.js配置
 */

import { VisualizationData } from '../types/chart.types.js';
import { recommendChartType } from './dataTypeDetector.js';
import { applyThemeToChart, getThemeConfig } from '../config/themes.js';
import { DEFAULT_CHART_CONFIG } from '../constants/chart.constants.js';

/**
 * 生成通用图表配置
 */
export function generateChartConfig(visualizationData: VisualizationData): any {
  const { data, schema, chartType, title, axisLabels, style = {} } = visualizationData;

  // 确定最终的图表类型
  const finalChartType = chartType === 'auto' ? recommendChartType(schema, data) : chartType;

  // 提取数据
  const labels = data.map(row => row[0]);
  const values = data.map(row => row[1]);

  // 基础配置
  let chartConfig: any = {
    type: finalChartType,
    data: {
      labels: labels,
      datasets: [{
        label: schema[1]?.name || 'Value',
        data: values,
      }]
    },
    options: {
      ...DEFAULT_CHART_CONFIG.options,
      plugins: {
        title: {
          display: !!title,
          text: title || '数据可视化图表',
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      }
    }
  };

  // 根据图表类型设置样式
  switch (finalChartType) {
    case 'line':
      Object.assign(chartConfig.data.datasets[0], {
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.4,
        fill: false,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6
      });
      break;

    case 'bar':
      Object.assign(chartConfig.data.datasets[0], {
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      });
      break;

    case 'pie':
      chartConfig.data.datasets[0] = {
        data: values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ],
        borderWidth: 2
      };
      break;

    case 'scatter':
      chartConfig.data = {
        datasets: [{
          label: schema[1]?.name || 'Value',
          data: data.map(row => ({ x: row[0], y: row[1] })),
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgb(255, 99, 132)',
          pointRadius: 8,
          pointHoverRadius: 10
        }]
      };
      break;

    case 'area':
      Object.assign(chartConfig.data.datasets[0], {
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.3)',
        fill: true,
        tension: 0.4
      });
      chartConfig.type = 'line';
      break;

    case 'radar':
      Object.assign(chartConfig.data.datasets[0], {
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 99, 132)'
      });
      break;

    case 'bubble':
      // 生成泡泡图数据（需要三个维度）
      const bubbleData = data.map((row, index) => ({
        x: row[0],
        y: row[1],
        r: Math.abs(row[1]) / Math.max(...values.map(Math.abs)) * 20
      }));
      chartConfig.data = {
        datasets: [{
          label: schema[1]?.name || 'Value',
          data: bubbleData,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)'
        }]
      };
      break;
  }

  // 添加坐标轴标签（对支持的图表类型）
  if (axisLabels && ['line', 'bar', 'scatter', 'area', 'bubble'].includes(finalChartType)) {
    chartConfig.options.scales = {
      x: {
        title: {
          display: true,
          text: axisLabels.x || schema[0]?.name || 'X轴'
        }
      },
      y: {
        title: {
          display: true,
          text: axisLabels.y || schema[1]?.name || 'Y轴'
        }
      }
    };
  }

  // 应用主题样式
  if (style.theme) {
    const themeConfig = getThemeConfig(style.theme);
    chartConfig = applyThemeToChart(chartConfig, themeConfig, style);
  }

  return chartConfig;
}

/**
 * 生成多系列图表配置
 */
export function generateMultiSeriesChartConfig(
  data: any[][],
  schema: any[],
  chartType: string,
  options: any = {}
): any {
  const labels = [...new Set(data.map(row => row[0]))];
  const series = schema.slice(1).map((col, index) => ({
    label: col.name,
    data: labels.map(label => {
      const row = data.find(r => r[0] === label);
      return row ? row[index + 1] : null;
    })
  }));

  const config = {
    type: chartType,
    data: {
      labels,
      datasets: series.map((s, i) => ({
        ...s,
        backgroundColor: `rgba(${50 + i * 30}, ${100 + i * 20}, ${200 - i * 25}, 0.6)`,
        borderColor: `rgba(${50 + i * 30}, ${100 + i * 20}, ${200 - i * 25}, 1)`,
      }))
    },
    options: {
      ...DEFAULT_CHART_CONFIG.options,
      ...options
    }
  };

  return config;
}

/**
 * 生成组合图表配置（例如：折线图+柱状图）
 */
export function generateComboChartConfig(
  data: any[][],
  schema: any[],
  chartTypes: string[],
  options: any = {}
): any {
  const labels = data.map(row => row[0]);
  
  const datasets = schema.slice(1).map((col, index) => {
    const type = chartTypes[index] || 'line';
    const values = data.map(row => row[index + 1]);
    
    return {
      label: col.name,
      data: values,
      type: type,
      yAxisID: `y${index}`,
      backgroundColor: type === 'bar' ? 
        `rgba(${54 + index * 50}, ${162 - index * 30}, ${235 - index * 40}, 0.6)` :
        'transparent',
      borderColor: `rgba(${54 + index * 50}, ${162 - index * 30}, ${235 - index * 40}, 1)`,
      borderWidth: 2
    };
  });

  const scales = schema.slice(1).reduce((acc, col, index) => {
    acc[`y${index}`] = {
      type: 'linear',
      display: true,
      position: index === 0 ? 'left' : 'right',
      title: {
        display: true,
        text: col.name
      }
    };
    return acc;
  }, {} as any);

  return {
    type: 'bar', // 基础类型
    data: { labels, datasets },
    options: {
      ...DEFAULT_CHART_CONFIG.options,
      ...options,
      scales: {
        x: {
          title: {
            display: true,
            text: schema[0]?.name || 'X轴'
          }
        },
        ...scales
      }
    }
  };
}