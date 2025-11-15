/**
 * OSS 客户端工具
 * 提供 Dashboard 所需的 OSS 上传功能
 */

import { getOSSUploader } from '../core/OssUploader.js';

/**
 * 上传文件到 OSS
 * @param fileName 文件名（将存储在 mcp-dashboards/ 目录下）
 * @param content 文件内容（Buffer 或 string）
 * @returns OSS URL
 */
export async function uploadToOSS(fileName: string, content: Buffer | string): Promise<string> {
  try {
    const uploader = getOSSUploader();

    // 确保文件名带有正确的前缀
    const ossPath = fileName.startsWith('mcp-dashboards/')
      ? fileName
      : `mcp-dashboards/${fileName}`;

    // 将 Buffer 转换为字符串（如果是 HTML）
    const htmlContent = Buffer.isBuffer(content)
      ? content.toString('utf-8')
      : content;

    // 使用 OSSUploader 的 uploadHTML 方法
    const result = await uploader.uploadHTML(htmlContent, fileName);

    console.log(`Dashboard HTML 上传成功: ${result.url}`);
    return result.url;
  } catch (error) {
    console.error('上传 Dashboard 到 OSS 失败:', error);
    throw new Error(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}
