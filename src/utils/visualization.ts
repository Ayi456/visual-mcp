import { PanelManager } from '../PanelManager.js';

/**
 * 创建可视化图表
 * 复用 index.ts 中的 create_visualization_chart 逻辑
 */
export async function createVisualization(params: {
  data: any[][];
  schema: Array<{ name: string; type: string }>;
  chartType: string;
  title?: string;
  axisLabels?: { x?: string; y?: string };
  style?: any;
  userId: number | string;
  username: string;
  panelManager: PanelManager;
}): Promise<{
  panelUrl: string;
  panelId: string;
  chartType: string;
  chartTypeName: string;
}> {
  const { data, schema, chartType, title, axisLabels, style, userId, username, panelManager } = params;

  // 动态导入必要的工具函数
  const { generateVisualizationHtml } = await import('../utils/htmlGenerator.js');
  const { recommendChartType } = await import('../utils/dataTypeDetector.js');
  const { getChartTypeName } = await import('../utils/htmlGenerator.js');
  const { getOSSUploader, isOSSUploaderInitialized } = await import('../OssUploader.js');

  // 将传入的 schema 转换为 SchemaField[] 类型
  const normalizedSchema: Array<{ name: string; type: 'string' | 'number' | 'date' | 'boolean' }> = schema.map(field => {
    let fieldType: 'string' | 'number' | 'date' | 'boolean' = 'string';

    const typeStr = field.type.toLowerCase();
    if (typeStr === 'number' || typeStr === 'int' || typeStr === 'float' || typeStr === 'double' || typeStr === 'decimal') {
      fieldType = 'number';
    } else if (typeStr === 'date' || typeStr === 'datetime' || typeStr === 'timestamp') {
      fieldType = 'date';
    } else if (typeStr === 'boolean' || typeStr === 'bool') {
      fieldType = 'boolean';
    }

    return { name: field.name, type: fieldType };
  });

  // 确定最终图表类型
  const requestedChartType = chartType as any;
  const finalChartType = requestedChartType === 'auto'
    ? recommendChartType(normalizedSchema, data)
    : requestedChartType;

  console.log(`最终图表类型: ${finalChartType} (原始请求: ${chartType})`);

  // 生成 HTML 内容
  const visualizationData = {
    data,
    schema: normalizedSchema,
    chartType: finalChartType as any,
    title: title || '查询结果可视化',
    axisLabels,
    style
  };
  const htmlContent = generateVisualizationHtml(visualizationData);

  // 生成文件名
  const timestamp = Date.now();
  const fileName = `sql-chart-${finalChartType}-${timestamp}.html`;

  // 上传到 OSS 并生成 Panel 短链接
  if (!isOSSUploaderInitialized() || !panelManager) {
    throw new Error('OSS 或 PanelManager 未初始化，无法生成可视化图表');
  }

  const ossUploader = getOSSUploader();
  const uploadResult = await ossUploader.uploadHTML(htmlContent, fileName);
  console.log(`OSS 上传成功: ${uploadResult.url}`);

  // 生成 Panel 短链接
  const panelResult = await panelManager.addPanel(uploadResult.url, {
    user_id: String(userId),
    title: title || '查询结果可视化',
    description: `由 ${username} 从 SQL Chat 创建的${getChartTypeName(finalChartType as any)}`,
    is_public: false
  });

  console.log(`Panel 短链接生成成功: ${panelResult.url} (id=${panelResult.id})`);

  return {
    panelUrl: panelResult.url,
    panelId: panelResult.id,
    chartType: finalChartType,
    chartTypeName: getChartTypeName(finalChartType as any)
  };
}
