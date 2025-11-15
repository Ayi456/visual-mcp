/**
 * HTML生成工具
 * 负责生成可视化报告的HTML内容
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { EChartsOption } from 'echarts';
import { VisualizationData, ChartType } from '../types/chart.types.js';
import { CHART_TYPE_NAMES } from '../constants/chart.constants.js';
import { generateUnifiedChartConfig } from './unifiedChartGenerator.js';
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
 * 生成基于模板的HTML可视化报告（使用 ECharts）
 */
export function generateVisualizationHtml(visualizationData: VisualizationData): string {
  const { title, schema } = visualizationData;


  const finalChartType = visualizationData.chartType === 'auto'
    ? recommendChartType(schema, visualizationData.data)
    : visualizationData.chartType;

  const echartsConfig = generateUnifiedChartConfig({
    ...visualizationData,
    chartType: finalChartType
  });

  // 生成 ECharts HTML
  return generateEChartsHtml({
    title: title || '数据可视化报告',
    type: finalChartType,
    echartsConfig
  });
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

/**
 * 生成 ECharts HTML（用于 SQL 查询结果）
 */
export function generateEChartsHtml(options: {
  title: string;
  type: ChartType;
  echartsConfig: EChartsOption;
  sqlQuery?: string;
}): string {
  const { title, type, echartsConfig, sqlQuery } = options;
  const currentDate = new Date().toLocaleString('zh-CN');

  // HTML转义
  const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  const sqlQueryDisplay = sqlQuery
    ? `数据来源: ${escapeHtml(sqlQuery.substring(0, 100))}${sqlQuery.length > 100 ? '...' : ''}`
    : '手动创建';

  const chartTypeName = CHART_TYPE_NAMES[type] || type;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
      padding: 3rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .container {
      max-width: 1200px;
      width: 100%;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    .header {
      padding: 2.5rem 2rem 2rem;
      text-align: center;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    .header h1 {
      font-size: 1.75rem;
      font-weight: 300;
      color: #2c3e50;
      margin-bottom: 0.75rem;
      letter-spacing: -0.02em;
    }

    .header .meta {
      font-size: 0.875rem;
      color: #7f8c8d;
      font-weight: 400;
    }

    .content {
      padding: 2rem;
    }

    #main-chart {
      width: 100%;
      height: 500px;
    }

    .footer {
      text-align: center;
      padding: 1.5rem;
      color: #95a5a6;
      font-size: 0.8rem;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
      }
    }

    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }
      .header {
        padding: 1.5rem 1rem;
      }
      .header h1 {
        font-size: 1.25rem;
      }
      .content {
        padding: 1rem;
      }
      #main-chart {
        height: 350px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${escapeHtml(title)}</h1>
      <div class="meta">
        ${chartTypeName} · ${currentDate}
      </div>
    </div>

    <div class="content">
      <div id="main-chart"></div>
    </div>

    <div class="footer">
      由专业数据可视化MCP服务器生成 | 支持智能图表推荐和多主题样式
    </div>
  </div>

  <script>
    const chartDom = document.getElementById('main-chart');
    const myChart = echarts.init(chartDom);
    const option = ${JSON.stringify(echartsConfig, null, 2)};
    myChart.setOption(option);
    window.addEventListener('resize', () => myChart.resize());
    window.addEventListener('beforeprint', () => myChart.resize());
  </script>
</body>
</html>`;
}