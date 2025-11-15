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
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1秒

  constructor(config: OSSConfig) {
    this.validateConfig(config);

    this.bucket = config.bucket;
    this.endpoint = config.endpoint;

    // 确保使用HTTPS协议
    const secureEndpoint = config.endpoint.replace(/^http:\/\//i, 'https://').replace(/^https:\/\//i, '');

    this.client = new OSS({
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      bucket: config.bucket,
      endpoint: secureEndpoint,
      secure: true, // 强制使用HTTPS
      timeout: 60000, // 60秒超时
      region: this.extractRegion(config.endpoint), // 提取region
    });

    console.log(`OSS客户端初始化成功: bucket=${this.bucket}, endpoint=${secureEndpoint}, secure=true`);
  }

  /**
   * 从endpoint提取region
   */
  private extractRegion(endpoint: string): string | undefined {
    // 从endpoint提取region，例如：oss-cn-hangzhou.aliyuncs.com -> cn-hangzhou
    const match = endpoint.match(/oss-([^.]+)\.aliyuncs\.com/);
    return match ? match[1] : undefined;
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
   * 带重试的上传操作
   */
  private async uploadWithRetry<T>(
    uploadFn: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`${operationName} - 尝试 ${attempt}/${this.maxRetries}`);
        const result = await uploadFn();
        if (attempt > 1) {
          console.log(`${operationName} - 在第 ${attempt} 次尝试后成功`);
        }
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`${operationName} - 第 ${attempt} 次尝试失败:`, lastError.message);

        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * attempt; // 指数退避
          console.log(`等待 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`${operationName} 失败（已重试 ${this.maxRetries} 次）: ${lastError?.message}`);
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
      const buffer = Buffer.from(htmlContent, 'utf8');

      console.log(`准备上传 HTML 到 OSS: ${ossPath}, 大小: ${buffer.length} 字节`);

      // 使用重试机制上传到 OSS
      await this.uploadWithRetry(
        async () => {
          return await this.client.put(ossPath, buffer, {
            mime: 'text/html',
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, max-age=3600', // 1小时缓存
              'Content-Disposition': 'inline; filename="chart.html"', // 强制浏览器内联显示
            },
          });
        },
        `上传HTML文件 ${finalFileName}`
      );

      // 生成公开访问 URL
      const publicUrl = `https://${this.bucket}.${this.endpoint}/${ossPath}`;

      console.log(`HTML 上传成功: ${publicUrl}`);

      return {
        url: publicUrl,
        ossPath: ossPath,
        fileName: finalFileName,
        size: buffer.length
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error('OSS 上传失败:', errorMsg);

      // 提供更详细的错误信息
      if (errorMsg.includes('ETIMEDOUT') || errorMsg.includes('timeout')) {
        throw new Error(`OSS 上传超时，请检查网络连接和OSS配置。错误详情: ${errorMsg}`);
      } else if (errorMsg.includes('ECONNREFUSED')) {
        throw new Error(`无法连接到OSS服务器，请检查endpoint配置。错误详情: ${errorMsg}`);
      } else {
        throw new Error(`OSS 上传失败: ${errorMsg}`);
      }
    }
  }

  /**
   * 上传文件到 OSS
   */
  async uploadFile(filePath: string, ossPath?: string): Promise<UploadResult> {
    try {
      const fileName = path.basename(filePath);
      const finalOssPath = ossPath || `mcp-files/${fileName}`;

      console.log(`准备上传文件到 OSS: ${finalOssPath}`);

      // 使用重试机制上传到 OSS
      await this.uploadWithRetry(
        async () => {
          return await this.client.put(finalOssPath, filePath, {
            headers: {
              'x-oss-object-acl': 'public-read', // 设置文件为公开可读
            },
          });
        },
        `上传文件 ${fileName}`
      );

      // 生成公开访问 URL
      const publicUrl = `https://${this.bucket}.${this.endpoint}/${finalOssPath}`;

      // 获取文件大小
      const fs = await import('fs');
      const stats = fs.statSync(filePath);

      console.log(`文件上传成功: ${publicUrl}`);

      return {
        url: publicUrl,
        ossPath: finalOssPath,
        fileName: fileName,
        size: stats.size
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error('OSS 文件上传失败:', errorMsg);
      throw new Error(`OSS 文件上传失败: ${errorMsg}`);
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
 * 测试 OSS 连接
 * 用于诊断OSS配置是否正确
 */
export async function testOSSConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const uploader = getOSSUploader();

    // 尝试列出bucket中的文件（只获取1个），不会产生额外费用
    await (uploader as any).client.list({
      'max-keys': 1
    });

    return {
      success: true,
      message: `OSS 连接测试成功，bucket: ${(uploader as any).bucket}`
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `OSS 连接测试失败: ${errorMsg}`
    };
  }
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
