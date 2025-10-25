import React from 'react';
import type { QueryResult } from '../../types';
import { StatCard } from '../common';

interface QueryStatsProps {
  result: QueryResult;
  sql?: string;
}

const QueryStats: React.FC<QueryStatsProps> = ({ result, sql }) => {
  return (
    <div className="space-y-4">
      {/* 基本统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="行数"
          value={result.rowCount}
          icon="📊"
        />
        <StatCard
          label="列数"
          value={result.columns.length}
          icon="📋"
        />
        <StatCard
          label="执行时间"
          value={`${result.executionTime || 0}ms`}
          icon="⏱️"
        />
        <StatCard
          label="影响行数"
          value={result.affectedRows || 0}
          icon="✅"
        />
      </div>

      {/* SQL 信息 */}
      {sql && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            执行的 SQL 语句
          </h3>
          <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {sql}
          </pre>
        </div>
      )}

      {/* 列信息 */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          列信息
        </h3>
        <div className="space-y-1">
          {result.columns.map((column, index) => (
            <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
              {index + 1}. {column}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QueryStats;
