import React, { useRef, useCallback, useEffect, useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useSqlChatStore } from '../../stores/useSqlChat';

interface SqlEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  onExecute?: () => void;
  placeholder?: string;
  height?: string;
  readOnly?: boolean;
}

const SqlEditor: React.FC<SqlEditorProps> = ({
  value,
  onChange,
  onExecute,
  placeholder = '-- Write your SQL query here...',
  height = '200px',
  readOnly = false,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const getIsDark = () => {
    if (typeof document !== 'undefined') {
      if (document.documentElement.classList.contains('dark')) return true;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
    }
    return false;
  };
  const [isDark, setIsDark] = useState<boolean>(getIsDark());
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setIsDark(getIsDark());
    mq.addEventListener?.('change', handler);
    const obs = new MutationObserver(handler);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      mq.removeEventListener?.('change', handler);
      obs.disconnect();
    };
  }, []);

  // Monaco Editor 配置
  const editorOptions: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    readOnly,
    automaticLayout: true,
    suggestOnTriggerCharacters: true,
    wordWrap: 'on',
    wrappingStrategy: 'advanced',
    scrollbar: {
      vertical: 'auto',
      horizontal: 'auto',
      useShadows: false,
      verticalHasArrows: false,
      horizontalHasArrows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false
    },
    parameterHints: {
      enabled: true
    },
    suggest: {
      insertMode: 'replace',
      showKeywords: true,
      showSnippets: true,
    }
  };


  // [Monaco] 加载状态与错误兜底
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      if (!ready) setLoadError('编辑器加载超时，已切换为简易编辑器');
    }, 8000);
    return () => clearTimeout(t);
  }, [ready]);

  // Monaco Editor 挂载时的处理
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;

    // 注册 SQL 语言配置
    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        // SQL 关键字自动完成
        const keywords = [
          'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'UPDATE', 'DELETE',
          'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW', 'TRIGGER',
          'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'ON', 'AS',
          'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET',
          'UNION', 'ALL', 'DISTINCT', 'AND', 'OR', 'NOT', 'IN', 'EXISTS',
          'BETWEEN', 'LIKE', 'IS', 'NULL', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN',
          'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'BEGIN', 'COMMIT', 'ROLLBACK',
          'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'DEFAULT', 'CHECK',
          'VALUES', 'SET', 'DESC', 'ASC', 'SHOW', 'TABLES', 'COLUMNS', 'DATABASES'
        ];

        const suggestions = keywords.map(keyword => ({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          range: range,
          detail: 'SQL Keyword'
        }));

        // 常用 SQL 函数
        const functions = [
          { name: 'COUNT(*)', detail: 'Count all rows' },
          { name: 'SUM(column)', detail: 'Sum of column values' },
          { name: 'AVG(column)', detail: 'Average of column values' },
          { name: 'MAX(column)', detail: 'Maximum value' },
          { name: 'MIN(column)', detail: 'Minimum value' },
          { name: 'NOW()', detail: 'Current date and time' },
          { name: 'DATE()', detail: 'Extract date part' },
          { name: 'CONCAT()', detail: 'Concatenate strings' },
          { name: 'LENGTH()', detail: 'String length' },
          { name: 'UPPER()', detail: 'Convert to uppercase' },
          { name: 'LOWER()', detail: 'Convert to lowercase' },
          { name: 'TRIM()', detail: 'Remove spaces' },
          { name: 'COALESCE()', detail: 'Return first non-null value' },
          { name: 'CAST()', detail: 'Type conversion' }
        ];

        const functionSuggestions = functions.map(func => ({
          label: func.name,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: func.name,
          range: range,
          detail: func.detail
        }));

        // SQL 代码片段
        const snippets = [
          {
            label: 'SELECT * FROM',
            insertText: 'SELECT * FROM ${1:table_name}',
            detail: 'Select all columns from table'
          },
          {
            label: 'SELECT WHERE',
            insertText: 'SELECT ${1:columns} FROM ${2:table} WHERE ${3:condition}',
            detail: 'Select with WHERE clause'
          },
          {
            label: 'INSERT INTO',
            insertText: 'INSERT INTO ${1:table} (${2:columns}) VALUES (${3:values})',
            detail: 'Insert new record'
          },
          {
            label: 'UPDATE SET',
            insertText: 'UPDATE ${1:table} SET ${2:column} = ${3:value} WHERE ${4:condition}',
            detail: 'Update records'
          },
          {
            label: 'CREATE TABLE',
            insertText: 'CREATE TABLE ${1:table_name} (\n\t${2:column1} ${3:datatype},\n\t${4:column2} ${5:datatype}\n)',
            detail: 'Create new table'
          },
          {
            label: 'JOIN',
            insertText: 'SELECT ${1:*} FROM ${2:table1} \nJOIN ${3:table2} ON ${2:table1}.${4:col} = ${3:table2}.${5:col}',
            detail: 'Join tables'
          }
        ];

        const snippetSuggestions = snippets.map(snippet => ({
          label: snippet.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: snippet.insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
          detail: snippet.detail
        }));

        return {
          suggestions: [...suggestions, ...functionSuggestions, ...snippetSuggestions]
        };
      }
    });

    // 注册快捷键
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onExecute) {
        onExecute();
      }
    });

    // 格式化快捷键
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument')?.run();
    });
  };

  // 处理编辑器值变化
  const handleEditorChange = useCallback((value: string | undefined) => {
    onChange(value);
  }, [onChange]);

  return (
    <div className="sql-editor-container border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {loadError ? (
        <div className="p-3">
          <div className="mb-2 text-xs text-amber-600 dark:text-amber-400">{loadError}</div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            className="w-full h-[200px] md:h-[240px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 font-mono text-sm"
          />
        </div>
      ) : (
        <Editor
          height={height}
          defaultLanguage="sql"
          language="sql"
          theme={isDark ? 'vs-dark' : 'light'}
          value={value}
          onChange={handleEditorChange}
          onMount={(ed, m) => { setReady(true); handleEditorDidMount(ed, m); }}
          options={editorOptions}
          loading={<div className="flex items-center justify-center h-full text-xs text-gray-500">Loading editor... 若长时间未加载，将自动切换为简易编辑器</div>}
        />
      )}
      {!readOnly && (
        <div className="editor-footer bg-gray-50 dark:bg-gray-800 px-3 py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>SQL</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd>
                <span className="ml-1">to execute</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Space</kbd>
                <span className="ml-1">for suggestions</span>
              </span>
            </div>
            {value && (
              <span>{value.length} characters</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SqlEditor;