import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { QueryResult } from '../../types';
import { EmptyState } from '../common';
import VisualizationConfigDialog, { VisualizationConfig } from '../VisualizationConfigDialog';
import { sqlApiService } from '../../services/sqlApiService';
import { dashboardApiService } from '../../../dashboard/services/dashboardApiService';
import { useSqlChatStore } from '../../stores/useSqlChat';
import useAuth from '@/store/useAuth';
import { toast } from '@/hooks/useToast';

interface DataTableProps {
  data: QueryResult;
  query?: string; // 添加查询SQL
}

interface Dashboard {
  id: string;
  title: string;
}

const DataTable: React.FC<DataTableProps> = ({ data, query }) => {
  const navigate = useNavigate();
  const { currentSessionId } = useSqlChatStore();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [visualizationUrl, setVisualizationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]); // 用户的Dashboard列表
  const [quotaMessage, setQuotaMessage] = useState<string | null>(null); // 配额消息

  // 加载用户的Dashboard列表
  useEffect(() => {
    const loadDashboards = async () => {
      try {
        const list = await dashboardApiService.getDashboardList(user?.id);
        setDashboards(list.map(d => ({ id: d.id, title: d.title })));
      } catch (error) {
        console.error('加载Dashboard列表失败:', error);
      }
    };
    loadDashboards();
  }, [user]);

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
    setQuotaMessage(null);

    try {
      // 调用新的 generateChart API
      const result = await sqlApiService.generateChart({
        sql: query || '',
        queryResult: {
          columns: data.columns,
          rows: data.rows
        },
        chartConfig: {
          type: config.chartType,
          title: config.title,
          xAxis: config.xAxis,
          yAxis: config.yAxis
        },
        dashboardId: config.dashboardId
      });

      setVisualizationUrl(result.panelUrl);
      setQuotaMessage(result.message);

      // 如果添加到了Dashboard，跳转到Dashboard页面
      if (result.addedToDashboard && result.dashboardId) {
        toast.success('图表已添加，正在跳转到 Dashboard...');
        setTimeout(() => navigate(`/dashboard/${result.dashboardId}`), 500);
      } else {
        // 否则打开可视化图表页面
        window.open(result.panelUrl, '_blank');
      }

    } catch (error: any) {
      console.error('图表生成失败:', error);
      setError(error.message || '图表生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToDashboard = () => {
    // 直接打开可视化对话框，用户可以在对话框中选择Dashboard
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="data-table-container">
        {/* 工具栏 */}
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            查询结果: {data.rows.length} 行
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleAddToDashboard}
              disabled={data.rows.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              title="将此查询结果添加到 Dashboard"
            >
              <span>📌</span>
              <span>添加到 Dashboard</span>
            </button>
            <button
              onClick={() => setIsDialogOpen(true)}
              disabled={isGenerating || data.rows.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              <span>📊</span>
              <span>{isGenerating ? '生成中...' : '可视化'}</span>
            </button>
          </div>
        </div>

        {/* 可视化链接展示 */}
        {visualizationUrl && (
          <div className="mb-3 mx-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex items-center justify-between">
              <div className="text-sm text-green-800 dark:text-green-200">
                ✅ 图表已生成！
                {quotaMessage && (
                  <div className="text-xs mt-1 text-green-700 dark:text-green-300">
                    {quotaMessage}
                  </div>
                )}
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
        dashboards={dashboards} // 传递Dashboard列表
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