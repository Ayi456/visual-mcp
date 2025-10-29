import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ResizablePanelProps {
  topContent: React.ReactNode;
  bottomContent: React.ReactNode;
  defaultTopHeight?: number; // 默认上面板高度百分比 (0-100)
  minTopHeight?: number; // 最小上面板高度百分比
  maxTopHeight?: number; // 最大上面板高度百分比
  storageKey?: string; // localStorage中的键名，用于保存用户偏好
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  topContent,
  bottomContent,
  defaultTopHeight = 50,
  minTopHeight = 20,
  maxTopHeight = 80,
  storageKey,
}) => {
  // 从 localStorage获取保存的高度，如果没有则使用默认值
  const getInitialHeight = () => {
    if (typeof window !== 'undefined' && storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const height = parseFloat(saved);
        if (!isNaN(height) && height >= minTopHeight && height <= maxTopHeight) {
          return height;
        }
      }
    }
    return defaultTopHeight;
  };

  const [topHeight, setTopHeight] = useState(getInitialHeight);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerHeight = containerRect.height;
      const relativeY = e.clientY - containerRect.top;
      const percentageHeight = (relativeY / containerHeight) * 100;

      // 限制在最小和最大高度之间
      const newHeight = Math.min(
        Math.max(percentageHeight, minTopHeight),
        maxTopHeight
      );

      setTopHeight(newHeight);
      
      // 保存到localStorage
      if (storageKey) {
        localStorage.setItem(storageKey, newHeight.toString());
      }
    },
    [isDragging, minTopHeight, maxTopHeight]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // 防止拖拽时选中文本
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ns-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full relative">
      {/* 上面板 */}
      <div 
        className="overflow-hidden"
        style={{ height: `${topHeight}%` }}
      >
        {topContent}
      </div>

      {/* 可拖拽的分隔条 */}
      <div className="relative group">
        {/* 拖拽热区 - 更大的可点击区域 */}
        <div
          className="absolute inset-x-0 -top-2 -bottom-2 cursor-ns-resize z-10"
          onMouseDown={handleMouseDown}
        />
        {/* 分隔条视觉元素 */}
        <div
          className={`
            relative h-1 bg-gray-300 dark:bg-gray-600 
            group-hover:bg-blue-400 dark:group-hover:bg-blue-500 transition-all
            ${isDragging ? 'bg-blue-500 dark:bg-blue-500 h-1.5' : ''}
          `}
        >
          {/* 拖拽手柄图标 */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-0.5">
                <div className="w-0.5 h-0.5 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                <div className="w-0.5 h-0.5 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                <div className="w-0.5 h-0.5 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="w-0.5 h-0.5 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                <div className="w-0.5 h-0.5 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                <div className="w-0.5 h-0.5 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="w-0.5 h-0.5 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                <div className="w-0.5 h-0.5 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                <div className="w-0.5 h-0.5 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 下面板 */}
      <div 
        className="flex-1 overflow-hidden min-h-0"
        style={{ height: `${100 - topHeight}%` }}
      >
        {bottomContent}
      </div>
    </div>
  );
};

export default ResizablePanel;