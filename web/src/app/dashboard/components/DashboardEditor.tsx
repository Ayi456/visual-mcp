/**
 * Dashboard编辑器核心组件
 * 支持拖拽布局、添加/编辑/删除图表
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { dashboardApiService } from '../services/dashboardApiService';
import { Dashboard, DashboardChart, LayoutItem, ChartConfig, DataSource, ChartJsConfig } from '../types/dashboard.types';
import type { EChartsOption } from 'echarts';
import DashboardToolbar from './DashboardToolbar';
import ChartCard from './ChartCard';
import AddChartModal from './AddChartModal';
import DashboardSettingsModal from './DashboardSettingsModal';
import ShareDashboardModal from './ShareDashboardModal';
import { toast } from '../../../hooks/useToast';
import useAuth from '@/store/useAuth';

const DashboardEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [charts, setCharts] = useState<DashboardChart[]>([]);
  const [layout, setLayout] = useState<Layout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 模态框状态
  const [showAddChartModal, setShowAddChartModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pendingChartData, setPendingChartData] = useState<any>(null);

  // 加载Dashboard数据
  useEffect(() => {
    if (id) {
      loadDashboard(id);
    }
  }, [id]);

  // 检查是否有待添加的图表数据
  useEffect(() => {
    const storedData = sessionStorage.getItem('pendingChartData');
    if (storedData && dashboard) {
      try {
        const chartData = JSON.parse(storedData);
        setPendingChartData(chartData);

        // 清除 sessionStorage
        sessionStorage.removeItem('pendingChartData');

        // 自动打开添加图表弹窗
        setTimeout(() => {
          setShowAddChartModal(true);
        }, 500);
      } catch (error) {
        console.error('解析待添加图表数据失败:', error);
      }
    }
  }, [dashboard]);

  const loadDashboard = async (dashboardId: string) => {
    try {
      setIsLoading(true);
      const data = await dashboardApiService.getDashboard(dashboardId, user?.id);
      setDashboard(data);
      setCharts(data.charts || []);

      // 转换布局格式
      const layoutItems = (data.charts || []).map(chart => ({
        i: chart.id,
        x: chart.position.x,
        y: chart.position.y,
        w: chart.position.w,
        h: chart.position.h,
        minW: 3,
        minH: 3
      }));
      setLayout(layoutItems);
    } catch (error) {
      console.error('加载Dashboard失败:', error);
      toast.error(error instanceof Error ? error.message : '加载失败');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!dashboard || !id) return;

    try {
      setIsSaving(true);

      // 更新图表位置
      const updatedCharts = charts.map(chart => {
        const layoutItem = layout.find(l => l.i === chart.id);
        if (layoutItem) {
          return {
            ...chart,
            position: {
              x: layoutItem.x,
              y: layoutItem.y,
              w: layoutItem.w,
              h: layoutItem.h
            }
          };
        }
        return chart;
      });

      await dashboardApiService.updateDashboard(id, {
        title: dashboard.title,
        description: dashboard.description,
        theme: dashboard.theme,
        layoutConfig: {
          gridCols: 12,
          rowHeight: 80,
          charts: layout
        },
        charts: updatedCharts,
        userId: user?.id
      });

      setIsEditing(false);
      toast.success('Dashboard 已保存');
    } catch (error) {
      console.error('保存失败:', error);
      toast.error(error instanceof Error ? error.message : '保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
  };

  const handleRemoveChart = (chartId: string) => {
    setCharts(prev => prev.filter(c => c.id !== chartId));
    setLayout(prev => prev.filter(l => l.i !== chartId));
    setIsEditing(true);
    toast.info('图表已移除，记得保存');
  };

  const handleAddChart = () => {
    setShowAddChartModal(true);
  };

  /**
   * 查找下一个可用的布局位置
   * @param existingLayout 现有布局
   * @param width 新图表宽度
   * @param height 新图表高度
   * @returns 新图表的位置 {x, y}
   */
  const findNextAvailablePosition = (existingLayout: Layout[], width: number = 6, height: number = 4) => {
    const gridCols = 12;
    
    // 如果没有现有图表，从左上角开始
    if (existingLayout.length === 0) {
      return { x: 0, y: 0 };
    }

    // 创建一个网格占用映射
    const maxY = Math.max(...existingLayout.map(item => item.y + item.h));
    const grid: boolean[][] = [];
    for (let row = 0; row <= maxY + height; row++) {
      grid[row] = new Array(gridCols).fill(false);
    }

    // 标记已占用的位置
    existingLayout.forEach(item => {
      for (let row = item.y; row < item.y + item.h; row++) {
        for (let col = item.x; col < item.x + item.w; col++) {
          if (grid[row] && col < gridCols) {
            grid[row][col] = true;
          }
        }
      }
    });

    // 从上到下、从左到右查找第一个可用位置
    for (let row = 0; row <= maxY + height; row++) {
      for (let col = 0; col <= gridCols - width; col++) {
        // 检查这个位置是否可以容纳新图表
        let canFit = true;
        for (let r = row; r < row + height && canFit; r++) {
          for (let c = col; c < col + width && canFit; c++) {
            if (grid[r] && grid[r][c]) {
              canFit = false;
            }
          }
        }

        if (canFit) {
          return { x: col, y: row };
        }
      }
    }

    // 如果没找到合适位置，放在最底部
    return { x: 0, y: maxY };
  };

  const handleAddChartConfirm = (chartConfig: ChartConfig) => {
    // 生成新图表ID
    const newChartId = `chart-${Date.now()}`;

    // 确保chartConfig.config.data存在且格式正确
    const chartData = chartConfig.config.data || {
      labels: [] as string[],
      datasets: [] as Array<{ label: string; data: any[]; [key: string]: any }>
    };

    const labels = chartData.labels || [];
    const datasets = chartData.datasets || [];

    // 将简化的配置转换为 EChartsOption（用于 Dashboard 内部渲染）
    let echartsOption: EChartsOption;

    if (chartConfig.type === 'pie') {
      // 饼图：使用第一个数据集
      const firstDs = datasets[0] || { label: chartConfig.title, data: [] };
      const seriesData = labels.map((label, idx) => ({
        name: label,
        value: firstDs.data[idx] ?? 0
      }));

      echartsOption = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: chartConfig.title,
            type: 'pie',
            radius: '60%',
            data: seriesData
          }
        ]
      };
    } else {
      // 直角坐标系图：折线图/面积图/柱状图
      const isLine = chartConfig.type === 'line' || chartConfig.type === 'area';
      const isBar = chartConfig.type === 'bar';

      echartsOption = {
        tooltip: { trigger: 'axis' },
        legend: {
          data: datasets.map(ds => ds.label)
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: labels,
          name: chartConfig.config.xAxis
        },
        yAxis: {
          type: 'value',
          name: chartConfig.config.yAxis
        },
        series: datasets.map(ds => ({
          name: ds.label,
          type: isBar ? 'bar' : 'line',
          data: ds.data,
          smooth: isLine,
          areaStyle: chartConfig.type === 'area' ? { opacity: 0.2 } : undefined
        }))
      };
    }

    // 创建数据源（从chartConfig中提取）
    const dataSource: DataSource = {
      type: 'sql-query',
      query: chartConfig.query,
      schema: labels.map(label => ({
        name: label,
        type: 'string'
      })),
      // 注意：这里的数据仅用于简单回显，真正渲染直接使用 chartConfig(EChartsOption)
      data: datasets.map(ds => ds.data),
    };

    // 查找下一个可用位置
    const newPosition = findNextAvailablePosition(layout, 6, 4);

    // 创建新图表
    const newChart: DashboardChart = {
      id: newChartId,
      dashboardId: id!,
      chartTitle: chartConfig.title,
      chartType: chartConfig.type,
      chartConfig: echartsOption as ChartJsConfig,
      dataSource: dataSource,
      position: {
        x: newPosition.x,
        y: newPosition.y,
        w: 6,
        h: 4
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 添加到图表列表
    setCharts(prev => [...prev, newChart]);

    // 添加布局项
    setLayout(prev => [...prev, {
      i: newChartId,
      x: newPosition.x,
      y: newPosition.y,
      w: 6,
      h: 4,
      minW: 3,
      minH: 3
    }]);

    setShowAddChartModal(false);
    setIsEditing(true); // 自动进入编辑模式以便调整位置
  };

  const handleSettings = () => {
    setShowSettingsModal(true);
  };

  const handleSettingsSave = (settings: { title: string; description?: string; theme: string }) => {
    if (dashboard) {
      setDashboard({
        ...dashboard,
        ...settings
      });
    }
  };

  const handleSettingsDelete = async () => {
    if (!id) return;

    try {
      await dashboardApiService.deleteDashboard(id, user?.id);
      toast.success('Dashboard 已删除');
      navigate('/dashboard');
    } catch (error) {
      console.error('删除失败:', error);
      toast.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  const handleShare = async () => {
    setShowShareModal(true);
  };

  const handlePublish = async (): Promise<string> => {
    if (!id) throw new Error('Dashboard ID 不存在');

    try {
      const result = await dashboardApiService.publishDashboard(id, user?.id);

      // 更新dashboard状态
      if (dashboard) {
        setDashboard({
          ...dashboard,
          share_token: result.shareToken,
          panel_url: result.panelUrl
        });
      }

      return result.panelUrl;
    } catch (error) {
      console.error('发布失败:', error);
      throw error;
    }
  };

  const handleTogglePublic = async (isPublic: boolean) => {
    if (!id || !dashboard) return;

    try {
      await dashboardApiService.updateDashboard(id, {
        ...dashboard,
        is_public: isPublic,
        userId: user?.id
      });

      setDashboard({
        ...dashboard,
        is_public: isPublic
      });
    } catch (error) {
      console.error('更新公开状态失败:', error);
      toast.error(error instanceof Error ? error.message : '更新失败');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Dashboard不存在</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-editor soft-blue-bg h-screen flex flex-col">
      {/* 工具栏 */}
      <DashboardToolbar
        dashboard={dashboard}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onAddChart={handleAddChart}
        onSettings={handleSettings}
        onShare={handleShare}
        onBack={() => navigate('/dashboard')}
      />

      {/* 主编辑区域 */}
      <div className="flex-1 overflow-auto p-6">
        {charts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              还没有图表
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              点击"添加图表"开始创建你的第一个可视化图表
            </p>
            <button
              onClick={handleAddChart}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              添加第一个图表
            </button>
          </div>
        ) : (
          <div className="max-w-[1600px] mx-auto">
            <GridLayout
              className="layout"
              layout={layout}
              cols={12}
              rowHeight={80}
              width={1600}
              onLayoutChange={handleLayoutChange}
              isDraggable={isEditing}
              isResizable={isEditing}
              compactType="vertical"
              preventCollision={false}
              margin={[20, 20]}
            >
              {charts.map((chart) => (
                <div key={chart.id} className="grid-item">
                  <ChartCard
                    chart={chart}
                    isEditing={isEditing}
                    onRemove={handleRemoveChart}
                  />
                </div>
              ))}
            </GridLayout>
          </div>
        )}
      </div>

      {/* 保存状态提示 */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg">
          正在保存...
        </div>
      )}

      {/* 编辑模式提示 */}
      {isEditing && charts.length > 0 && (
        <div className="fixed bottom-4 left-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow-lg text-sm">
          💡 拖拽图表可调整位置，拖拽边角可调整大小
        </div>
      )}

      {/* 模态框 */}
      <AddChartModal
        isOpen={showAddChartModal}
        onClose={() => {
          setShowAddChartModal(false);
          setPendingChartData(null);
        }}
        onAdd={handleAddChartConfirm}
        queryResult={pendingChartData}
      />

      <DashboardSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentSettings={{
          title: dashboard.title,
          description: dashboard.description,
          theme: dashboard.theme
        }}
        onSave={handleSettingsSave}
        onDelete={handleSettingsDelete}
      />

      <ShareDashboardModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        dashboardId={id!}
        shareToken={dashboard.share_token}
        isPublic={dashboard.is_public}
        onPublish={handlePublish}
        onTogglePublic={handleTogglePublic}
      />
    </div>
  );
};

export default DashboardEditor;
