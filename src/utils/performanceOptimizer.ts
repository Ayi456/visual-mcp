/**
 * 图表性能优化工具
 * 包括数据采样、懒加载、虚拟化等
 */

/**
 * 数据采样配置
 */
export const PERFORMANCE_THRESHOLDS = {
  // 超过此数量进行采样
  SAMPLE_THRESHOLD: 1000,
  // 采样后的最大数据点数
  MAX_SAMPLE_POINTS: 800,
  // 大数据集阈值（考虑使用更激进的优化）
  LARGE_DATASET_THRESHOLD: 5000
};

/**
 * 判断是否需要优化数据
 */
export function shouldOptimizeData(rowCount: number): boolean {
  return rowCount > PERFORMANCE_THRESHOLDS.SAMPLE_THRESHOLD;
}

/**
 * LTTB (Largest Triangle Three Buckets) 算法 - 高质量数据降采样
 * 保留数据的整体趋势和极值点
 */
export function lttbDownsample(data: any[][], threshold: number): any[][] {
  if (data.length <= threshold) {
    return data;
  }

  const sampled: any[][] = [];
  const bucketSize = (data.length - 2) / (threshold - 2);

  // 始终保留第一个点
  sampled.push(data[0]);

  let a = 0;
  for (let i = 0; i < threshold - 2; i++) {
    const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgRangeEnd = Math.floor((i + 2) * bucketSize) + 1;
    const avgRangeLength = avgRangeEnd - avgRangeStart;

    // 计算下一个桶的平均点
    let avgX = 0;
    let avgY = 0;
    for (let j = avgRangeStart; j < avgRangeEnd && j < data.length; j++) {
      avgX += j;
      avgY += typeof data[j][1] === 'number' ? data[j][1] : 0;
    }
    avgX /= avgRangeLength;
    avgY /= avgRangeLength;

    // 在当前桶中找到形成最大三角形面积的点
    const rangeOffs = Math.floor((i + 0) * bucketSize) + 1;
    const rangeTo = Math.floor((i + 1) * bucketSize) + 1;

    const pointAX = a;
    const pointAY = typeof data[a][1] === 'number' ? data[a][1] : 0;

    let maxArea = -1;
    let maxAreaPoint = rangeOffs;

    for (let j = rangeOffs; j < rangeTo && j < data.length; j++) {
      const pointY = typeof data[j][1] === 'number' ? data[j][1] : 0;
      const area = Math.abs(
        (pointAX - avgX) * (pointY - pointAY) - (pointAX - j) * (avgY - pointAY)
      ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = j;
      }
    }

    sampled.push(data[maxAreaPoint]);
    a = maxAreaPoint;
  }

  // 始终保留最后一个点
  sampled.push(data[data.length - 1]);

  return sampled;
}

/**
 * 简单均匀采样 - 适用于非时序数据
 */
export function uniformDownsample(data: any[][], maxPoints: number): any[][] {
  if (data.length <= maxPoints) {
    return data;
  }

  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0);
}

/**
 * 智能数据采样 - 根据数据类型选择最佳采样策略
 */
export function smartDownsample(
  data: any[][],
  maxPoints: number = PERFORMANCE_THRESHOLDS.MAX_SAMPLE_POINTS,
  isTimeSeries: boolean = false
): any[][] {
  if (data.length <= maxPoints) {
    return data;
  }

  // 时序数据使用 LTTB 算法，保留趋势
  if (isTimeSeries) {
    return lttbDownsample(data, maxPoints);
  }

  // 非时序数据使用均匀采样
  return uniformDownsample(data, maxPoints);
}

/**
 * 批量数据分块 - 用于懒加载和虚拟滚动
 */
