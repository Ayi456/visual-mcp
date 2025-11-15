import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface EChartsRendererProps {
  option: echarts.EChartsOption;
  style?: React.CSSProperties;
  theme?: string | object;
  loading?: boolean;
  onChartReady?: (instance: echarts.ECharts) => void;
}

const EChartsRenderer: React.FC<EChartsRendererProps> = ({
  option,
  style = { height: '400px', width: '100%' },
  theme,
  loading = false,
  onChartReady
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化或获取图表实例
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current, theme);
      onChartReady?.(chartInstanceRef.current);
    }

    // 设置选项
    chartInstanceRef.current.setOption(option, true);

    // 处理加载状态
    if (loading) {
      chartInstanceRef.current.showLoading();
    } else {
      chartInstanceRef.current.hideLoading();
    }

    // 处理窗口大小变化
    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [option, theme, loading, onChartReady]);

  // 组件卸载时销毁图表实例
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  return <div ref={chartRef} style={style} />;
};

export default EChartsRenderer;
