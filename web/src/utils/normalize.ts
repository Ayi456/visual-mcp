
export function normalizeString(value?: string | null): string | undefined {
  if (!value) return undefined
  
  const trimmed = String(value).trim()
  
  // 处理字符串形式的 null/undefined
  if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null') {
    return undefined
  }
  
  return trimmed
}


export function normalizeAccessKey(accessKey?: string | null): string | undefined {
  if (!accessKey) return undefined
  
  // 清理 AccessKey，去除空白、换行、Bearer 前缀以及包裹引号
  let cleaned = String(accessKey)
    .trim()
    .replace(/^Bearer\s+/i, '')
    .replace(/[\r\n\t\s]/g, '')
    .replace(/^[\"']+|[\"']+$/g, '')
  
  // 处理字符串形式的 null/undefined
  if (cleaned === '' || cleaned === 'undefined' || cleaned === 'null') {
    return undefined
  }
  
  // 若格式不符合 64 位十六进制，仍返回清理后的值，由后端做最终校验
  return cleaned
}


export function normalizeEmail(email?: string | null): string | undefined {
  const normalized = normalizeString(email)
  
  if (!normalized) return undefined
  
  // 转换为小写
  return normalized.toLowerCase()
}


export function normalizeObjectStrings<T extends Record<string, any>>(
  obj: T,
  keys: (keyof T)[]
): T {
  const result = { ...obj }
  
  keys.forEach(key => {
    if (typeof result[key] === 'string' || result[key] == null) {
      result[key] = normalizeString(result[key] as string) as T[keyof T]
    }
  })
  
  return result
}
