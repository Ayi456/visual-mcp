/**
 * ShareDashboardModal - Dashboard分享模态框
 * 功能：美化分享链接展示、一键复制、分享设置、分享统计
 */

import React, { useState, useEffect } from 'react';
import { dashboardApiService } from '../services/dashboardApiService';

interface ShareDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardId: string;
  shareToken?: string;
  isPublic: boolean;
  onPublish?: () => Promise<string>; // 返回分享链接
  onTogglePublic?: (isPublic: boolean) => void;
}

const ShareDashboardModal: React.FC<ShareDashboardModalProps> = ({
  isOpen,
  onClose,
  dashboardId,
  shareToken,
  isPublic,
  onPublish,
  onTogglePublic
}) => {
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [stats, setStats] = useState<{ totalViews: number; uniqueVisitors: number; lastViewedAt: string | null } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // 生成分享链接
  useEffect(() => {
    if (shareToken) {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/share/dashboard/${shareToken}`);
    }
  }, [shareToken]);

  // 获取分享统计数据
  useEffect(() => {
    if (isOpen && shareToken && dashboardId) {
      setLoadingStats(true);
      dashboardApiService
        .getDashboardStats(dashboardId)
        .then((data) => {
          setStats(data);
        })
        .catch((error) => {
          console.error('获取统计数据失败:', error);
          setStats({ totalViews: 0, uniqueVisitors: 0, lastViewedAt: null });
        })
        .finally(() => {
          setLoadingStats(false);
        });
    }
  }, [isOpen, shareToken, dashboardId]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请手动复制');
    }
  };

  const handlePublish = async () => {
    if (onPublish) {
      setIsPublishing(true);
      try {
        const url = await onPublish();
        setShareUrl(url);
      } catch (error) {
        console.error('发布失败:', error);
        alert('发布失败，请稍后重试');
      } finally {
        setIsPublishing(false);
      }
    }
  };

  const handleTogglePublic = () => {
    if (onTogglePublic) {
      onTogglePublic(!isPublic);
    }
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[550px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <span className="mr-2">🔗</span>
            分享 Dashboard
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            与他人分享您的数据可视化面板
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 公开设置 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                公开访问
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isPublic ? '任何人都可以通过链接访问' : '仅限授权用户访问'}
              </p>
            </div>
            <button
              onClick={handleTogglePublic}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublic ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* 分享链接 */}
          {shareToken ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                分享链接
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {copied ? '✓ 已复制' : '复制'}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                💡 此链接包含访问令牌，可以直接分享给他人
              </p>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                ℹ️ 此 Dashboard 尚未发布，需要先发布才能生成分享链接
              </p>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isPublishing ? '发布中...' : '发布并生成链接'}
              </button>
            </div>
          )}

          {/* QR Code 占位 */}
          {shareUrl && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-32 h-32 mx-auto bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-2">
                <span className="text-4xl">📱</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                扫码分享（二维码功能待实现）
              </p>
            </div>
          )}

          {/* 访问统计 */}
          {shareToken && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                分享统计
              </h3>
              {loadingStats ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : stats ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalViews}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      总访问次数
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {stats.uniqueVisitors}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      独立访客
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  暂无统计数据
                </p>
              )}
              {stats?.lastViewedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  最后访问：{new Date(stats.lastViewedAt).toLocaleString('zh-CN')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareDashboardModal;