export function chunkData(data: any[][], chunkSize: number = 100): any[][][] {
  const chunks: any[][][] = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * 数据聚合 - 对大数据集进行时间维度聚合
 */
export function aggregateData(
  data: any[][],
  aggregationLevel: 'hour' | 'day' | 'week' | 'month',
  valueColumn: number = 1
): any[][] {
  // 简化实现：按固定间隔聚合
  const intervalMap: Record<typeof aggregationLevel, number> = {
    hour: 60,
    day: 1440,
    week: 10080,
    month: 43200
  };

  const interval = intervalMap[aggregationLevel];
  const aggregated: any[][] = [];

  for (let i = 0; i < data.length; i += interval) {
    const chunk = data.slice(i, Math.min(i + interval, data.length));

    // 计算平均值
    const sum = chunk.reduce((acc, row) => {
      const val = typeof row[valueColumn] === 'number' ? row[valueColumn] : 0;
      return acc + val;
    }, 0);

    aggregated.push([
      data[i][0], // 保留第一个标签
      sum / chunk.length // 平均值
    ]);
  }

  return aggregated;
}

/**
 * 性能优化建议
 */
export function getPerformanceRecommendation(rowCount: number): {
  shouldOptimize: boolean;
  recommendation: string;
  suggestedMaxPoints: number;
} {
  if (rowCount <= PERFORMANCE_THRESHOLDS.SAMPLE_THRESHOLD) {
    return {
      shouldOptimize: false,
      recommendation: '数据量适中，无需优化',
      suggestedMaxPoints: rowCount
    };
  }

  if (rowCount <= PERFORMANCE_THRESHOLDS.LARGE_DATASET_THRESHOLD) {
    return {
      shouldOptimize: true,
      recommendation: '建议使用数据采样以提升渲染性能',
      suggestedMaxPoints: PERFORMANCE_THRESHOLDS.MAX_SAMPLE_POINTS
    };
  }

  return {
    shouldOptimize: true,
    recommendation: '数据量较大，建议使用数据聚合或分页加载',
    suggestedMaxPoints: Math.min(PERFORMANCE_THRESHOLDS.MAX_SAMPLE_POINTS, Math.floor(rowCount / 10))
  };
}

/**
 * Chart.js 性能优化配置
 */
export function getOptimizedChartConfig(rowCount: number) {
  const isLargeDataset = rowCount > PERFORMANCE_THRESHOLDS.SAMPLE_THRESHOLD;

  return {
    // 禁用动画以提升性能
    animation: !isLargeDataset,

    // 启用数据抽取插件
    plugins: {
      decimation: isLargeDataset ? {
        enabled: true,
        algorithm: 'lttb',
        samples: PERFORMANCE_THRESHOLDS.MAX_SAMPLE_POINTS
      } : undefined
    },

    // 优化渲染
    parsing: false, // 禁用数据解析以提升性能
    normalized: true, // 数据已规范化

    // 响应式配置
    responsive: true,
    maintainAspectRatio: false,

    // 元素优化
    elements: {
      point: {
        radius: isLargeDataset ? 0 : 3, // 大数据集隐藏点
        hitRadius: isLargeDataset ? 0 : 5,
        hoverRadius: isLargeDataset ? 3 : 5
      },
      line: {
        borderWidth: isLargeDataset ? 1 : 2 // 减少线宽
      }
    }
  };
}

/**
 * ECharts 性能优化配置
 */
export function getOptimizedEChartsConfig(rowCount: number) {
  const isLargeDataset = rowCount > PERFORMANCE_THRESHOLDS.SAMPLE_THRESHOLD;

  return {
    animation: !isLargeDataset,

    // 启用大数据优化
    large: isLargeDataset,
    largeThreshold: PERFORMANCE_THRESHOLDS.SAMPLE_THRESHOLD,

    // 渐进式渲染
    progressive: isLargeDataset ? 500 : 0,
    progressiveThreshold: isLargeDataset ? 1000 : 3000,

    // 数据采样
    sampling: isLargeDataset ? 'lttb' : undefined,

    // 性能模式
    hoverLayerThreshold: isLargeDataset ? 500 : 3000
  };
}
