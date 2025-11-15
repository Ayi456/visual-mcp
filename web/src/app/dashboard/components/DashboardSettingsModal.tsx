/**
 * DashboardSettingsModal - Dashboard设置模态框
 * 功能：修改Dashboard标题、描述、主题等配置
 */

import React, { useState, useEffect } from 'react';

interface DashboardSettings {
  title: string;
  description?: string;
  theme: 'default' | 'dark' | 'business' | 'colorful';
}

interface DashboardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: DashboardSettings;
  onSave: (settings: DashboardSettings) => void;
  onDelete?: () => void;
}

const DashboardSettingsModal: React.FC<DashboardSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSave,
  onDelete
}) => {
  const [title, setTitle] = useState(currentSettings.title);
  const [description, setDescription] = useState(currentSettings.description || '');
  const [theme, setTheme] = useState(currentSettings.theme);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 当设置变化时更新状态
  useEffect(() => {
    setTitle(currentSettings.title);
    setDescription(currentSettings.description || '');
    setTheme(currentSettings.theme);
  }, [currentSettings]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) {
      alert('标题不能为空');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      theme
    });
    onClose();
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete();
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const themes = [
    {
      value: 'default',
      label: '默认主题',
      description: '简洁明亮',
      preview: 'bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200'
    },
    {
      value: 'dark',
      label: '深色主题',
      description: '护眼舒适',
      preview: 'bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700'
    },
    {
      value: 'business',
      label: '商务主题',
      description: '专业正式',
      preview: 'bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-slate-300'
    },
    {
      value: 'colorful',
      label: '彩色主题',
      description: '活力多彩',
      preview: 'bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200 border-2 border-pink-300'
    }
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[600px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard 设置
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            自定义您的 Dashboard 外观和信息
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入 Dashboard 标题"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              描述（可选）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="添加 Dashboard 描述，帮助其他人了解这个面板的用途..."
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description.length} / 500 字符
            </p>
          </div>

          {/* 主题选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              主题风格
            </label>
            <div className="grid grid-cols-2 gap-4">
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value as any)}
                  className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                    theme === t.value
                      ? 'border-blue-500 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {/* 主题预览 */}
                  <div className={`h-16 rounded-md mb-3 ${t.preview}`} />

                  {/* 主题信息 */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${
                        theme === t.value
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {t.label}
                      </span>
                      {theme === t.value && (
                        <span className="text-blue-500 text-lg">✓</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 删除区域 */}
          {onDelete && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                危险操作
              </h3>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-sm font-medium"
                >
                  删除此 Dashboard
                </button>
              ) : (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                    ⚠️ 确定要删除这个 Dashboard 吗？此操作无法撤销！
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      确认删除
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSettingsModal;
