/**
 * Dashboard列表页
 * 显示用户所有的Dashboard，支持创建、编辑、删除
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dashboardApiService } from '../services/dashboardApiService';
import { DashboardListResponse } from '../types/dashboard.types';
import useAuth from '@/store/useAuth';
import { toast } from '../../../hooks/useToast';

const DashboardList: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dashboards, setDashboards] = useState<DashboardListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDashboardTitle, setNewDashboardTitle] = useState('');
  const [showPendingChartDialog, setShowPendingChartDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    loadDashboards();
    const pendingChartData = sessionStorage.getItem('pendingChartData');
    if (pendingChartData) {
      setShowPendingChartDialog(true);
    }
  }, []);

  const loadDashboards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardApiService.getDashboardList(user?.id);
      setDashboards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDashboard = async () => {
    if (!newDashboardTitle.trim()) {
      toast.warning('请输入 Dashboard 标题');
      return;
    }

    try {
      const result = await dashboardApiService.createDashboard({
        title: newDashboardTitle,
        theme: 'default',
        layoutConfig: {
          gridCols: 12,
          rowHeight: 80,
          charts: []
        },
        userId: user?.id
      });

      setShowCreateModal(false);
      setNewDashboardTitle('');

      // 跳转到编辑页
      navigate(`/dashboard/${result.dashboardId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '创建失败');
    }
  };

  const handleDeleteDashboard = async (id: string, title: string) => {
    setDeleteConfirm({ id, title });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await dashboardApiService.deleteDashboard(deleteConfirm.id, user?.id);
      await loadDashboards();
      setDeleteConfirm(null);
      toast.success('Dashboard 已删除');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败');
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
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

  return (
    <div className="soft-blue-bg min-h-screen relative overflow-hidden">

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="absolute top-32 left-20 opacity-[0.06] dark:opacity-[0.08]">
          <svg width="140" height="140" viewBox="0 0 100 100" className="text-sky-500 animate-float">
            <rect x="10" y="60" width="15" height="30" fill="currentColor" rx="3"/>
            <rect x="30" y="40" width="15" height="50" fill="currentColor" rx="3"/>
            <rect x="50" y="20" width="15" height="70" fill="currentColor" rx="3"/>
            <rect x="70" y="50" width="15" height="40" fill="currentColor" rx="3"/>
          </svg>
        </div>

        <div className="absolute top-1/3 right-24 opacity-[0.06] dark:opacity-[0.08]">
          <svg width="100" height="100" viewBox="0 0 100 100" className="text-blue-500 animate-float" style={{ animationDelay: '1s' }}>
            <path d="M10,80 L30,60 L50,40 L70,30 L90,20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="10" cy="80" r="4" fill="currentColor"/>
            <circle cx="30" cy="60" r="4" fill="currentColor"/>
            <circle cx="50" cy="40" r="4" fill="currentColor"/>
            <circle cx="70" cy="30" r="4" fill="currentColor"/>
            <circle cx="90" cy="20" r="4" fill="currentColor"/>
          </svg>
        </div>

        <div className="absolute bottom-32 right-32 opacity-[0.06] dark:opacity-[0.08]">
          <svg width="160" height="160" viewBox="0 0 120 120" className="text-cyan-500 animate-float-delayed">
            <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="8,8"/>
            <circle cx="60" cy="60" r="35" fill="none" stroke="currentColor" strokeWidth="2.5"/>
            <circle cx="60" cy="60" r="20" fill="currentColor" opacity="0.4"/>
          </svg>
        </div>

        <div className="absolute bottom-1/4 left-32 opacity-[0.06] dark:opacity-[0.08]">
          <svg width="120" height="120" viewBox="0 0 100 100" className="text-blue-500 animate-float" style={{ animationDelay: '2s' }}>
            <path d="M50,10 L90,50 L50,90 L10,50 Z" fill="none" stroke="currentColor" strokeWidth="2.5"/>
            <path d="M50,30 L70,50 L50,70 L30,50 Z" fill="currentColor" opacity="0.3"/>
          </svg>
        </div>
      </div>

      <nav className="border-b border-gray-100 dark:border-gray-900 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center group">
              <span className="text-base font-medium text-gray-900 dark:text-white tracking-tight">
                数据可视化平台
              </span>
            </Link>
            <div className="flex items-center gap-8">
              <Link to="/account" className="text-base text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                账户中心
              </Link>
              <Link to="/dashboard" className="text-base text-sky-600 dark:text-sky-400 font-medium">
                Dashboard
              </Link>
              <Link to="/sql" className="text-base text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                SQL 控制台
              </Link>
              <button onClick={logout} className="text-base text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 relative z-10">
      <div className="flex items-center justify-between mb-16">
        <div className="animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-white dark:to-gray-100 bg-clip-text text-transparent tracking-tight mb-3">
            我的 Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-light">
            管理和查看您的数据可视化面板
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="group relative inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600 hover:from-sky-600 hover:via-blue-600 hover:to-sky-700 text-white rounded-2xl shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 hover:scale-105 transition-all duration-300 font-semibold overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="relative">新建 Dashboard</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 flex items-center gap-3 mb-8 shadow-lg shadow-red-500/10">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {dashboards.length === 0 ? (
        <div className="text-center py-32 animate-fade-in">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative w-32 h-32 bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/40 dark:to-blue-900/40 rounded-3xl mx-auto flex items-center justify-center shadow-xl transform hover:rotate-6 transition-transform duration-300">
              <svg className="w-16 h-16 text-sky-500 dark:text-sky-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">暂无 Dashboard</h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">开始创建您的第一个数据可视化面板，让数据分析更加直观</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600 hover:from-sky-600 hover:via-blue-600 hover:to-sky-700 text-white rounded-2xl shadow-xl shadow-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/50 hover:scale-110 transition-all duration-300 font-semibold text-lg overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="relative">开始创建</span>
          </button>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
          {dashboards.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((dashboard, index) => (
            <div
              key={dashboard.id}
              className="group relative p-8 bg-gradient-to-br from-white via-white to-gray-50/80 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/80 rounded-3xl border-2 border-gray-200/50 dark:border-gray-800/50 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 overflow-hidden cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-sky-400/10 to-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.07] transform translate-x-8 -translate-y-8 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                <svg viewBox="0 0 100 100" fill="currentColor" className="text-sky-500">
                  <rect x="10" y="50" width="15" height="40" rx="2"/>
                  <rect x="30" y="30" width="15" height="60" rx="2"/>
                  <rect x="50" y="20" width="15" height="70" rx="2"/>
                  <rect x="70" y="40" width="15" height="50" rx="2"/>
                </svg>
              </div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-tr from-blue-400/5 to-sky-400/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-300">
                      {dashboard.title}
                    </h3>
                    {dashboard.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                        {dashboard.description}
                      </p>
                    )}
                  </div>
                  {dashboard.isPublic && (
                    <span className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 dark:from-emerald-900/40 dark:to-green-900/40 dark:text-emerald-400 text-xs rounded-xl font-semibold ml-2 flex-shrink-0 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
                      已发布
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-5">
                  <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-semibold text-gray-900 dark:text-white">{dashboard.chartCount}</span>
                  <span className="text-sm">个图表</span>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-500 mb-5 flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">更新于 {formatDate(dashboard.updatedAt)}</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/dashboard/${dashboard.id}`)}
                    className="group/btn flex-1 relative text-center text-sm py-3.5 px-5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-white dark:to-gray-100 text-white dark:text-gray-900 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300 font-bold overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-600 via-blue-600 to-sky-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      查看面板
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteDashboard(dashboard.id, dashboard.title)}
                    className="group/del p-3.5 rounded-2xl text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-110"
                    title="删除"
                  >
                    <svg className="w-5 h-5 group-hover/del:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {dashboards.length > pageSize && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-900">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              显示第 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, dashboards.length)} 项，共 {dashboards.length} 项
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                上一页
              </button>
              <span className="px-3 py-1.5 text-sm bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-lg">
                {currentPage} / {Math.ceil(dashboards.length / pageSize)}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(dashboards.length / pageSize), p + 1))}
                disabled={currentPage >= Math.ceil(dashboards.length / pageSize)}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                下一页
              </button>
            </div>
          </div>
        )}
        </>
      )}

      {showPendingChartDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-[480px] transform transition-all animate-slide-up">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto mb-4">
              <span className="text-3xl">📊</span>
            </div>

            <h2 className="text-2xl font-bold text-center mb-3 text-gray-900 dark:text-gray-100">
              添加图表到 Dashboard
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              检测到待添加的图表数据，您想要：
            </p>


            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowPendingChartDialog(false);
                  setShowCreateModal(true);
                }}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all hover:shadow-lg flex items-center justify-center space-x-2 font-medium"
              >
                <span>✨</span>
                <span>创建新 Dashboard</span>
              </button>
              <button
                onClick={() => {
                  setShowPendingChartDialog(false);
                }}
                className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center space-x-2 font-medium"
              >
                <span>📋</span>
                <span>添加到现有 Dashboard</span>
              </button>
            </div>

            <button
              onClick={() => {
                setShowPendingChartDialog(false);
                sessionStorage.removeItem('pendingChartData');
              }}
              className="w-full mt-3 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              暂时不添加
            </button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-[500px] transform transition-all animate-slide-up">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              创建新 Dashboard
            </h2>
            <input
              type="text"
              value={newDashboardTitle}
              onChange={(e) => setNewDashboardTitle(e.target.value)}
              placeholder="请输入 Dashboard 标题"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-6 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleCreateDashboard()}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewDashboardTitle('');
                }}
                className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
              >
                取消
              </button>
              <button
                onClick={handleCreateDashboard}
                className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all hover:shadow-lg font-medium"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-[450px] transform transition-all animate-slide-up">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>

            <h2 className="text-2xl font-bold text-center mb-3 text-gray-900 dark:text-gray-100">
              确认删除
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-2">
              确定要删除以下 Dashboard 吗？
            </p>
            <p className="text-center font-semibold text-gray-900 dark:text-gray-100 mb-6">
              "{deleteConfirm.title}"
            </p>
            <p className="text-center text-sm text-red-600 dark:text-red-400 mb-6">
              此操作无法撤销
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all hover:shadow-lg font-medium"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default DashboardList;
