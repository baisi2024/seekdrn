export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = bytes / Math.pow(k, i)

  // 如果是整数，不显示小数点
  return size % 1 === 0 ? `${size} ${units[i]}` : `${size.toFixed(1)} ${units[i]}`
}
