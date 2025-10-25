import crypto from 'crypto';

/**
 * 生成加密安全的随机ID
 * @param length 
 * @returns 
 */
export function generateSecureId(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(length);
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  
  return result;
}


export function isValidId(id: string, expectedLength: number = 16): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  if (id.length !== expectedLength) {
    return false;
  }
  
  // 只允许字母和数字
  const validPattern = /^[A-Za-z0-9]+$/;
  return validPattern.test(id);
}


export function isValidOssPath(osspath: string): boolean {
  if (!osspath || typeof osspath !== 'string') {
    return false;
  }
  
  // 基本的OSS路径格式验证
  // 应该以 http:// 或 https:// 开头，或者是相对路径
  const urlPattern = /^https?:\/\/.+/;
  const pathPattern = /^[a-zA-Z0-9\-_\/\.]+$/;
  
  return urlPattern.test(osspath) || pathPattern.test(osspath);
}


export function isValidTtl(ttl: number, maxTtl: number = 24 * 60 * 60): boolean {
  return typeof ttl === 'number' && ttl > 0 && ttl <= maxTtl && Number.isInteger(ttl);
}


export function calculateExpiryTime(ttl: number): Date {
  return new Date(Date.now() + ttl * 1000);
}


export function isExpired(expiryTime: Date): boolean {
  return new Date() > expiryTime;
}


export function formatDateTime(date: Date): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * 生成Redis缓存键
 * @param id 
 * @returns
 */
export function generateCacheKey(id: string): string {
  return `panel:${id}`;
}


// validateAddPanelArgs 函数已移除，直接在 PanelManager 中验证

/**
 * 安全地解析JSON
 * @param jsonString 
 * @returns 
 */
export function safeJsonParse(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

/**
 * 延迟执行
 * @param ms 
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试执行函数
 * @param fn 
 * @param maxRetries 
 * @param delayMs 
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries) {
        await delay(delayMs);
      }
    }
  }
  
  throw lastError!;
}
