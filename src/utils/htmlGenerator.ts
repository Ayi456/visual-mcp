/**
 * HTML生成工具
 * 负责生成可视化报告的HTML内容
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { VisualizationData, ChartType } from '../types/chart.types.js';
import { CHART_TYPE_NAMES } from '../constants/chart.constants.js';
import { generateChartConfig } from './chartGenerator.js';
import { recommendChartType } from './dataTypeDetector.js';

// 获取模板目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.join(__dirname, '../templates');

/**
 * 加载HTML模板
 */
export function loadHtmlTemplate(): string {
  const templatePath = path.join(TEMPLATES_DIR, 'chart-template.html');
  return fs.readFileSync(templatePath, 'utf8');
}

/**
 * 加载主题配置
 */
export function loadThemeConfigs(): any {
  const configPath = path.join(TEMPLATES_DIR, 'theme-configs.json');
  const configContent = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(configContent);
}

/**
 * 生成基于模板的HTML可视化报告
 */
export function generateVisualizationHtml(visualizationData: VisualizationData): string {
  const { title, schema, style = {} } = visualizationData;
  const currentDate = new Date().toLocaleString('zh-CN');
  const chartConfig = generateChartConfig(visualizationData);
  const chartConfigJson = JSON.stringify(chartConfig, null, 2);

  // 加载模板和主题配置
  const template = loadHtmlTemplate();
  const themeConfigs = loadThemeConfigs();
  const themeName = style.theme || 'default';
  const themeConfig = themeConfigs[themeName] || themeConfigs.default;

  // 确定最终的图表类型
  const finalChartType = visualizationData.chartType === 'auto' ?
    recommendChartType(schema, visualizationData.data) : visualizationData.chartType;

  // 准备模板替换数据
  const templateData = {
    TITLE: title || '数据可视化报告',
    GENERATION_TIME: currentDate,
    CHART_TYPE_NAME: CHART_TYPE_NAMES[finalChartType],
    CHART_CONFIG: chartConfigJson,
    ...themeConfig // 展开主题配置
  };

  // 使用模板并替换占位符
  let html = template;
  Object.entries(templateData).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    html = html.replace(new RegExp(placeholder, 'g'), String(value));
  });

  return html;
}

/**
 * 生成文件名
 */
export function generateFileName(chartType: ChartType): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `visualization-${chartType}-${timestamp}.html`;
}

/**
 * 获取图表类型中文名称
 */
export function getChartTypeName(chartType: ChartType): string {
  return CHART_TYPE_NAMES[chartType];
}