/**
 * SQL 工具函数
 * 共享的 SQL 相关辅助函数
 */

/**
 * 只读 SQL 检查：仅允许 SELECT / WITH ... SELECT / EXPLAIN SELECT
 *
 * @param sql - 待检查的 SQL 语句
 * @returns 是否为只读 SQL
 */
export function isReadOnlySql(sql: string): boolean {
  // 去除注释与空白
  const cleaned = (sql || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')   // /* ... */
    .replace(/--.*$/gm, '')                 // -- ...
    .replace(/#.*/gm, '')                   // # ... (MySQL)
    .trim()
    .toLowerCase();

  if (!cleaned) return false;

  // 禁止多语句（保守策略）
  if (cleaned.split(';').filter(Boolean).length > 1) return false;

  // 拒绝包含任何 DML/DDL 关键字
  const forbidden = /(insert|update|delete|create|alter|drop|truncate|grant|revoke|replace|merge|call|do|use|set|commit|rollback)\b/;
  if (forbidden.test(cleaned)) return false;

  // 允许的模式：SELECT、WITH ... SELECT、EXPLAIN [ANALYZE] SELECT
  const allowed = /^(with\s+[\s\S]*?select\s|select\s|explain\s+(analyze\s+)?select\s)/;
  return allowed.test(cleaned);
}
