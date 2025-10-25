import React, { useState } from 'react';
import type { QueryResult } from '../../types';
import { EmptyState } from '../common';
import VisualizationConfigDialog, { VisualizationConfig } from '../VisualizationConfigDialog';
import { sqlApiService } from '../../services/sqlApiService';

interface DataTableProps {
  data: QueryResult;
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [visualizationUrl, setVisualizationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!data || data.rows.length === 0) {
    return (
      <EmptyState
        title="无数据"
        description="查询结果为空"
      />
    );
  }

  const handleVisualize = async (config: VisualizationConfig) => {
    setIsGenerating(true);
    setIsDialogOpen(false);
    setError(null);

    try {
      // 将查询结果转换为二维数组格式
      const dataArray = data.rows.map(row =>
        data.columns.map(col => row[col])
      );

      // 推断字段类型
      const schema = data.columns.map(col => {
        const firstValue = data.rows[0]?.[col];
        let type = 'string';

        if (typeof firstValue === 'number' || !isNaN(Number(firstValue))) {
          type = 'number';
        } else if (firstValue instanceof Date ||
                   (typeof firstValue === 'string' && !isNaN(Date.parse(firstValue)))) {
          type = 'date';
        } else if (typeof firstValue === 'boolean') {
          type = 'boolean';
        }

        return { name: col, type };
      });

      console.log('准备可视化数据:', {
        dataRows: dataArray.length,
        schema,
        config
      });

      // 调用 API
      const result = await sqlApiService.visualizeQueryResult({
        data: dataArray,
        schema,
        chartType: config.chartType,
        title: config.title,
        style: {
          theme: config.theme,
          animation: true,
          responsive: true,
          showLegend: true
        }
      });

      console.log('可视化结果:', result);

      setVisualizationUrl(result.panelUrl);

      // 自动打开新窗口
      window.open(result.panelUrl, '_blank');

    } catch (error: any) {
      console.error('可视化失败:', error);
      setError(error.message || '可视化生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="data-table-container">
        {/* 工具栏 */}
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            查询结果: {data.rows.length} 行
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            disabled={isGenerating || data.rows.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <span>📊</span>
            <span>{isGenerating ? '生成中...' : '可视化'}</span>
          </button>
        </div>

        {/* 可视化链接展示 */}
        {visualizationUrl && (
          <div className="mb-3 mx-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex items-center justify-between">
              <div className="text-sm text-green-800 dark:text-green-200">
                ✅ 图表已生成！
                <a
                  href={visualizationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  点击查看
                </a>
              </div>
              <button
                onClick={() => window.open(visualizationUrl, '_blank')}
                className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                在新窗口打开
              </button>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mb-3 mx-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="text-sm text-red-800 dark:text-red-200">
              ❌ {error}
            </div>
          </div>
        )}

        {/* 表格展示 */}
        <div className="data-table">
          <table>
            <thead>
              <tr>
                {data.columns.map((column, index) => (
                  <th key={index}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {data.columns.map((column, colIndex) => (
                    <td key={colIndex}>
                      {formatCellValue(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 配置对话框 */}
      <VisualizationConfigDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        queryResult={{ columns: data.columns, rows: data.rows }}
        onConfirm={handleVisualize}
      />
    </>
  );
};

// 格式化单元格值
function formatCellValue(value: any): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

export default DataTable;