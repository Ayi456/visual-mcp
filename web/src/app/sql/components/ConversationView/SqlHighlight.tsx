import React from 'react';
import { useCopyToClipboard } from '../../hooks';

interface SqlHighlightProps {
  sql: string;
  maxHeight?: string;
}

const SqlHighlight: React.FC<SqlHighlightProps> = ({ sql, maxHeight = '300px' }) => {
  const { copied, copy } = useCopyToClipboard();

  // 显示原始 SQL（不做 HTML 高亮，避免出现类名文本）
  return (
    <div className="relative group">
      <pre
        className="sql-code-block whitespace-pre-wrap"
        style={{ maxHeight, overflowY: 'auto' }}
      >
        {sql}
      </pre>

      {/* 复制按钮 */}
      <button
        onClick={() => copy(sql)}
        className="absolute top-2 right-2 p-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
        title="复制 SQL"
      >
        {copied ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default SqlHighlight;
