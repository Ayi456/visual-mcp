/**
 * SQL 安全检查工具
 * 用于检测 SQL 语句是否可以安全地自动执行
 */

export interface SafetyCheckResult {
  safe: boolean;
  reason?: string;
  dangerLevel?: 'safe' | 'warning' | 'danger';
}

// 危险操作关键词（会修改数据的操作）
const DANGEROUS_KEYWORDS = [
  'DROP',
  'DELETE',
  'TRUNCATE',
  'UPDATE',
  'ALTER',
  'CREATE',
  'INSERT',
  'REPLACE',
  'RENAME'
];

// 高危操作（可能造成数据丢失）
const CRITICAL_KEYWORDS = [
  'DROP',
  'TRUNCATE',
  'DELETE'
];

/**
 * 检查 SQL 语句是否可以安全自动执行
 * @param sql SQL 语句
 * @returns 安全检查结果
 */
export function checkSqlSafety(sql: string): SafetyCheckResult {
  if (!sql || sql.trim().length === 0) {
    return {
      safe: false,
      reason: 'SQL 语句为空',
      dangerLevel: 'safe'
    };
  }

  const upperSql = sql.toUpperCase().trim();

  // 检查是否包含高危操作
  for (const keyword of CRITICAL_KEYWORDS) {
    if (upperSql.includes(keyword)) {
      return {
        safe: false,
        reason: `包含高危操作: ${keyword}，请手动执行`,
        dangerLevel: 'danger'
      };
    }
  }

  // 检查是否包含危险操作
  for (const keyword of DANGEROUS_KEYWORDS) {
    if (upperSql.includes(keyword)) {
      return {
        safe: false,
        reason: `包含写操作: ${keyword}，建议手动执行`,
        dangerLevel: 'warning'
      };
    }
  }

  // 检查是否为 SELECT 查询
  if (!upperSql.startsWith('SELECT') && !upperSql.startsWith('SHOW') && !upperSql.startsWith('DESCRIBE')) {
    return {
      safe: false,
      reason: '仅支持自动执行 SELECT、SHOW、DESCRIBE 查询',
      dangerLevel: 'warning'
    };
  }

  return {
    safe: true,
    dangerLevel: 'safe'
  };
}

/**
 * 检查 SQL 是否为只读查询
 * @param sql SQL 语句
 * @returns 是否为只读查询
 */
export function isReadOnlyQuery(sql: string): boolean {
  const upperSql = sql.toUpperCase().trim();
  return (
    upperSql.startsWith('SELECT') ||
    upperSql.startsWith('SHOW') ||
    upperSql.startsWith('DESCRIBE') ||
    upperSql.startsWith('EXPLAIN')
  );
}

/**
 * 获取 SQL 语句类型
 * @param sql SQL 语句
 * @returns SQL 类型
 */
export function getSqlType(sql: string): string {
  const upperSql = sql.toUpperCase().trim();
  const firstWord = upperSql.split(/\s+/)[0];
  return firstWord || 'UNKNOWN';
}
