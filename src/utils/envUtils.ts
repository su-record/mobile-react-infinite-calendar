/**
 * 사용자 정의 서비스 키 설정 가능
 */
export const createCustomHolidayServiceKey = (userKey: string): string => {
  return decodeURIComponent(userKey)
}