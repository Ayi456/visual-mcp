/**
 * 阿里云 OSS 上传工具
 */

import OSS from 'ali-oss';
import path from 'path';

export interface OSSConfig {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  endpoint: string;
}

export interface UploadResult {
  url: string;
  ossPath: string;
  fileName: string;
  size: number;
}

export class OSSUploader {
  private client: OSS;
  private bucket: string;
  private endpoint: string;

  constructor(config: OSSConfig) {
    this.validateConfig(config);

    this.bucket = config.bucket;
    this.endpoint = config.endpoint;
    this.client = new OSS({
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      bucket: config.bucket,
      endpoint: config.endpoint,
    });
  }

  private validateConfig(config: OSSConfig): void {
    if (!config.accessKeyId) {
      throw new Error('OSS AccessKeyId 不能为空');
    }
    if (!config.accessKeySecret) {
      throw new Error('OSS AccessKeySecret 不能为空');
    }
    if (!config.bucket) {
      throw new Error('OSS Bucket 不能为空');
    }
    if (!config.endpoint) {
      throw new Error('OSS Endpoint 不能为空');
    }
  }


  async generateSignedUrl(objectKey: string, expiresSeconds: number = 86400): Promise<string> {
    try {
      if (!objectKey) {
        throw new Error('objectKey 不能为空');
      }
      if (expiresSeconds <= 0 || expiresSeconds > 24 * 60 * 60) {
        throw new Error('过期时间必须在 1 秒到 24 小时之间');
      }

      const signedUrl = this.client.signatureUrl(objectKey, {
        expires: expiresSeconds,
        method: 'GET',
      });

      console.log(`为OSS对象 ${objectKey} 生成签名URL，有效期 ${expiresSeconds} 秒`);
      return signedUrl;
    } catch (error) {
      console.error(`为OSS对象 ${objectKey} 生成签名URL失败:`, error);
      throw new Error(`无法获取文件访问URL: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 上传 HTML 内容到 OSS
   */
  async uploadHTML(htmlContent: string, fileName?: string): Promise<UploadResult> {
    try {
      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const finalFileName = fileName || `visualization-${timestamp}.html`;
      
      // 构建 OSS 路径
      const ossPath = `mcp-visualizations/${finalFileName}`;
      
      // 上传到 OSS（公共读权限）
      const result = await this.client.put(ossPath, Buffer.from(htmlContent, 'utf8'), {
        mime: 'text/html',
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600', // 1小时缓存
          'Content-Disposition': 'inline; filename="chart.html"', // 强制浏览器内联显示
        },
      });

      // 生成公开访问 URL
      const publicUrl = `https://${this.bucket}.${this.endpoint}/${ossPath}`;

      return {
        url: publicUrl,
        ossPath: ossPath,
        fileName: finalFileName,
        size: Buffer.from(htmlContent, 'utf8').length
      };
    } catch (error) {
      console.error('OSS 上传失败:', error);
      throw new Error(`OSS 上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 上传文件到 OSS
   */
  async uploadFile(filePath: string, ossPath?: string): Promise<UploadResult> {
    try {
      const fileName = path.basename(filePath);
      const finalOssPath = ossPath || `mcp-files/${fileName}`;
      
      const result = await this.client.put(finalOssPath, filePath, {
        headers: {
          'x-oss-object-acl': 'public-read', // 设置文件为公开可读
        },
      });

      // 生成公开访问 URL
      const publicUrl = `https://${this.bucket}.${this.endpoint}/${finalOssPath}`;

      // 获取文件大小
      const fs = await import('fs');
      const stats = fs.statSync(filePath);

      return {
        url: publicUrl,
        ossPath: finalOssPath,
        fileName: fileName,
        size: stats.size
      };
    } catch (error) {
      console.error('OSS 文件上传失败:', error);
      throw new Error(`OSS 文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(ossPath: string): Promise<boolean> {
    try {
      await this.client.head(ossPath);
      return true;
    } catch (error) {
      return false;
    }
  }


  /**
   * 获取文件信息
   */
  async getFileInfo(ossPath: string): Promise<any> {
    try {
      const result = await this.client.head(ossPath);
      return result;
    } catch (error) {
      throw new Error(`获取文件信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}

// 创建全局 OSS 上传器实例
let ossUploader: OSSUploader | null = null;

/**
 * 初始化 OSS 上传器
 */
export function initOSSUploader(config: OSSConfig): void {
  ossUploader = new OSSUploader(config);
}

/**
 * 获取 OSS 上传器实例
 */
export function getOSSUploader(): OSSUploader {
  if (!ossUploader) {
    throw new Error('OSS 上传器未初始化，请先调用 initOSSUploader()');
  }
  return ossUploader;
}

/**
 * 检查 OSS 上传器是否已初始化
 */
export function isOSSUploaderInitialized(): boolean {
  return ossUploader !== null;
}

/**
 * 便捷函数：生成签名URL（直接使用全局实例）
 */
export async function generateSignedUrl(objectKey: string, expiresSeconds: number = 86400): Promise<string> {
  const uploader = getOSSUploader();
  return uploader.generateSignedUrl(objectKey, expiresSeconds);
}
