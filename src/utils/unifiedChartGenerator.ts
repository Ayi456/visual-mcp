/**
 * 统一图表生成器 - 基于 ECharts
 */

import type { EChartsOption } from 'echarts';
import type { ChartType, SchemaField, StyleConfig, VisualizationData } from '../types/chart.types.js';
import { MULTI_SERIES_COLOR_PALETTE } from '../constants/chart.constants.js';
import { getOptimizedEChartsConfig, shouldOptimizeData, smartDownsample } from './performanceOptimizer.js';
import { getThemeConfig } from '../config/themes.js';
import { identifyDataType, recommendChartType } from './dataTypeDetector.js';

/**
 * 判断是否为多系列数据
 */
function isMultiSeriesData(schema: SchemaField[]): boolean {
  if (schema.length <= 2) return false;

  // 只要从第二列开始有两个及以上数值列，就视为多系列
  const numericColumns = schema.slice(1).filter(col => col.type === 'number');
  return numericColumns.length >= 2;
}

/**
 * 获取系列颜色
 */
function getSeriesColor(index: number, customColors?: string[]): string {
  if (customColors && customColors[index]) {
    return customColors[index];
  }
  return MULTI_SERIES_COLOR_PALETTE[index % MULTI_SERIES_COLOR_PALETTE.length].border;
}

/**
 * 应用主题到 ECharts 配置
 */
function applyThemeToECharts(config: EChartsOption, themeName?: string): EChartsOption {
  if (!themeName || themeName === 'default') return config;

  const theme = getThemeConfig(themeName);

  return {
    ...config,
    backgroundColor: theme.colors.background,
    textStyle: {
      color: theme.colors.text,
      fontFamily: theme.fonts.body
    },
    color: theme.colors.accent
  };
}

/**
 * 生成折线图配置
 */
function generateLineChart(
  data: any[][],
  schema: SchemaField[],
  style?: StyleConfig,
  title?: string,
  axisLabels?: { x?: string; y?: string }
): EChartsOption {
  const isMultiSeries = isMultiSeriesData(schema);
  const labels = data.map(row => row[0]);

  let series: any[] = [];

  if (isMultiSeries) {
    // 多系列
    const numericFields = schema.slice(1).filter(col => col.type === 'number');
    series = numericFields.map((field, index) => {
      const columnIndex = schema.indexOf(field);
      const seriesData = data.map(row => row[columnIndex]);

      return {
        name: field.name,
        type: 'line',
        data: seriesData,
        smooth: style?.tension !== undefined ? style.tension > 0 : true,
        lineStyle: {
          width: style?.lineWidth || 2,
          color: getSeriesColor(index, style?.customColors)
        },
        itemStyle: {
          color: getSeriesColor(index, style?.customColors)
        },
        showSymbol: style?.pointRadius !== undefined ? style.pointRadius > 0 : false,
        symbolSize: style?.pointRadius || 4,
        areaStyle: style?.fill ? {
          opacity: 0.2
        } : undefined
      };
    });
  } else {
    // 单系列
    const values = data.map(row => row[1]);
    series = [{
      name: schema[1]?.name || 'Value',
      type: 'line',
      data: values,
      smooth: true,
      lineStyle: {
        width: style?.lineWidth || 2,
        color: getSeriesColor(0, style?.customColors)
      },
      itemStyle: {
        color: getSeriesColor(0, style?.customColors)
      },
      showSymbol: false,
      symbolSize: 4,
      areaStyle: style?.fill ? {
        opacity: 0.2
      } : undefined
    }];
  }

  return {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      show: style?.showLegend !== false,
      top: 'top',
      left: 'center',
      orient: 'horizontal'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '8%', 
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: labels,
      name: axisLabels?.x || schema[0]?.name,
      nameLocation: 'middle',
      nameGap: 30,
      splitLine: {
        show: style?.showGrid !== false,
        lineStyle: {
          type: style?.gridStyle?.type || 'solid',
          opacity: style?.gridStyle?.opacity || 0.1
        }
      }
    },
    yAxis: {
      type: 'value',
      name: axisLabels?.y || '数值',
      nameLocation: 'middle',
      nameGap: 50,
      splitLine: {
        show: style?.showGrid !== false,
        lineStyle: {
          type: style?.gridStyle?.type || 'solid',
          opacity: style?.gridStyle?.opacity || 0.1
        }
      }
    },
    series
  };
}

