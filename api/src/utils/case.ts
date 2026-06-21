export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, any> = {}
    for (const key of Object.keys(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      result[camelKey] = toCamelCase(obj[key])
    }
    return result
  }
  return obj
}

export function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase)
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, any> = {}
    for (const key of Object.keys(obj)) {
      const snakeKey = key.replace(/([A-Z])/g, (_, letter) => '_' + letter.toLowerCase())
      result[snakeKey] = toSnakeCase(obj[key])
    }
    return result
  }
  return obj
}
