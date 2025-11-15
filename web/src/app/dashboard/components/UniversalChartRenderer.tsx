/**
 * 通用图表渲染器
 * 统一使用 ECharts 渲染所有图表类型
 */

import React, { useEffect, useRef, memo } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface UniversalChartRendererProps {
  option: EChartsOption;
  style?: React.CSSProperties;
  theme?: string | object;
  loading?: boolean;
  onChartReady?: (instance: echarts.ECharts) => void;
  className?: string;
}

const UniversalChartRenderer: React.FC<UniversalChartRendererProps> = memo(({
  option,
  style = { height: '400px', width: '100%' },
  theme,
  loading = false,
  onChartReady,
  className = ''
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // 初始化和更新图表
  useEffect(() => {
    if (!chartRef.current) return;

    try {
      // 初始化图表实例
      if (!chartInstanceRef.current) {
        chartInstanceRef.current = echarts.init(chartRef.current, theme);
        onChartReady?.(chartInstanceRef.current);
      }

      // 设置选项（使用 notMerge 避免数据累积）
      chartInstanceRef.current.setOption(option, {
        notMerge: true,
        lazyUpdate: false
      });

      // 处理加载状态
      if (loading) {
        chartInstanceRef.current.showLoading('default', {
          text: '加载中...',
          color: '#3b82f6',
          textColor: '#000',
          maskColor: 'rgba(255, 255, 255, 0.4)',
          zlevel: 0
        });
      } else {
        chartInstanceRef.current.hideLoading();
      }

    } catch (error) {
      console.error('ECharts 渲染失败:', error);
    }
  }, [option, theme, loading, onChartReady]);

  // 响应式处理 - 使用 ResizeObserver 替代 window resize
  useEffect(() => {
    if (!chartRef.current || !chartInstanceRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      // 使用 requestAnimationFrame 优化性能
      requestAnimationFrame(() => {
        chartInstanceRef.current?.resize({
          animation: {
            duration: 300,
            easing: 'cubicOut'
          }
        });
      });
    });

    resizeObserver.observe(chartRef.current);
    resizeObserverRef.current = resizeObserver;

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      resizeObserverRef.current?.disconnect();
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={chartRef}
      style={style}
      className={className}
      data-testid="universal-chart-renderer"
    />
  );
}, (prevProps, nextProps) => {
  // 自定义比较逻辑，避免不必要的重渲染
  return (
    JSON.stringify(prevProps.option) === JSON.stringify(nextProps.option) &&
    prevProps.theme === nextProps.theme &&
    prevProps.loading === nextProps.loading &&
    JSON.stringify(prevProps.style) === JSON.stringify(nextProps.style)
  );
});

UniversalChartRenderer.displayName = 'UniversalChartRenderer';

export default UniversalChartRenderer;