/**
 * 生成柱状图配置
 */
function generateBarChart(
  data: any[][],
  schema: SchemaField[],
  style?: StyleConfig,
  title?: string,
  axisLabels?: { x?: string; y?: string }
): EChartsOption {
  const isMultiSeries = isMultiSeriesData(schema);
  const labels = data.map(row => row[0]);

  let series: any[] = [];

  if (isMultiSeries) {
    const numericFields = schema.slice(1).filter(col => col.type === 'number');
    series = numericFields.map((field, index) => {
      const columnIndex = schema.indexOf(field);
      const seriesData = data.map(row => row[columnIndex]);

      return {
        name: field.name,
        type: 'bar',
        data: seriesData,
        itemStyle: {
          color: getSeriesColor(index, style?.customColors)
        },
        label: {
          show: false
        }
      };
    });
  } else {
    const values = data.map(row => row[1]);
    series = [{
      name: schema[1]?.name || 'Value',
      type: 'bar',
      data: values,
      itemStyle: {
        color: getSeriesColor(0, style?.customColors)
      },
      label: {
        show: style?.dataLabels?.show || false,
        position: 'top',
        formatter: '{c}'
      }
    }];
  }

  return {
    // 不在图表内显示标题，因为HTML页面顶部已有标题
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      show: style?.showLegend !== false,
      top: 'top',
      left: 'center'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '8%',  // 减少顶部间距，因为没有图表内标题
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: labels,
      name: axisLabels?.x || schema[0]?.name,
      axisLabel: {
        rotate: labels.length > 10 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: axisLabels?.y || '数值'
    },
    series
  };
}

/**
 * 生成饼图配置
 */
