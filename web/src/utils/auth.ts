import { getStorageJSON } from './storage';
import type { User } from '@/types/auth';

/**
 * 获取认证 Headers
 * 统一处理 AccessID 和 AccessKey 的读取和格式化
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  try {
    const userInfo = getStorageJSON<User>('userInfo');
    const accessKey = getStorageJSON<string>('accessKey');

    if (userInfo?.access_id && accessKey) {
      headers['AccessID'] = userInfo.access_id;
      headers['AccessKey'] = accessKey;
    }
  } catch (error) {
    console.warn('Failed to get auth headers:', error);
  }

  return headers;
}
