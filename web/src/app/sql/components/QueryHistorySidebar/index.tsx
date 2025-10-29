import React, { useState, useMemo } from 'react';
import { useSqlChatStore } from '../../stores/useSqlChat';
import type { QueryHistoryRecord } from '../../types';
import { useCopyToClipboard } from '../../hooks';

interface QueryHistorySidebarProps {
  onSelectHistoryItem?: (sql: string) => void;
  className?: string;
}

export const QueryHistorySidebar: React.FC<QueryHistorySidebarProps> = ({
  onSelectHistoryItem,
  className = ''
}) => {
  const { getHistory, deleteHistoryItem, clearHistory } = useSqlChatStore();
  const history = getHistory();
  const { copied, copy } = useCopyToClipboard();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');

  // 过滤历史记录
  const filteredHistory = useMemo(() => {
    return history.filter(record => {
      const matchesSearch = record.sql.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.database.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.connectionName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [history, searchTerm, statusFilter]);

  const handleSelect = (sql: string) => {
    onSelectHistoryItem?.(sql);
  };

  const formatTime = (date: Date | string) => {
    // 确保转换为 Date 对象
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return dateObj.toLocaleDateString();
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
      clearHistory();
    }
  };

  return (
    <div className={`query-history-sidebar bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col ${className}`}>
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            查询历史
          </h3>
          <button
            onClick={handleClearAll}
            className="text-xs text-red-500 hover:text-red-600"
            title="清空历史"
          >
            清空
          </button>
        </div>

        {/* 搜索框 */}
        <div className="relative mb-2">
          <input
            type="text"
            placeholder="搜索查询..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <svg className="absolute right-2 top-1.5 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* 状态筛选 */}
        <div className="flex gap-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2 py-1 text-xs rounded ${statusFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
          >
            全部
          </button>
          <button
            onClick={() => setStatusFilter('success')}
            className={`px-2 py-1 text-xs rounded ${statusFilter === 'success' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
          >
            成功
          </button>
          <button
            onClick={() => setStatusFilter('error')}
            className={`px-2 py-1 text-xs rounded ${statusFilter === 'error' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
          >
            错误
          </button>
        </div>
      </div>

      {/* 历史记录列表 */}
      <div className="flex-1 overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            {searchTerm || statusFilter !== 'all' ? '没有匹配的历史记录' : '暂无查询历史'}
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredHistory.map((record) => (
              <HistoryItem
                key={record.id}
                record={record}
                onSelect={handleSelect}
                onDelete={deleteHistoryItem}
                onCopy={copy}
                formatTime={formatTime}
              />
            ))}
          </div>
        )}
      </div>

      {/* 底部统计 */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        共 {filteredHistory.length} 条记录
      </div>

      {/* 复制成功提示 */}
      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in z-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">已复制到剪贴板</span>
        </div>
      )}
    </div>
  );
};

interface HistoryItemProps {
  record: QueryHistoryRecord;
  onSelect: (sql: string) => void;
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
  formatTime: (date: Date | string) => string;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  record,
  onSelect,
  onDelete,
  onCopy,
  formatTime
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group">
      {/* 头部 - SQL预览 */}
      <div
        className="cursor-pointer"
        onClick={() => onSelect(record.sql)}
        title="点击重现查询"
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className={`text-xs px-1.5 py-0.5 rounded ${record.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
            {record.status === 'success' ? '✓' : '✗'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
            {formatTime(record.timestamp)}
          </span>
        </div>

        <div className="text-xs text-gray-700 dark:text-gray-300 font-mono truncate mb-1">
          {record.sql}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{record.connectionName}</span>
          <span>•</span>
          <span>{record.database}</span>
          {record.status === 'success' && (
            <>
              <span>•</span>
              <span>{record.rowCount} 行</span>
              <span>•</span>
              <span>{record.duration}ms</span>
            </>
          )}
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          详情
        </button>

        <button
          onClick={() => onCopy(record.sql)}
          className="text-xs text-gray-500 hover:text-gray-600 flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          复制
        </button>

        <button
          onClick={() => {
            if (confirm('确定要删除这条记录吗？')) {
              onDelete(record.id);
            }
          }}
          className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 ml-auto"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          删除
        </button>
      </div>

      {/* 详情展开 */}
      {showDetails && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div><strong>连接：</strong> {record.connectionName}</div>
            <div><strong>数据库：</strong> {record.database}</div>
            <div><strong>执行时间：</strong> {record.duration}ms</div>
            {record.rowCount > 0 && <div><strong>返回行数：</strong> {record.rowCount}</div>}
            {record.message && <div><strong>备注：</strong> {record.message}</div>}
            {record.error && (
              <div className="text-red-500 dark:text-red-400">
                <strong>错误：</strong> {record.error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryHistorySidebar;
