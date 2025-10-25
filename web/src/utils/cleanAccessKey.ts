/**
 * 清理和验证 AccessKey
 * 确保 AccessKey 是纯净的 64 位十六进制字符串
 */
export function cleanAccessKey(accessKey?: string | null): string | undefined {
  if (!accessKey) return undefined
  
  // 转换为字符串并清理
  let cleaned = String(accessKey)
    .trim()                           // 去除首尾空白
    .replace(/^Bearer\s+/i, '')       // 去除 Bearer 前缀
    .replace(/[\r\n\t\s]/g, '')       // 去除所有空白字符、换行符、制表符
    .replace(/^[\"']+|[\"']+$/g, '')  // 去除包裹引号
  
  // 检查是否为无效值
  if (cleaned === '' || cleaned === 'undefined' || cleaned === 'null') {
    return undefined
  }
  
  // 验证格式：应该是 64 位十六进制字符串
  const isValidFormat = /^[a-f0-9]{64}$/i.test(cleaned)
  
  if (!isValidFormat) {
    console.warn('AccessKey 格式异常:', {
      length: cleaned.length,
      expectedLength: 64,
      pattern: '/^[a-f0-9]{64}$/i',
      preview: cleaned.length > 20 
        ? `${cleaned.substring(0, 10)}...${cleaned.substring(cleaned.length - 10)}`
        : cleaned
    })
  }
  
  return cleaned
}

/**
 * 清理 AccessID
 * 确保 AccessID 格式正确（ak_开头的字符串）
 */
export function cleanAccessId(accessId?: string | null): string | undefined {
  if (!accessId) return undefined
  
  const cleaned = String(accessId).trim()
  
  if (cleaned === '' || cleaned === 'undefined' || cleaned === 'null') {
    return undefined
  }
  
  // AccessID 应该以 ak_ 开头
  if (!cleaned.startsWith('ak_')) {
    console.warn('AccessID 格式异常:', cleaned)
  }
  
  return cleaned
}