import React from 'react';
import { Schema, Column } from '../../types/sql-api.types';
import { useCopyToClipboard } from '../../hooks';

interface TableSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Schema | null;
}

export function TableSchemaModal({
  isOpen,
  onClose,
  table
}: TableSchemaModalProps) {
  const { copied, copy } = useCopyToClipboard();

  if (!isOpen || !table) {
    return null;
  }

  const handleCopyTableName = () => {
    copy(table.name);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* 背景遮罩 */}
        <div 
          className="fixed inset-0 bg-black opacity-50"
          onClick={onClose}
        ></div>

        {/* 模态框内容 */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[80vh] overflow-hidden flex flex-col">
          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {table.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {table.type === 'table' ? '数据表' : '视图'} • {table.columns?.length || 0} 列
                </p>
              </div>
            </div>
            
            {/* 快捷操作按钮 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyTableName}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="复制表名"
              >
                复制表名
              </button>
              
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="关闭"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 表结构内容 */}
          <div className="flex-1 overflow-y-auto">
            {table.columns && table.columns.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                        #
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                        列名
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                        数据类型
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                        可空
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                        主键
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                        自增
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                        默认值
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                        注释
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {table.columns.map((column: Column, index: number) => (
                      <tr 
                        key={column.name}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <code className="text-blue-600 dark:text-blue-400 font-mono">
                              {column.name}
                            </code>
                            {column.isPrimaryKey && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                PK
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-purple-600 dark:text-purple-400 font-mono text-xs">
                            {column.type}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {column.nullable ? (
                            <span className="text-green-600 dark:text-green-400">✓</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">✗</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {column.isPrimaryKey ? (
                            <span className="text-yellow-600 dark:text-yellow-400">🔑</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {column.isAutoIncrement ? (
                            <span className="text-blue-600 dark:text-blue-400">✓</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {column.default ? (
                            <code className="text-gray-600 dark:text-gray-400 text-xs">
                              {String(column.default)}
                            </code>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                          {column.comment || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                <p>暂无列信息</p>
              </div>
            )}
          </div>

          {/* 统计信息 */}
          {table.columns && table.columns.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-4 gap-4 text-center text-sm">
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    {table.columns.length}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 mt-1">
                    总列数
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-500">
                    {table.columns.filter(c => c.isPrimaryKey).length}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 mt-1">
                    主键列
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    {table.columns.filter(c => c.nullable).length}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 mt-1">
                    可空列
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-500">
                    {table.columns.filter(c => c.isAutoIncrement).length}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 mt-1">
                    自增列
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 复制成功提示 */}
      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in z-[60]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">已复制到剪贴板</span>
        </div>
      )}
    </div>
  );
}
