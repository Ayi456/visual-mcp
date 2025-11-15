/**
 * Dashboard HTML生成器
 * 负责生成多图表Dashboard的HTML内容（聚合模式）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取模板目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.join(__dirname, '../templates');

interface ChartPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DashboardChart {
  id: string;
  chartTitle: string;
  chartType: string;
  chartConfig: any;
  dataSource: any;
  position: ChartPosition;
  panelUrl?: string;  // Panel URL（聚合模式使用）
}

interface LayoutConfig {
  gridCols: number;
  rowHeight: number;
  charts?: any[];
}

interface DashboardData {
  title: string;
  theme: string;
  layoutConfig: LayoutConfig;
  charts: DashboardChart[];
}

/**
 * 加载Dashboard聚合模板
 */
export function loadDashboardAggregateTemplate(): string {
  const templatePath = path.join(TEMPLATES_DIR, 'dashboard-aggregate-template.html');
  return fs.readFileSync(templatePath, 'utf8');
}

/**
 * 加载Dashboard HTML模板
 */
export function loadDashboardTemplate(): string {
  const templatePath = path.join(TEMPLATES_DIR, 'dashboard-template.html');
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
 * 生成Dashboard HTML
 */
export function generateDashboardHtml(data: DashboardData): string {
  const { title, theme, layoutConfig, charts } = data;
  const currentDate = new Date().toLocaleString('zh-CN');

  // 加载模板
  const template = loadDashboardTemplate();

  // 加载主题配置
  const themeConfigs = loadThemeConfigs();
  const themeConfig = themeConfigs[theme] || themeConfigs.default;

  // 生成图表卡片HTML
  const chartCards = charts.map((chart) => {
    const { position } = chart;
    const gridColumn = `span ${position.w}`;
    const gridRowStart = position.y + 1;

    return `
      <div class="chart-card" style="grid-column: ${gridColumn}; grid-row-start: ${gridRowStart};">
        <h3>${escapeHtml(chart.chartTitle)}</h3>
        <div class="chart-container">
          <canvas id="${chart.id}"></canvas>
        </div>
      </div>
    `;
  }).join('\n');

  // 生成图表配置数组
  const chartsConfig = charts.map(chart => ({
    canvasId: chart.id,
    chartConfig: chart.chartConfig
  }));

  // 准备模板替换数据
  const replacements: Record<string, string> = {
    TITLE: escapeHtml(title),
    GENERATION_TIME: currentDate,
    CHART_COUNT: charts.length.toString(),
    CHART_CARDS: chartCards,
    CHARTS_CONFIG: JSON.stringify(chartsConfig, null, 2),
    GRID_COLS: layoutConfig.gridCols?.toString() || '12',
    ROW_HEIGHT: layoutConfig.rowHeight?.toString() || '80',
    ...themeConfig
  };

  // 替换模板占位符
  let html = template;
  Object.entries(replacements).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    html = html.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
  });

  return html;
}

/**
 * HTML转义函数（防止XSS攻击）
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * 生成Dashboard文件名
 */
export function generateDashboardFileName(dashboardId: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `dashboard-${dashboardId}-${timestamp}.html`;
}

/**
 * 生成Dashboard聚合页面HTML
 * 使用iframe嵌入各个已生成的Panel
 */
export function generateDashboardAggregateHtml(data: DashboardData): string {
  const { title, theme, layoutConfig, charts } = data;
  const currentDate = new Date().toLocaleString('zh-CN');

  // 加载模板
  const template = loadDashboardAggregateTemplate();

  // 加载主题配置
  const themeConfigs = loadThemeConfigs();
  const themeConfig = themeConfigs[theme] || themeConfigs.default;

  // 生成Panel卡片HTML
  const panelCards = charts.map((chart) => {
    const { position, panelUrl } = chart;
    const gridColumn = `span ${position.w}`;
    const gridRowStart = position.y + 1;
    const gridRowEnd = position.y + position.h + 1;

    // 如果没有panelUrl，显示错误提示
    if (!panelUrl) {
      return `
        <div class="panel-card" style="grid-column: ${gridColumn}; grid-row: ${gridRowStart} / ${gridRowEnd};">
          <div class="panel-card-header">
            <h3>${escapeHtml(chart.chartTitle)}</h3>
          </div>
          <div class="panel-card-body">
            <div class="loading">Panel URL缺失，无法显示</div>
          </div>
        </div>
      `;
    }

    return `
      <div class="panel-card" style="grid-column: ${gridColumn}; grid-row: ${gridRowStart} / ${gridRowEnd};">
        <div class="panel-card-header">
          <h3>${escapeHtml(chart.chartTitle)}</h3>
        </div>
        <div class="panel-card-body">
          <iframe src="${escapeHtml(panelUrl)}" loading="lazy" title="${escapeHtml(chart.chartTitle)}"></iframe>
        </div>
        <div class="panel-link">
          <a href="${escapeHtml(panelUrl)}" target="_blank">在新标签页中打开 ↗</a>
        </div>
      </div>
    `;
  }).join('\n');

  // 生成Panel配置数组（用于调试）
  const panelsConfig = charts.map(chart => ({
    id: chart.id,
    title: chart.chartTitle,
    url: chart.panelUrl
  }));

  // 准备模板替换数据
  const replacements: Record<string, string> = {
    TITLE: escapeHtml(title),
    GENERATION_TIME: currentDate,
    CHART_COUNT: charts.length.toString(),
    PANEL_CARDS: panelCards,
    PANELS_CONFIG: JSON.stringify(panelsConfig, null, 2),
    GRID_COLS: layoutConfig.gridCols?.toString() || '12',
    ROW_HEIGHT: layoutConfig.rowHeight?.toString() || '80',
    ...themeConfig
  };

  // 替换模板占位符
  let html = template;
  Object.entries(replacements).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    html = html.replace(
      new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      String(value)
    );
  });

  return html;
}