function generatePieChart(
  data: any[][],
  schema: SchemaField[],
  style?: StyleConfig,
  title?: string
): EChartsOption {
  const seriesData = data.map((row, index) => ({
    name: row[0],
    value: row[1],
    itemStyle: {
      color: getSeriesColor(index, style?.customColors)
    }
  }));

  return {
    // 不在图表内显示标题，因为HTML页面顶部已有标题
    title: {
      show: false
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      show: style?.showLegend !== false,
      orient: 'vertical',
      left: 'left',
      top: '5%'  // 从顶部开始
    },
    series: [
      {
        name: schema[1]?.name || 'Value',
        type: 'pie',
        radius: '60%',
        center: ['50%', '50%'],  // 调整为居中，因为没有图表内标题
        data: seriesData,
        label: {
          show: style?.dataLabels?.show !== false,
          position: 'outside',
          formatter: '{b}: {c} ({d}%)'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
}

/**
 * 生成散点图配置
 */
function generateScatterChart(
  data: any[][],
  schema: SchemaField[],
  style?: StyleConfig,
  title?: string,
  axisLabels?: { x?: string; y?: string }
): EChartsOption {
  const scatterData = data.map(row => [row[0], row[1]]);

  return {
    // 不在图表内显示标题，因为HTML页面顶部已有标题
    title: {
      show: false
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.value[0]}<br/>${params.seriesName}: ${params.value[1]}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '8%',  // 减少顶部间距，因为没有图表内标题
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: axisLabels?.x || schema[0]?.name,
      splitLine: {
        show: style?.showGrid !== false
      }
    },
    yAxis: {
      type: 'value',
      name: axisLabels?.y || schema[1]?.name,
      splitLine: {
        show: style?.showGrid !== false
      }
    },
    series: [
      {
        name: schema[1]?.name || 'Value',
        type: 'scatter',
        data: scatterData,
        symbolSize: style?.pointRadius || 8,
        itemStyle: {
          color: getSeriesColor(0, style?.customColors)
        }
      }
    ]
  };
}

/**
 * 生成热力图配置
 */
function generateHeatmapChart(
  data: any[][],
  schema: SchemaField[],
  style?: StyleConfig,
  title?: string
): EChartsOption {
  // 假设数据格式：[xCategory, yCategory, value]
  const xCategories = Array.from(new Set(data.map(row => row[0])));
  const yCategories = Array.from(new Set(data.map(row => row[1])));

  const seriesData = data.map(row => [
    xCategories.indexOf(row[0]),
    yCategories.indexOf(row[1]),
    Number(row[2]) || 0
  ]);

  const values = seriesData.map(d => d[2]);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;

  return {
    // 不在图表内显示标题，因为HTML页面顶部已有标题
    title: {
      show: false
    },
    tooltip: {
      position: 'top'
    },
    grid: {
      left: '5%',
      right: '5%',
      top: '5%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xCategories,
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: yCategories,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min,
      max,
      calculable: true,
      orient: 'vertical',
      left: 'right',
      top: 'center'
    },
    series: [
      {
        type: 'heatmap',
        data: seriesData,
        label: {
          show: style?.dataLabels?.show || false
        }
      }
    ]
  };
}

/**
 * 生成雷达图配置
 */
function generateRadarChart(
  data: any[][],
  schema: SchemaField[],
  style?: StyleConfig,
  title?: string
): EChartsOption {
  const isMultiSeries = isMultiSeriesData(schema);

  // 雷达图指标
  const indicators = schema.slice(1).map(field => ({
    name: field.name,
    max: Math.max(...data.map(row => {
      const index = schema.indexOf(field);
      return typeof row[index] === 'number' ? row[index] : 0;
    })) * 1.2
  }));

  let series: any[] = [];

  if (isMultiSeries) {
    // 多系列雷达图：每行是一个系列
    series = data.map((row, index) => ({
      name: row[0],
      value: row.slice(1),
      itemStyle: {
        color: getSeriesColor(index, style?.customColors)
      }
    }));
  } else {
    // 单系列
    series = [{
      name: data[0]?.[0] || 'Data',
      value: data.map(row => row[1]),
      itemStyle: {
        color: getSeriesColor(0, style?.customColors)
      }
    }];
  }

  return {
    // 不在图表内显示标题，因为HTML页面顶部已有标题
    title: {
      show: false
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      show: style?.showLegend !== false,
      top: 'top'
    },
    radar: {
      indicator: indicators,
      splitLine: {
        show: style?.showGrid !== false
      }
    },
    series: [
      {
        type: 'radar',
        data: series
      }
    ]
  };
}

/**
 * 生成气泡图配置
 */
function generateBubbleChart(
  data: any[][],
  schema: SchemaField[],
  style?: StyleConfig,
  title?: string,
  axisLabels?: { x?: string; y?: string }
): EChartsOption {
  // 假设数据格式：[x, y, size]
  const bubbleData = data.map((row, index) => ({
    value: [row[0], row[1], row[2] || Math.abs(row[1])],
    itemStyle: {
      color: getSeriesColor(index, style?.customColors)
    }
  }));

  return {
    // 不在图表内显示标题，因为HTML页面顶部已有标题
    title: {
      show: false
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.value[0]}<br/>值: ${params.value[1]}<br/>大小: ${params.value[2]}`;
      }
    },
    grid: {
      left: '3%',
      right: '7%',
      bottom: '3%',
      top: '8%',  // 减少顶部间距，因为没有图表内标题
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: axisLabels?.x || schema[0]?.name,
      splitLine: {
        show: style?.showGrid !== false
      }
    },
    yAxis: {
      type: 'value',
      name: axisLabels?.y || schema[1]?.name,
      splitLine: {
        show: style?.showGrid !== false
      }
    },
    series: [
      {
        type: 'scatter',
        data: bubbleData,
        symbolSize: (data: any) => Math.sqrt(data[2]) * 5
      }
    ]
  };
}

/**
 * 主生成函数 - 统一所有图表类型
 */
export function generateUnifiedChartConfig(visualizationData: VisualizationData): EChartsOption {
  const { data, schema, chartType, title, axisLabels, style = {} } = visualizationData;

  // 性能优化：大数据集采样
  const isTimeSeries = schema[0]?.type === 'date';
  let optimizedData = data;

  if (shouldOptimizeData(data.length)) {
    console.log(`数据量较大 (${data.length} 行)，启用性能优化`);
    optimizedData = smartDownsample(data, 800, isTimeSeries);
    console.log(`采样后数据量: ${optimizedData.length} 行`);
  }

  // 根据图表类型生成配置
  let baseConfig: EChartsOption;

  switch (chartType) {
    case 'line':
    case 'area':
      baseConfig = generateLineChart(optimizedData, schema, { ...style, fill: chartType === 'area' }, title, axisLabels);
      break;

    case 'bar':
      baseConfig = generateBarChart(optimizedData, schema, style, title, axisLabels);
      break;

    case 'pie':
      baseConfig = generatePieChart(optimizedData, schema, style, title);
      break;

    case 'scatter':
      baseConfig = generateScatterChart(optimizedData, schema, style, title, axisLabels);
      break;

    case 'radar':
      baseConfig = generateRadarChart(optimizedData, schema, style, title);
      break;

    case 'bubble':
      baseConfig = generateBubbleChart(optimizedData, schema, style, title, axisLabels);
      break;

    case 'heatmap':
      baseConfig = generateHeatmapChart(optimizedData, schema, style, title);
      break;

    // 高级图表类型（内联实现）
    case 'combo':
      baseConfig = generateComboChartInternal(optimizedData, schema, style, title);
      break;

    case 'funnel':
      baseConfig = generateFunnelChartInternal(optimizedData, schema, style, title);
      break;

    case 'sankey':
      baseConfig = generateSankeyChartInternal(optimizedData, schema, style, title);
      break;

    case 'treemap':
      baseConfig = generateTreemapChartInternal(optimizedData, schema, style, title);
      break;

    case 'gauge':
      baseConfig = generateGaugeChartInternal(optimizedData, schema, style, title);
      break;

    case 'waterfall':
      baseConfig = generateWaterfallChartInternal(optimizedData, schema, style, title);
      break;

    case 'boxplot':
      baseConfig = generateBoxplotChartInternal(optimizedData, schema, style, title);
      break;

    default:
      // 默认使用折线图
      baseConfig = generateLineChart(optimizedData, schema, style, title, axisLabels);
  }

  // 应用性能优化配置
  const performanceConfig = getOptimizedEChartsConfig(data.length);

  const optimizedConfig: EChartsOption = {
    ...baseConfig,
    animation: performanceConfig.animation !== false && style.animation !== false,

    // 应用性能优化到系列
    series: (baseConfig.series as any[])?.map(s => ({
      ...s,
      large: performanceConfig.large,
      largeThreshold: performanceConfig.largeThreshold,
      progressive: performanceConfig.progressive,
      progressiveThreshold: performanceConfig.progressiveThreshold,
      sampling: performanceConfig.sampling
    }))
  };

  // 应用主题
  const finalConfig = applyThemeToECharts(optimizedConfig, style.theme);

  // 添加缩放控制
  if (style.zoom?.enabled) {
    return {
      ...finalConfig,
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: style.zoom.type === 'y' || style.zoom.type === 'xy' ? 0 : false,
            xAxisIndex: style.zoom.type === 'x' || style.zoom.type === 'xy' ? 0 : false
          },
          restore: {},
          saveAsImage: {}
        }
      },
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: style.zoom.type === 'x' || style.zoom.type === 'xy' ? 0 : undefined,
          yAxisIndex: style.zoom.type === 'y' || style.zoom.type === 'xy' ? 0 : undefined
        },
        {
          type: 'slider',
          xAxisIndex: style.zoom.type === 'x' || style.zoom.type === 'xy' ? 0 : undefined,
          yAxisIndex: style.zoom.type === 'y' || style.zoom.type === 'xy' ? 0 : undefined
        }
      ]
    };
  }

  return finalConfig;
}

/**
 * 从 SQL 查询结果生成 ECharts 配置
 */
export function generateUnifiedChartFromSqlResult(
  queryResult: { columns: string[]; rows: any[] | any[][] },
  chartType: ChartType,
  chartTitle: string,
  axisConfig?: { xAxis?: string; yAxis?: string }
): EChartsOption {
  const { columns, rows } = queryResult;

  if (!columns || !rows) {
    return generateUnifiedChartConfig({
      data: [],
      schema: [],
      chartType: chartType === 'auto' ? 'bar' : chartType,
      title: chartTitle
    });
  }

  // 将对象数组转换为二维数组
  const isObjectArray = rows.length > 0 && typeof rows[0] === 'object' && !Array.isArray(rows[0]);
  const normalizedRows: any[][] = isObjectArray
    ? (rows as any[]).map(row => columns.map(col => (row as any)[col]))
    : (rows as any[][]);

  // 依据前端指定的 X/Y 轴字段重排列顺序：优先 [x, y, 其他...]
  let xIndex = 0;
  if (axisConfig?.xAxis) {
    const idx = columns.indexOf(axisConfig.xAxis);
    if (idx >= 0) xIndex = idx;
  }

  let yIndex = columns.length > 1 ? 1 : -1;
  if (axisConfig?.yAxis) {
    const idx = columns.indexOf(axisConfig.yAxis);
    if (idx >= 0 && idx !== xIndex) {
      yIndex = idx;
    }
  }
  if ((yIndex === -1 || yIndex === xIndex) && columns.length > 1) {
    const candidate = columns.findIndex((_, i) => i !== xIndex);
    if (candidate >= 0) yIndex = candidate;
  }

  const allIndices = columns.map((_, i) => i);
  const remaining = allIndices.filter(i => i !== xIndex && i !== yIndex && i >= 0);
  const orderedIndices =
    yIndex >= 0 ? [xIndex, yIndex, ...remaining] : [xIndex, ...remaining];

  const reorderedColumns = orderedIndices.map(i => columns[i]);
  const reorderedRows = normalizedRows.map(row => orderedIndices.map(i => row[i]));

  // 使用数据内容自动识别每列类型
  const columnTypes = reorderedColumns.map((_, colIndex) =>
    identifyDataType(reorderedRows.map(row => row[colIndex]))
  );

  const schema: SchemaField[] = reorderedColumns.map((col, index) => ({
    name: col,
    type: columnTypes[index]
  }));

  // auto 类型在这里转换为具体图表类型，避免后续默认回退为折线图
  let finalChartType: ChartType = chartType;
  if (chartType === 'auto') {
    finalChartType = recommendChartType(schema, reorderedRows);
  }

  // 使用统一生成器
  return generateUnifiedChartConfig({
    data: reorderedRows,
    schema,
    chartType: finalChartType,
    title: chartTitle
  });
}

// ============================================================================
// 高级图表内部实现函数（从 echartsGenerator.ts 迁移）
// ============================================================================

/**
 * 生成组合图配置（内部）
 */
function generateComboChartInternal(
  data: any[][],
  schema: SchemaField[],
  style?: StyleConfig,
  title?: string
): EChartsOption {
  const labels = data.map(row => row[0]);
  const series: any[] = [];

  // 从第二列开始，每列作为一个系列
  for (let i = 1; i < schema.length; i++) {
    const values = data.map(row => row[i]);
    const colorIndex = (i - 1) % MULTI_SERIES_COLOR_PALETTE.length;
    const color = style?.customColors?.[i - 1] || MULTI_SERIES_COLOR_PALETTE[colorIndex].border;

    series.push({
      name: schema[i].name,
      type: i === 1 ? 'bar' : 'line',
      data: values,
      itemStyle: { color },
      lineStyle: i > 1 ? { width: style?.lineWidth || 2 } : undefined,
      smooth: style?.tension !== undefined ? style.tension > 0 : true,
      yAxisIndex: i > 1 ? 1 : 0
    });
  }

  return {
    title: title ? {
      text: title,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    } : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      show: style?.showLegend !== false,
      top: style?.legendPosition || 'top'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisPointer: { type: 'shadow' }
    },
    yAxis: [
      {
        type: 'value',
        name: schema[1]?.name || ''
      },
      {
        type: 'value',
        name: schema[2]?.name || '',
        splitLine: { show: false }
      }
    ],
    series
  };
}

/**
 * 生成漏斗图配置（内部）
 */
function generateFunnelChartInternal(
  data: any[][],
  schema: SchemaField[],
  style?: StyleConfig,
  title?: string
): EChartsOption {
  const seriesData = data.map((row, index) => ({
    name: row[0],
    value: row[1],
    itemStyle: {
      color: style?.customColors?.[index] || MULTI_SERIES_COLOR_PALETTE[index % MULTI_SERIES_COLOR_PALETTE.length].border
    }
  }));

  return {
    title: title ? {
      text: title,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    } : undefined,
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      show: style?.showLegend !== false,
      top: style?.legendPosition || 'bottom'
    },
    series: [
      {
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: 100,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending' as const,
        gap: 2,
        label: {
          show: style?.dataLabels?.show !== false,
          position: 'inside',
          formatter: '{b}: {c}'
        },
        labelLine: {
          length: 10,
          lineStyle: { width: 1 }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          label: { fontSize: 20 }
        },
        data: seriesData
      } as any
    ]
  };
}

/**
 * 生成桑基图配置（内部）
 */
function generateSankeyChartInternal(
  data: any[][],
  schema: SchemaField[],
  style?: StyleConfig,
  title?: string
): EChartsOption {
  const nodes = new Set<string>();
  const links = data.map(row => {
    nodes.add(row[0]);
    nodes.add(row[1]);
    return {
      source: row[0],
      target: row[1],
      value: row[2]
    };
  });

  const nodeData = Array.from(nodes).map(name => ({ name }));

  return {
    title: title ? {
      text: title,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    } : undefined,
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series: [
      {
        type: 'sankey',
        emphasis: {
          focus: 'adjacency' as const
        },
        data: nodeData,
        links: links,
        lineStyle: {
          color: 'gradient' as const,
          curveness: 0.5
        },
        label: {
          show: true,
          position: 'right' as const
        }
      } as any
    ]
  };
}

/**
 * 生成矩形树图配置（内部）
 */
function generateTreemapChartInternal(
  data: any[][],
  schema: SchemaField[],
  style?: StyleConfig,
  title?: string
): EChartsOption {
  const seriesData = data.map((row, index) => ({
    name: row[0],
    value: row[1],
    itemStyle: {
      color: style?.customColors?.[index] || MULTI_SERIES_COLOR_PALETTE[index % MULTI_SERIES_COLOR_PALETTE.length].border
    }
  }));

  return {
    title: title ? {
      text: title,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    } : undefined,
    tooltip: {
      formatter: (info: any) => {
        const { name, value } = info;
        return `${name}: ${value}`;
      }
    },
    series: [
      {
        type: 'treemap',
        data: seriesData,
        label: {
          show: true,
          formatter: '{b}\n{c}'
        },
        breadcrumb: {
          show: false
        },
        roam: style?.zoom?.enabled !== false,
        nodeClick: 'zoomToNode' as const,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          gapWidth: 2
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.5)'
          }
        }
      } as any
    ]
  };
}

/**
 * 生成仪表盘配置（内部）
 */
function generateGaugeChartInternal(
  data: any[][],
  schema: SchemaField[],
  style?: StyleConfig,
  title?: string
): EChartsOption {
  const value = data[0]?.[1] || 0;
  const name = data[0]?.[0] || 'Value';
  const max = Math.max(...data.map(row => row[1])) * 1.2;

  return {
    title: title ? {
      text: title,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    } : undefined,
    tooltip: {
      formatter: '{b}: {c}'
    },
    series: [
      {
        type: 'gauge',
        min: 0,
        max: max,
        splitNumber: 10,
        radius: '75%',
        axisLine: {
          lineStyle: {
            width: 30,
            color: [
              [0.3, '#67e0e3'],
              [0.7, '#37a2da'],
              [1, '#fd666d']
            ]
          }
        },
        pointer: {
          itemStyle: {
            color: 'auto'
          }
        },
        axisTick: {
          distance: -30,
          length: 8,
          lineStyle: {
            color: '#fff',
            width: 2
          }
        },
        splitLine: {
          distance: -30,
          length: 30,
          lineStyle: {
            color: '#fff',
            width: 4
          }
        },
        axisLabel: {
          color: 'inherit',
          distance: 40,
          fontSize: 12
        },
        detail: {
          valueAnimation: style?.animation !== false,
          formatter: '{value}',
          color: 'inherit',
          fontSize: 20
        },
        data: [
          {
            value: value,
            name: name
          }
        ]
      } as any
    ]
  };
}

/**
 * 生成瀑布图配置（内部）
 */
function generateWaterfallChartInternal(
  data: any[][],
  schema: SchemaField[],
  style?: StyleConfig,
  title?: string
): EChartsOption {
  const labels = data.map(row => row[0]);
  const values = data.map(row => row[1]);

  // 计算累计值
  let sum = 0;
  const stackData = values.map((val, index) => {
    const start = sum;
    sum += val;
    return {
      name: labels[index],
      value: val,
      stack: sum,
      itemStyle: {
        color: val >= 0 ? '#5ab1ef' : '#ff6f61'
      }
    };
  });

  return {
    title: title ? {
      text: title,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    } : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const item = params[0];
        return `${item.name}<br/>变化: ${item.value}<br/>累计: ${stackData[item.dataIndex].stack}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: labels
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        type: 'bar',
        stack: 'total',
        itemStyle: {
          borderColor: 'transparent',
          color: 'transparent'
        },
        emphasis: {
          itemStyle: {
            borderColor: 'transparent',
            color: 'transparent'
          }
        },
        data: stackData.map((item, index) => {
          if (index === 0) return 0;
          return stackData[index - 1].stack;
        })
      },
      {
        type: 'bar',
        stack: 'total',
        label: {
          show: style?.dataLabels?.show !== false,
          position: 'top',
          formatter: '{c}'
        },
        data: stackData
      }
    ] as any
  };
}

/**
 * 生成箱线图配置（内部）
 */
function generateBoxplotChartInternal(
  data: any[][],
  schema: SchemaField[],
  style?: StyleConfig,
  title?: string
): EChartsOption {
  // 假设数据格式：[category, min, Q1, median, Q3, max]
  const categories = data.map(row => row[0]);
  const boxData = data.map(row => row.slice(1));

  return {
    title: title ? {
      text: title,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    } : undefined,
    tooltip: {
      trigger: 'item',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: categories,
      boundaryGap: true,
      nameGap: 30,
      splitArea: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      splitArea: {
        show: style?.showGrid !== false
      }
    },
    series: [
      {
        type: 'boxplot',
        data: boxData,
        itemStyle: {
          color: style?.customColors?.[0] || '#b8c5f2',
          borderColor: style?.customColors?.[1] || '#3c5aa3'
        },
        emphasis: {
          itemStyle: {
            borderColor: '#000',
            borderWidth: 2
          }
        }
      } as any
    ]
  };
}
