
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

  let cleaned = String(accessKey)
    .trim()
    .replace(/^Bearer\s+/i, '')
    .replace(/[\r\n\t\s]/g, '')
    .replace(/^[\"']+|[\"']+$/g, '')

  if (cleaned === '' || cleaned === 'undefined' || cleaned === 'null') {
    return undefined
  }

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
