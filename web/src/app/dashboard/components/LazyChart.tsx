import React, { useEffect, useRef, useState } from 'react';

interface LazyChartProps {
  children: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  placeholder?: React.ReactNode;
  onVisible?: () => void;
}

/**
 * 懒加载图表组件
 * 使用 Intersection Observer API 实现视口内才渲染
 */
const LazyChart: React.FC<LazyChartProps> = ({
  children,
  rootMargin = '50px',
  threshold = 0.1,
  placeholder,
  onVisible
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 创建 Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          onVisible?.();
          // 一旦可见，停止观察以节省资源
          observer.unobserve(container);
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, isVisible, onVisible]);

  return (
    <div ref={containerRef} style={{ minHeight: '400px', width: '100%' }}>
      {isVisible ? (
        children
      ) : (
        placeholder || (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-gray-400">加载中...</div>
          </div>
        )
      )}
    </div>
  );
};

export default LazyChart;
