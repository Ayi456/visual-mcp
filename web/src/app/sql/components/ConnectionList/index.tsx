import React, { useState, useEffect } from 'react';
import { Connection, Engine, Schema } from '../../types/sql-api.types';
import { ConnectionModal } from '../ConnectionModal';
import { TableSchemaModal } from '../TableSchemaModal';
import { sqlApiService } from '../../services/sqlApiService';
import { useCopyToClipboard } from '../../hooks';

interface ConnectionListProps {
  onConnectionSelect?: (connection: Connection) => void;
  selectedConnectionId?: string;
  onDatabaseSelect?: (database: string) => void;
  onTableSelect?: (table: Schema) => void;
}

export function ConnectionList({
  onConnectionSelect,
  selectedConnectionId,
  onDatabaseSelect,
  onTableSelect
}: ConnectionListProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | undefined>();
  const [testingConnectionId, setTestingConnectionId] = useState<string | null>(null);

  // 数据库和表相关状态
  const [databases, setDatabases] = useState<string[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [tables, setTables] = useState<Schema[]>([]);
  const [isLoadingDatabases, setIsLoadingDatabases] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [showTables, setShowTables] = useState(true);

  // 表结构弹窗相关状态
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [selectedTableForModal, setSelectedTableForModal] = useState<Schema | null>(null);

  // 右键菜单相关状态
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    table: Schema | null;
  }>({ visible: false, x: 0, y: 0, table: null });

  // 复制到剪贴板 Hook
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => {
    // 从 localStorage 加载保存的连接
    loadConnections();
  }, []);

  // 当选中连接时，加载数据库列表
  useEffect(() => {
    if (selectedConnectionId) {
      const selectedConn = connections.find(c => c.id === selectedConnectionId);
      if (selectedConn) {
        loadDatabases(selectedConn);
      }
    } else {
      // 清空数据库和表列表
      setDatabases([]);
      setSelectedDatabase(null);
      setTables([]);
    }
  }, [selectedConnectionId, connections]);

  // 当选中数据库时，加载表列表
  useEffect(() => {
    if (selectedConnectionId && selectedDatabase) {
      const selectedConn = connections.find(c => c.id === selectedConnectionId);
      if (selectedConn) {
        loadTables(selectedConn, selectedDatabase);
      }
    } else {
      setTables([]);
    }
  }, [selectedDatabase, selectedConnectionId, connections]);

  const loadConnections = () => {
    const savedConnections = sqlApiService.getSavedConnections();
    setConnections(savedConnections);
  };

  const loadDatabases = async (connection: Connection) => {
    setIsLoadingDatabases(true);
    try {
      const dbs = await sqlApiService.getDatabases(connection);
      setDatabases(dbs);

      // 如果连接配置中已经指定了数据库，自动选中
      if (connection.database && dbs.includes(connection.database)) {
        setSelectedDatabase(connection.database);
        onDatabaseSelect?.(connection.database);
      } else if (dbs.length > 0) {
        // 否则选择第一个数据库
        setSelectedDatabase(dbs[0]);
        onDatabaseSelect?.(dbs[0]);
      }
    } catch (error: any) {
      console.error('加载数据库列表失败:', error);
      setDatabases([]);
    } finally {
      setIsLoadingDatabases(false);
    }
  };

  const loadTables = async (connection: Connection, database: string) => {
    setIsLoadingTables(true);
    try {
      const schema = await sqlApiService.getTableSchema(connection, database);
      setTables(schema);
    } catch (error: any) {
      console.error('加载表列表失败:', error);
      setTables([]);
    } finally {
      setIsLoadingTables(false);
    }
  };

  const handleAddConnection = () => {
    setEditingConnection(undefined);
    setIsModalOpen(true);
  };

  const handleEditConnection = (connection: Connection) => {
    setEditingConnection(connection);
    setIsModalOpen(true);
  };

  const handleDeleteConnection = (connectionId: string) => {
    if (confirm('确定要删除这个连接吗？')) {
      sqlApiService.deleteConnection(connectionId);
      loadConnections();
      
      // 如果删除的是当前选中的连接，清除选择
      if (selectedConnectionId === connectionId) {
        onConnectionSelect?.(undefined as any);
      }
    }
  };

  const handleSaveConnection = (connection: Connection) => {
    sqlApiService.saveConnection(connection);
    loadConnections();
    setIsModalOpen(false);
    setEditingConnection(undefined);
    
    // 自动选择新添加或编辑的连接
    onConnectionSelect?.(connection);
  };

  const handleTestConnection = async (connection: Connection) => {
    setTestingConnectionId(connection.id);
    try {
      const success = await sqlApiService.testConnection(connection);
      alert(success ? '✅ 连接测试成功！' : '❌ 连接测试失败！');
    } catch (error: any) {
      alert(`❌ 测试失败: ${error.message}`);
    } finally {
      setTestingConnectionId(null);
    }
  };

  const handleSelectConnection = (connection: Connection) => {
    onConnectionSelect?.(connection);
  };

  const handleSelectDatabase = (database: string) => {
    setSelectedDatabase(database);
    onDatabaseSelect?.(database);
  };

  const handleSelectTable = (table: Schema) => {
    onTableSelect?.(table);
  };
  
  const handleTableContextMenu = (e: React.MouseEvent, table: Schema) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      table
    });
  };
  
  const handleShowTableSchema = (table: Schema) => {
    setSelectedTableForModal(table);
    setIsSchemaModalOpen(true);
    setContextMenu({ visible: false, x: 0, y: 0, table: null });
  };
  
  // 点击其他地方关闭右键菜单
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu({ visible: false, x: 0, y: 0, table: null });
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.visible]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          数据库连接
        </h3>
        <button
          onClick={handleAddConnection}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          title="添加连接"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* 连接列表 */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {connections.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
              />
            </svg>
            <p className="text-gray-500 text-sm mb-3">还没有数据库连接</p>
            <button
              onClick={handleAddConnection}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              添加第一个连接
            </button>
          </div>
        ) : (
          connections.map((connection) => (
            <div
              key={connection.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedConnectionId === connection.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => handleSelectConnection(connection)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {/* 数据库类型图标 */}
                    <div className="flex-shrink-0">
                      {connection.engineType === Engine.MySQL ? (
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                        </svg>
                      )}
                    </div>
                    
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {connection.title}
                    </h4>
                    
                    {selectedConnectionId === connection.id && (
                      <span className="flex-shrink-0 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                        当前
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <span>{connection.engineType}</span>
                    <span className="mx-1">•</span>
                    <span>{connection.host}:{connection.port}</span>
                    <span className="mx-1">•</span>
                    <span>{connection.database}</span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleTestConnection(connection)}
                    disabled={testingConnectionId === connection.id}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="测试连接"
                  >
                    {testingConnectionId === connection.id ? (
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleEditConnection(connection)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="编辑连接"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                      />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteConnection(connection.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                    title="删除连接"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 数据库选择器 */}
      {selectedConnectionId && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              数据库
            </h3>
            {isLoadingDatabases && (
              <svg className="w-4 h-4 animate-spin text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
          </div>

          {databases.length > 0 ? (
            <select
              value={selectedDatabase || ''}
              onChange={(e) => handleSelectDatabase(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {databases.map((db) => (
                <option key={db} value={db}>
                  {db}
                </option>
              ))}
            </select>
          ) : (
            !isLoadingDatabases && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                没有可用的数据库
              </p>
            )
          )}
        </div>
      )}

      {/* 表列表 */}
      {selectedConnectionId && selectedDatabase && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              表列表 ({tables.length})
            </h3>
            <div className="flex items-center gap-2">
              {isLoadingTables && (
                <svg className="w-4 h-4 animate-spin text-blue-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              <button
                onClick={() => setShowTables(!showTables)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title={showTables ? '收起' : '展开'}
              >
                <svg
                  className={`w-4 h-4 transition-transform ${showTables ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {showTables && (
            <div className="max-h-64 overflow-y-auto space-y-1">
              {tables.length > 0 ? (
                tables.map((table) => (
                  <div
                    key={table.name}
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm group"
                    onClick={() => handleShowTableSchema(table)}
                    onContextMenu={(e) => handleTableContextMenu(e, table)}
                    title={`左键查看结构，右键显示更多操作`}
                  >
                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300 truncate flex-1">
                      {table.name}
                    </span>
                    {table.columns && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                        {table.columns.length} 列
                      </span>
                    )}
                    <svg
                      className="w-4 h-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))
              ) : (
                !isLoadingTables && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                    没有找到表
                  </p>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* 连接模态框 */}
      <ConnectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingConnection(undefined);
        }}
        onSave={handleSaveConnection}
        connection={editingConnection}
      />
      
      {/* 表结构弹窗 */}
      <TableSchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => {
          setIsSchemaModalOpen(false);
          setSelectedTableForModal(null);
        }}
        table={selectedTableForModal}
      />
      
      {/* 右键菜单 */}
      {contextMenu.visible && contextMenu.table && (
        <div
          className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50 min-w-[180px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => handleShowTableSchema(contextMenu.table!)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            查看表结构
          </button>
          
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => {
              copy(contextMenu.table!.name);
              setContextMenu({ visible: false, x: 0, y: 0, table: null });
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            复制表名
          </button>
        </div>
      )}

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
}
