import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sqlApiService } from '../services/sqlApiService';
import type { ChatSession, ChatMessage, ChatContext, Connection, QueryHistoryRecord } from '../types';
import { CHAT_CONFIG, STORAGE_KEYS } from '../config/constants';
import { checkSqlSafety } from '../utils/sqlSafety';

interface SqlChatStore {
  // 状态
  currentSessionId: string | null;
  sessions: Map<string, ChatSession>;
  isLoading: boolean;
  error: string | null;
  queryHistory: QueryHistoryRecord[]; // 查询历史记录

  // Actions
  initSession: (userId: string) => Promise<void>;
  sendMessage: (message: string, connection?: Connection, database?: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  switchSession: (sessionId: string) => void;
  clearSession: () => void;
  updateContext: (context: Partial<ChatContext>) => void;
  executeMessage: (messageId: string, connection: Connection, database: string) => Promise<void>;

  // 查询历史管理
  addToHistory: (record: Omit<QueryHistoryRecord, 'id'>) => void;
  getHistory: () => QueryHistoryRecord[];
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;

  // Getters
  getCurrentSession: () => ChatSession | null;
  getSessionMessages: (sessionId: string) => ChatMessage[];
}

export const useSqlChatStore = create<SqlChatStore>()(
  persist(
    (set, get) => ({
      currentSessionId: null,
      sessions: new Map(),
      isLoading: false,
      error: null,
      queryHistory: [],

      initSession: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: 调用后端 API 初始化会话
          const sessionId = `${userId}-${Date.now()}`;
          const newSession: ChatSession = {
            id: sessionId,
            userId,
            startTime: new Date(),
            lastActiveTime: new Date(),
            messages: [],
            context: {
              variables: {},
              preferences: {
                outputFormat: CHAT_CONFIG.DEFAULT_OUTPUT_FORMAT,
                maxRows: CHAT_CONFIG.MAX_ROWS,
                theme: 'light',
                autoExecuteMode: 'manual'  // 默认手动执行模式
              }
            },
            metadata: {
              tokenCount: 0,
              queryCount: 0,
              errorCount: 0,
              avgResponseTime: 0
            }
          };
          
          set(state => ({
            sessions: new Map(state.sessions).set(sessionId, newSession),
            currentSessionId: sessionId,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '初始化会话失败',
            isLoading: false 
          });
        }
      },

      addMessage: (message: ChatMessage) => {
        const { currentSessionId, sessions } = get();
        if (!currentSessionId) {
          set({ error: '没有活动的会话' });
          return;
        }

        const session = sessions.get(currentSessionId);
        if (!session) {
          set({ error: '会话不存在' });
          return;
        }

        const updatedSession = {
          ...session,
          messages: [...session.messages, message],
          lastActiveTime: new Date(),
          metadata: {
            ...session.metadata,
            queryCount: message.sql ? session.metadata.queryCount + 1 : session.metadata.queryCount
          }
        };

        set(state => ({
          sessions: new Map(state.sessions).set(currentSessionId, updatedSession)
        }));
      },

      sendMessage: async (message: string, connection?: Connection, database?: string) => {
        const { currentSessionId, sessions } = get();
        if (!currentSessionId) {
          set({ error: '没有活动的会话' });
          return;
        }

        const session = sessions.get(currentSessionId);
        if (!session) {
          set({ error: '会话不存在' });
          return;
        }

        set({ isLoading: true, error: null });

        // 添加用户消息
        const userMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: message,
          timestamp: new Date()
        };

        const updatedSession = {
          ...session,
          messages: [...session.messages, userMessage],
          lastActiveTime: new Date()
        };

        set(state => ({
          sessions: new Map(state.sessions).set(currentSessionId, updatedSession)
        }));

        try {
          // 调用 SQL Chat API，传递数据库参数
          console.log('Store: 调用 sendChatMessage，数据库:', database);
          const response = await sqlApiService.sendChatMessage(
            message,
            connection,
            database // 传递当前选中的数据库
          );

          const aiMessage: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            role: 'assistant',
            content: response.content,
            sql: response.sql,
            timestamp: new Date()
          };

          // 检查自动执行模式
          const autoExecuteMode = session.context.preferences?.autoExecuteMode || 'manual';

          if (response.sql && connection && database) {
            // 检查 SQL 安全性
            const safetyCheck = checkSqlSafety(response.sql);

            if (autoExecuteMode === 'auto' && safetyCheck.safe) {
              // 自动执行模式且 SQL 安全
              const startTime = Date.now();
              try {
                console.log('自动执行 SQL:', response.sql);
                const executionResult = await sqlApiService.executeQuery(
                  connection,
                  database,
                  response.sql
                );
                const duration = Date.now() - startTime;

                console.log('自动执行结果:', {
                  executionResult,
                  hasRows: !!executionResult.rows,
                  hasData: !!executionResult.data,
                  hasFields: !!executionResult.fields
                });

                // 添加到历史记录
                const historyRecord: Omit<QueryHistoryRecord, 'id'> = {
                  sql: response.sql,
                  timestamp: new Date(),
                  duration,
                  rowCount: executionResult.rowCount || 0,
                  status: 'success',
                  connectionName: connection.title,
                  connectionId: connection.id,
                  database,
                  message: 'AI自动执行'
                };
                get().addToHistory(historyRecord);

                aiMessage.executed = true;
                aiMessage.autoExecuted = true;
                aiMessage.executionResult = executionResult;

                // ExecutionResult 可能使用 data 或 rows 字段
                const resultRows = executionResult.rows || executionResult.data || [];
                const resultColumns = executionResult.fields?.map((f: any) => f.name || f) ||
                                    (resultRows.length > 0 ? Object.keys(resultRows[0]) : []);

                aiMessage.result = {
                  columns: resultColumns,
                  rows: resultRows,
                  rowCount: resultRows.length,
                  executionTime: executionResult.executionTime || 0
                };

                console.log('自动执行 - 设置 result:', {
                  columns: resultColumns,
                  rowCount: resultRows.length,
                  firstRow: resultRows[0]
                });
              } catch (execError) {
                console.error('自动执行失败:', execError);
                const duration = Date.now() - startTime;
                const historyRecord: Omit<QueryHistoryRecord, 'id'> = {
                  sql: response.sql,
                  timestamp: new Date(),
                  duration,
                  rowCount: 0,
                  status: 'error',
                  connectionName: connection.title,
                  connectionId: connection.id,
                  database,
                  error: execError instanceof Error ? execError.message : '未知错误',
                  message: 'AI自动执行'
                };
                get().addToHistory(historyRecord);

                aiMessage.error = `自动执行失败: ${execError instanceof Error ? execError.message : '未知错误'}`;
              }
            } else if (!safetyCheck.safe) {
              // SQL 不安全，添加安全提示
              aiMessage.content += `\n\n⚠️ ${safetyCheck.reason}`;
            }
          }

          const finalSession = {
            ...updatedSession,
            messages: [...updatedSession.messages, aiMessage],
            metadata: {
              ...updatedSession.metadata,
              queryCount: updatedSession.metadata.queryCount + 1
            }
          };

          set(state => ({
            sessions: new Map(state.sessions).set(currentSessionId, finalSession),
            isLoading: false
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '发送消息失败',
            isLoading: false
          });
        }
      },

      switchSession: (sessionId: string) => {
        const { sessions } = get();
        if (sessions.has(sessionId)) {
          set({ currentSessionId: sessionId, error: null });
        } else {
          set({ error: '会话不存在' });
        }
      },

      clearSession: () => {
        const { currentSessionId, sessions } = get();
        if (currentSessionId) {
          sessions.delete(currentSessionId);
          set({ 
            sessions: new Map(sessions),
            currentSessionId: null,
            error: null
          });
        }
      },

      updateContext: (context: Partial<ChatContext>) => {
        const { currentSessionId, sessions } = get();
        if (!currentSessionId) return;

        const session = sessions.get(currentSessionId);
        if (!session) return;

        const updatedSession = {
          ...session,
          context: {
            ...session.context,
            ...context
          }
        };

        set(state => ({
          sessions: new Map(state.sessions).set(currentSessionId, updatedSession)
        }));
      },

      executeMessage: async (messageId: string, connection: Connection, database: string) => {
        const { currentSessionId, sessions } = get();
        if (!currentSessionId) {
          set({ error: '没有活动的会话' });
          return;
        }

        const session = sessions.get(currentSessionId);
        if (!session) {
          set({ error: '会话不存在' });
          return;
        }

        const message = session.messages.find(m => m.id === messageId);
        if (!message || !message.sql) {
          set({ error: '消息不存在或没有 SQL 语句' });
          return;
        }

        set({ isLoading: true, error: null });
        const startTime = Date.now();

        try {
          console.log('手动执行 SQL:', message.sql);
          const executionResult = await sqlApiService.executeQuery(
            connection,
            database,
            message.sql
          );
          const duration = Date.now() - startTime;

          console.log('手动执行结果:', {
            executionResult,
            hasRows: !!executionResult.rows,
            hasData: !!executionResult.data,
            hasFields: !!executionResult.fields
          });

          // 添加到历史记录
          const historyRecord: Omit<QueryHistoryRecord, 'id'> = {
            sql: message.sql,
            timestamp: new Date(),
            duration,
            rowCount: executionResult.rowCount || 0,
            status: 'success',
            connectionName: connection.title,
            connectionId: connection.id,
            database,
          };
          get().addToHistory(historyRecord);

          // ExecutionResult 可能使用 data 或 rows 字段
          const resultRows = executionResult.rows || executionResult.data || [];
          const resultColumns = executionResult.fields?.map((f: any) => f.name || f) ||
                              (resultRows.length > 0 ? Object.keys(resultRows[0]) : []);

          console.log('手动执行 - 处理结果:', {
            columns: resultColumns,
            rowCount: resultRows.length,
            firstRow: resultRows[0]
          });

          // 更新消息状态
          const updatedMessages = session.messages.map(m => {
            if (m.id === messageId) {
              return {
                ...m,
                executed: true,
                autoExecuted: false,
                executionResult,
                result: {
                  columns: resultColumns,
                  rows: resultRows,
                  rowCount: resultRows.length,
                  executionTime: executionResult.executionTime || 0
                },
                error: undefined
              };
            }
            return m;
          });

          const updatedSession = {
            ...session,
            messages: updatedMessages
          };

          set(state => ({
            sessions: new Map(state.sessions).set(currentSessionId, updatedSession),
            isLoading: false
          }));
        } catch (error) {
          const duration = Date.now() - startTime;

          // 添加到历史记录（错误）
          const historyRecord: Omit<QueryHistoryRecord, 'id'> = {
            sql: message.sql,
            timestamp: new Date(),
            duration,
            rowCount: 0,
            status: 'error',
            connectionName: connection.title,
            connectionId: connection.id,
            database,
            error: error instanceof Error ? error.message : '未知错误',
          };
          get().addToHistory(historyRecord);

          // 更新消息错误状态
          const updatedMessages = session.messages.map(m => {
            if (m.id === messageId) {
              return {
                ...m,
                error: `执行失败: ${error instanceof Error ? error.message : '未知错误'}`
              };
            }
            return m;
          });

          const updatedSession = {
            ...session,
            messages: updatedMessages
          };

          set(state => ({
            sessions: new Map(state.sessions).set(currentSessionId, updatedSession),
            error: error instanceof Error ? error.message : '执行失败',
            isLoading: false
          }));
        }
      },

      getCurrentSession: () => {
        const { currentSessionId, sessions } = get();
        return currentSessionId ? sessions.get(currentSessionId) || null : null;
      },

      getSessionMessages: (sessionId: string) => {
        const { sessions } = get();
        const session = sessions.get(sessionId);
        return session ? session.messages : [];
      },

      // 查询历史管理方法
      addToHistory: (record: Omit<QueryHistoryRecord, 'id'>) => {
        const { queryHistory } = get();
        const newRecord: QueryHistoryRecord = {
          ...record,
          id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        const updatedHistory = [newRecord, ...queryHistory].slice(0, 100); // 最多保留100条记录
        set({ queryHistory: updatedHistory });
      },

      getHistory: () => {
        const { queryHistory } = get();
        return queryHistory;
      },

      clearHistory: () => {
        set({ queryHistory: [] });
      },

      deleteHistoryItem: (id: string) => {
        const { queryHistory } = get();
        const updatedHistory = queryHistory.filter(item => item.id !== id);
        set({ queryHistory: updatedHistory });
      }
    }),
    {
      name: 'sql-chat-store',
      partialize: (state) => ({
        currentSessionId: state.currentSessionId,
        queryHistory: state.queryHistory
      })
    }
  )
);