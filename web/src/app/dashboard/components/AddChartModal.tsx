/**
 * AddChartModal - 添加图表到Dashboard的模态框
 * 核心功能：连接SQL查询和Dashboard，允许用户将查询结果添加为图表
 */

import React, { useState, useEffect } from 'react';
import type { ChartType, ChartConfig } from '../types/dashboard.types';

interface QueryResult {
  columns: string[];
  rows: any[];
  query?: string;
}

interface AddChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (chartConfig: ChartConfig) => void;
  queryResult?: QueryResult;
}

const AddChartModal: React.FC<AddChartModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  queryResult
}) => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [title, setTitle] = useState('新图表');
  const [query, setQuery] = useState('');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);

  // 当传入查询结果时，自动填充数据
  useEffect(() => {
    if (queryResult) {
      setAvailableColumns(queryResult.columns);
      setQuery(queryResult.query || '');

      // 智能推荐图表类型
      if (queryResult.columns.length >= 2) {
        const firstRow = queryResult.rows[0] || {};
        const numericColumns = queryResult.columns.filter(col => {
          const value = firstRow[col];
          return typeof value === 'number' || !isNaN(Number(value));
        });

        if (numericColumns.length >= 1 && queryResult.rows.length > 10) {
          setChartType('line');
        } else if (numericColumns.length >= 1) {
          setChartType('bar');
        }

        // 自动设置轴
        if (queryResult.columns.length >= 2) {
          const firstCol = queryResult.columns[0];
          const secondCol = queryResult.columns[1];

          console.log('Auto-selecting axes:', { xAxis: firstCol, yAxis: secondCol });
          setXAxis(firstCol);
          setYAxis(secondCol);
        }
      }

      setTitle(`查询结果图表 (${queryResult.rows.length} 行)`);
    }
  }, [queryResult]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    // 确保有XY轴值（使用默认值如果未设置）
    const finalXAxis = xAxis || (queryResult?.columns[0] || '');
    const finalYAxis = yAxis || (queryResult?.columns[1] || '');

    if (!finalXAxis || !finalYAxis) {
      alert('无法确定X轴和Y轴字段，请手动选择');
      return;
    }

    console.log('Using axes:', { xAxis: finalXAxis, yAxis: finalYAxis });

    // 生成图表颜色
    const colors = [
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 99, 132, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)'
    ];

    const config: ChartConfig = {
      type: chartType,
      title,
      query,
      config: {
        xAxis: finalXAxis,
        yAxis: finalYAxis,
        // 将查询结果数据存储在配置中
        ...(queryResult && {
          data: {
            labels: queryResult.rows.map(row => String(row[finalXAxis] || '')),
            datasets: [{
              label: finalYAxis || title,
              data: queryResult.rows.map(row => Number(row[finalYAxis]) || 0),
              backgroundColor: chartType === 'pie' ? colors : colors[0],
              borderColor: chartType === 'line' ? colors[0] : undefined,
              borderWidth: chartType === 'line' ? 2 : 1,
              fill: chartType === 'area',
            }]
          }
        })
      }
    };

    console.log('Generated chart config:', config);
    onAdd(config);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-[600px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          添加图表到 Dashboard
        </h2>

        {/* 图表标题 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            图表标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入图表标题"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 图表类型 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            图表类型 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[
              { value: 'line', label: '折线图', icon: '📈' },
              { value: 'bar', label: '柱状图', icon: '📊' },
              { value: 'pie', label: '饼图', icon: '🥧' },
              { value: 'area', label: '面积图', icon: '📉' }
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setChartType(type.value as ChartType)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  chartType === type.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="text-2xl mb-1">{type.icon}</span>
                <span className={`text-sm font-medium ${
                  chartType === type.value
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* SQL 查询 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SQL 查询
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SELECT * FROM table..."
            rows={4}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {queryResult ? '✓ 已从查询结果自动填充' : '可选：用于动态刷新数据'}
          </p>
        </div>

        {/* 数据映射配置 */}
        {availableColumns.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              数据映射 {xAxis && yAxis && (
                <span className="text-green-600 dark:text-green-400 text-xs ml-2">
                  ✓ 已自动选择
                </span>
              )}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  X 轴字段 {xAxis && <span className="text-green-600">✓</span>}
                </label>
                <select
                  value={xAxis}
                  onChange={(e) => setXAxis(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Y 轴字段 {yAxis && <span className="text-green-600">✓</span>}
                </label>
                <select
                  value={yAxis}
                  onChange={(e) => setYAxis(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 数据预览 */}
        {queryResult && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start">
              <span className="text-blue-500 mr-2">ℹ️</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  数据预览
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  <strong>{queryResult.rows.length}</strong> 行数据 ×
                  <strong> {queryResult.columns.length}</strong> 列
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  字段: {queryResult.columns.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 按钮组 */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!title}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            添加图表
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddChartModal;
