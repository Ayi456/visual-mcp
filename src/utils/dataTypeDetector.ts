import { DataType, SchemaField, ChartType } from '../types/chart.types.js';

// 数字类型检测
export function isNumeric(value: any): boolean {
  if (typeof value === 'number') return isFinite(value);
  if (typeof value !== 'string') return false;

  const trimmed = value.trim();
  if (trimmed === '') return false;

  // 检查科学计数法
  if (/^[+-]?\d*\.?\d+([eE][+-]?\d+)?$/.test(trimmed)) {
    const num = Number(trimmed);
    return isFinite(num);
  }

  // 检查百分比
  if (/^[+-]?\d*\.?\d+%$/.test(trimmed)) {
    return true;
  }

  // 检查货币格式
  if (/^[¥$€£]\d+(\.?\d{2})?$/.test(trimmed)) {
    return true;
  }

  return false;
}

// 日期类型检测
export function isDateLike(value: any): boolean {
  if (value instanceof Date) return !isNaN(value.getTime());
  if (typeof value !== 'string') return false;

  const trimmed = value.trim();
  if (trimmed === '') return false;

  // 常见日期格式
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO format
    /^\d{4}年\d{1,2}月\d{1,2}日$/, // 中文日期
  ];

  if (datePatterns.some(pattern => pattern.test(trimmed))) {
    const date = new Date(trimmed);
    return !isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100;
  }

  return false;
}

// 布尔类型检测
export function isBooleanLike(value: any): boolean {
  if (typeof value === 'boolean') return true;
  if (typeof value !== 'string') return false;

  const trimmed = value.toLowerCase().trim();
  const booleanValues = ['true', 'false', 'yes', 'no', 'y', 'n', '是', '否', '1', '0'];
  return booleanValues.includes(trimmed);
}

// 简化的数据类型识别函数
export function identifyDataType(values: any[]): DataType {
  if (values.length === 0) return 'string';

  const validValues = values.filter(v => v != null && v !== '' &&
    !(typeof v === 'string' && v.trim() === ''));

  if (validValues.length === 0) return 'string';

  // 检查是否为数字
  if (validValues.every(v => isNumeric(v))) {
    return 'number';
  }

  // 检查是否为日期
  if (validValues.every(v => isDateLike(v))) {
    return 'date';
  }

  // 检查是否为布尔值
  if (validValues.every(v => isBooleanLike(v))) {
    return 'boolean';
  }

  return 'string';
}

// 简化的智能图表类型推荐
export function recommendChartType(schema: SchemaField[], data: any[][]): ChartType {
  if (schema.length < 2) return 'bar';

  const [xField, yField] = schema;
  const uniqueXValues = new Set(data.map(row => row[0])).size;

  // 数值 vs 数值 -> 散点图
  if (xField.type === 'number' && yField.type === 'number') {
    return 'scatter';
  }

  // 时间 vs 数值 -> 折线图
  if (xField.type === 'date' && yField.type === 'number') {
    return 'line';
  }

  // 分类 vs 数值 -> 柱状图或饼图
  if (xField.type === 'string' && yField.type === 'number') {
    // 如果分类数量较少（例如小于等于8个），推荐饼图，否则柱状图更清晰
    return uniqueXValues <= 8 ? 'pie' : 'bar';
  }

  // 默认返回柱状图
  return 'bar';
}