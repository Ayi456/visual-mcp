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

// 智能图表类型推荐（auto 模式）
// 目标：覆盖常见场景，同时保持保守，不轻易选过于“重”的高级图表
export function recommendChartType(schema: SchemaField[], data: any[][]): ChartType {
  if (!schema || schema.length === 0 || !data || data.length === 0) {
    return 'bar';
  }

  const rowCount = data.length;
  const numericFields = schema.filter(f => f.type === 'number');
  const dateFields = schema.filter(f => f.type === 'date');
  const stringFields = schema.filter(f => f.type === 'string');
  const booleanFields = schema.filter(f => f.type === 'boolean');

  const firstField = schema[0];

  const isCategorical = (t: DataType) => t === 'string' || t === 'boolean';

  const uniqueCount = (colIndex: number): number => {
    const set = new Set<any>();
    for (const row of data) {
      set.add(row[colIndex]);
    }
    return set.size;
  };


  if (schema.length >= 3) {
    const dimIndices: number[] = [];
    schema.forEach((f, idx) => {
      if (isCategorical(f.type) || f.type === 'date') dimIndices.push(idx);
    });

    if (dimIndices.length >= 2 && numericFields.length >= 1) {
      const [d1, d2] = dimIndices;
      const combos = new Set(data.map(row => `${row[d1]}__${row[d2]}`)).size;
      const u1 = uniqueCount(d1);
      const u2 = uniqueCount(d2);
      const expected = u1 * u2 || 1;
      const density = combos / expected;

      if (u1 > 1 && u2 > 1 && u1 <= 24 && u2 <= 24 && density >= 0.6 && rowCount <= 2000) {
        return 'heatmap';
      }
    }
  }


  if (firstField.type === 'date' && numericFields.length >= 1) {

    if (numericFields.length >= 2 && rowCount >= 12) {
      return 'area'; 
    }
    return 'line';
  }


  if (firstField.type === 'number' && numericFields.length >= 2) {
    if (numericFields.length >= 3 && rowCount <= 2000) {
      return 'bubble';
    }
    return 'scatter';
  }

  if (isCategorical(firstField.type) && numericFields.length >= 1) {
    const xIndex = 0;
    const categoryCount = uniqueCount(xIndex);

    if (numericFields.length >= 3 && categoryCount <= 8 && rowCount <= 50) {
      return 'radar';
    }

    if (numericFields.length === 1 && categoryCount > 1 && categoryCount <= 8 && rowCount <= 50) {
      return 'pie';
    }

    return 'bar';
  }

  if (numericFields.length === 1) {
    if (dateFields.length > 0) {
      return 'line';
    }
    if (stringFields.length > 0 || booleanFields.length > 0) {
      const dimIndex = schema.findIndex(f => isCategorical(f.type));
      const catCount = dimIndex >= 0 ? uniqueCount(dimIndex) : rowCount;
      return catCount <= 8 ? 'pie' : 'bar';
    }
  }

  return 'bar';
}
