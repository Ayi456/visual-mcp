import React, { useState, useEffect } from 'react';
import { Connection, Engine } from '../../types/sql-api.types';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (connection: Connection) => void;
  connection?: Connection; // 编辑模式时传入
}

export function ConnectionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  connection 
}: ConnectionModalProps) {
  const [formData, setFormData] = useState<Partial<Connection>>({
    title: '',
    engineType: Engine.MySQL,
    host: 'localhost',
    port: 3306,
    database: '',
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (connection) {
      setFormData(connection);
    } else {
      setFormData({
        title: '',
        engineType: Engine.MySQL,
        host: 'localhost',
        port: 3306,
        database: '',
        username: '',
        password: '',
      });
    }
    setErrors({});
    setTestResult(null);
  }, [connection, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = '连接名称不能为空';
    }
    if (!formData.host?.trim()) {
      newErrors.host = '主机地址不能为空';
    }
    if (!formData.port || formData.port <= 0) {
      newErrors.port = '端口号必须大于 0';
    }
    // 数据库名改为可选，连接后可查看所有数据库
    if (!formData.username?.trim()) {
      newErrors.username = '用户名不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestConnection = async () => {
    if (!validateForm()) {
      setTestResult({
        success: false,
        message: '请先填写完整的连接信息',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // 导入 API 服务
      const { sqlApiService } = await import('../../services/sqlApiService');
      
      // 创建临时连接对象用于测试
      const testConnection: Connection = {
        id: connection?.id || `temp-${Date.now()}`,
        title: formData.title!,
        engineType: formData.engineType!,
        host: formData.host!,
        port: formData.port!,
        database: formData.database || undefined,
        username: formData.username!,
        password: formData.password,
      };

      const success = await sqlApiService.testConnection(testConnection);
      
      setTestResult({
        success,
        message: success ? '✅ 连接测试成功！' : '❌ 连接测试失败，请检查配置',
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: `❌ 测试失败: ${error.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const connectionData: Connection = {
      id: connection?.id || `conn-${Date.now()}`,
      title: formData.title!,
      engineType: formData.engineType!,
      host: formData.host!,
      port: formData.port!,
      database: formData.database || undefined,
      username: formData.username!,
      password: formData.password,
    };

    onSave(connectionData);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* 背景遮罩 */}
        <div 
          className="fixed inset-0 bg-black opacity-50"
          onClick={onClose}
        ></div>

        {/* 模态框内容 */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {connection ? '编辑数据库连接' : '添加数据库连接'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 连接名称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                连接名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
                placeholder="例如: 生产数据库"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* 数据库类型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                数据库类型
              </label>
              <select
                value={formData.engineType || Engine.MySQL}
                onChange={(e) => {
                  const engineType = e.target.value as Engine;
                  setFormData({ 
                    ...formData, 
                    engineType,
                    port: engineType === Engine.MySQL ? 3306 : 5432
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value={Engine.MySQL}>MySQL</option>
                <option value={Engine.PostgreSQL}>PostgreSQL</option>
              </select>
            </div>

            {/* 主机和端口 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  主机地址 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.host || ''}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.host ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } dark:bg-gray-700 dark:text-white`}
                  placeholder="localhost"
                />
                {errors.host && (
                  <p className="text-red-500 text-sm mt-1">{errors.host}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  端口 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.port || ''}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.port ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } dark:bg-gray-700 dark:text-white`}
                  placeholder="3306"
                />
                {errors.port && (
                  <p className="text-red-500 text-sm mt-1">{errors.port}</p>
                )}
              </div>
            </div>

            {/* 数据库名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                数据库名 <span className="text-gray-400 text-xs">(可选)</span>
              </label>
              <input
                type="text"
                value={formData.database || ''}
                onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="留空则连接后可查看所有数据库"
              />
              <p className="text-gray-500 text-xs mt-1">
                💡 MySQL 可留空，PostgreSQL 不填则连接到 postgres 数据库
              </p>
            </div>

            {/* 用户名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                用户名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
                placeholder="root"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                密码
              </label>
              <input
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            {/* 测试结果 */}
            {testResult && (
              <div className={`p-3 rounded ${
                testResult.success 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {testResult.message}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded disabled:opacity-50"
              >
                {isTesting ? '测试中...' : '测试连接'}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                取消
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {connection ? '保存修改' : '添加连接'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}