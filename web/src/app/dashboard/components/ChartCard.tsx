/**
 * 图表卡片组件
 * 用于在Dashboard中展示单个图表
 * 使用 ECharts 统一渲染
 */

import React, { memo } from 'react';
import UniversalChartRenderer from './UniversalChartRenderer';
import { DashboardChart } from '../types/dashboard.types';

interface ChartCardProps {
  chart: DashboardChart;
  isEditing: boolean;
  onEdit?: (chartId: string) => void;
  onRemove?: (chartId: string) => void;
}

const ChartCard: React.FC<ChartCardProps> = memo(({
  chart,
  isEditing,
  onEdit,
  onRemove
}) => {

  return (
    <div className="chart-card h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 relative">
      {/* 拖拽手柄（编辑模式） */}
      {isEditing && (
        <div className="absolute top-2 left-2 cursor-move text-gray-400 hover:text-gray-600 z-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
      )}

      {/* 卡片头部 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
          {chart.chartTitle}
        </h3>

        {isEditing && (
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(chart.id);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="编辑图表"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-600 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            )}
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(chart.id);
                }}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                title="删除图表"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 图表渲染区域 */}
      <div
        className="chart-container"
        style={{
          height: 'calc(100% - 60px)',
          minHeight: '200px',
          position: 'relative'
        }}
      >
        <UniversalChartRenderer
          option={{
            ...chart.chartConfig,
            grid: {
              ...((chart.chartConfig as any).grid || {}),
              top: 40,
              bottom: 40,
              left: 60,
              right: 40,
              containLabel: true
            }
          }}
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // 优化重渲染：仅在关键属性变化时重新渲染
  return (
    prevProps.chart.id === nextProps.chart.id &&
    prevProps.isEditing === nextProps.isEditing &&
    JSON.stringify(prevProps.chart.chartConfig) === JSON.stringify(nextProps.chart.chartConfig)
  );
});

ChartCard.displayName = 'ChartCard';

export default ChartCard;
