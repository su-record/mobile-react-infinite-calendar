/**
 * ID 생성 유틸리티
 */

/**
 * 캘린더 이벤트용 ID 생성
 */
export const generateEventId = (date: string, title: string, index: number): string => {
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9가-힣]/g, '_')
  return `event-${date}-${sanitizedTitle}-${index}`
}

/**
 * 공휴일용 ID 생성
 */
export const generateHolidayId = (date: string, name?: string): string => {
  const sanitizedName = name ? name.replace(/[^a-zA-Z0-9가-힣]/g, '_') : 'holiday'
  return `holiday-${date}-${sanitizedName}`
}

/**
 * 일반적인 ID 생성 (prefix + date + title + index)
 */
export const generateId = (prefix: string, date: string, title: string, index?: number): string => {
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9가-힣]/g, '_')
  const suffix = index !== undefined ? `-${index}` : ''
  return `${prefix}-${date}-${sanitizedTitle}${suffix}`
}

/**
 * UUID 스타일의 랜덤 ID 생성 (간단 버전)
 */
export const generateRandomId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}