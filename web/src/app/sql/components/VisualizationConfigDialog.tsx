import React, { useState, useEffect } from 'react';

interface VisualizationConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  queryResult: {
    columns: string[];
    rows: any[];
  };
  onConfirm: (config: VisualizationConfig) => void;
}

export interface VisualizationConfig {
  chartType: string;
  title: string;
  theme: string;
  xAxis?: string;
  yAxis?: string;
}

const VisualizationConfigDialog: React.FC<VisualizationConfigDialogProps> = ({
  isOpen,
  onClose,
  queryResult,
  onConfirm
}) => {
  const [chartType, setChartType] = useState<string>('auto');
  const [title, setTitle] = useState<string>('查询结果可视化');
  const [theme, setTheme] = useState<string>('default');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string>('');

  // 智能推荐图表类型（前端简易版）
  useEffect(() => {
    if (queryResult.columns.length >= 2) {
      // 检测数值列数量
      const firstRow = queryResult.rows[0] || {};
      const numericColumns = queryResult.columns.filter(col => {
        const value = firstRow[col];
        return typeof value === 'number' || !isNaN(Number(value));
      });

      // 简单推荐逻辑
      if (numericColumns.length >= 1 && queryResult.rows.length > 10) {
        setChartType('line'); // 折线图
      } else if (numericColumns.length >= 1) {
        setChartType('bar'); // 柱状图
      }
    }

    // 自动设置默认标题
    setTitle(`查询结果可视化 (${queryResult.rows.length} 行)`);
  }, [queryResult]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      chartType,
      title,
      theme,
      xAxis,
      yAxis
    });
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">配置可视化图表</h2>

        {/* 图表类型选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            图表类型
          </label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="auto">自动推荐</option>
            <option value="line">折线图</option>
            <option value="bar">柱状图</option>
            <option value="pie">饼图</option>
            <option value="scatter">散点图</option>
            <option value="area">面积图</option>
            <option value="radar">雷达图</option>
            <option value="bubble">气泡图</option>
            <option value="heatmap">热力图</option>
          </select>
        </div>

        {/* 图表标题 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            图表标题
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入图表标题"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 主题选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            主题风格
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 'default', label: '默认' },
              { value: 'dark', label: '深色' },
              { value: 'business', label: '商务' },
              { value: 'colorful', label: '彩色' }
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  theme === t.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* X轴/Y轴选择（可选） */}
        {queryResult.columns.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              坐标轴设置（可选）
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">X轴字段</label>
                <select
                  value={xAxis}
                  onChange={(e) => setXAxis(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">自动</option>
                  {queryResult.columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Y轴字段</label>
                <select
                  value={yAxis}
                  onChange={(e) => setYAxis(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">自动</option>
                  {queryResult.columns.map((col) => (
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
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">数据预览</div>
          <div className="text-sm text-gray-900 dark:text-gray-100">
            <strong>{queryResult.rows.length}</strong> 行 ×
            <strong> {queryResult.columns.length}</strong> 列
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            字段: {queryResult.columns.join(', ')}
          </div>
        </div>

        {/* 按钮组 */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            生成图表
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisualizationConfigDialog;
