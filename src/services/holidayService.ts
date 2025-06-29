/**
 * 한국 공공데이터포털 공휴일 API 서비스
 */

import type { Holiday, LocaleCode } from '@/types'
import { API_CONSTANTS } from '@/constants/calendar'
import { createCustomHolidayServiceKey } from '@/utils/envUtils'
import { logger } from '@/utils/logger'

// API 응답 타입 정의
interface HolidayApiResponse {
  response: {
    header: {
      resultCode: string
      resultMsg: string
    }
    body: {
      items: {
        item?: HolidayApiItem[]
      }
      numOfRows: number
      pageNo: number
      totalCount: number
    }
  }
}

interface HolidayApiItem {
  dateKind: string    // 양력/음력 구분 ("01": 양력)
  dateName: string    // 공휴일명
  isHoliday: string   // 공휴일 여부 ("Y" | "N")
  locdate: number     // 날짜 (YYYYMMDD 숫자 형식)
  seq: number         // 순번
}

// 캐시 관리
interface CacheData {
  holidays: Holiday[]
  timestamp: number
}

class HolidayCache {
  private cache = new Map<string, CacheData>()
  private readonly CACHE_DURATION = API_CONSTANTS.CACHE_DURATION

  set(key: string, holidays: Holiday[]): void {
    this.cache.set(key, {
      holidays,
      timestamp: Date.now()
    })
  }

  get(key: string): Holiday[] | null {
    const data = this.cache.get(key)
    if (!data) return null

    // 캐시 유효성 검사
    if (Date.now() - data.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key)
      return null
    }

    return data.holidays
  }

  clear(): void {
    this.cache.clear()
  }
}

const holidayCache = new HolidayCache()

export class HolidayService {
  private serviceKey: string
  private locale: LocaleCode | string

  constructor(serviceKey?: string, locale: LocaleCode | string = 'ko-KR') {
    this.serviceKey = createCustomHolidayServiceKey(serviceKey || '')
    this.locale = locale
  }

  /**
   * 특정 년월의 공휴일 데이터 조회
   */
  async getHolidays(year: number, month: number): Promise<Holiday[]> {
    // 유효성 검사
    if (!this.isKoreanLocale() || !this.serviceKey) {
      logger.debug('공휴일 데이터 로드 스킵: 비한국 로케일 또는 서비스키 없음')
      return []
    }

    const monthCacheKey = `${year}-${month.toString().padStart(2, '0')}`
    const monthCached = holidayCache.get(monthCacheKey)
    if (monthCached) {
      logger.debug(`공휴일 캐시 히트: ${monthCacheKey}`, { count: monthCached.length })
      return monthCached
    }

    try {
      const yearCacheKey = `year-${year}`
      let yearHolidays = holidayCache.get(yearCacheKey)
      
      if (!yearHolidays) {
        logger.info(`공휴일 API 호출 시작: ${year}년`)
        yearHolidays = await this.fetchYearHolidays(year)
        holidayCache.set(yearCacheKey, yearHolidays)
        logger.info(`공휴일 API 호출 완료: ${year}년`, { count: yearHolidays.length })
      } else {
        logger.debug(`공휴일 연도 캐시 히트: ${year}년`)
      }
      
      const monthHolidays = this.filterHolidaysByMonth(yearHolidays, month)
      holidayCache.set(monthCacheKey, monthHolidays)
      
      return monthHolidays
    } catch (error) {
      logger.error('공휴일 데이터 조회 실패:', error)
      return []
    }
  }

  /**
   * 한국 로케일 확인
   */
  private isKoreanLocale(): boolean {
    return this.locale === 'ko-KR' || this.locale === 'ko'
  }

  /**
   * 연도별 공휴일 데이터 가져오기
   */
  private async fetchYearHolidays(year: number): Promise<Holiday[]> {
    const url = this.buildApiUrl(year)
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await this.parseResponse(response)
    
    // API 응답 검증
    if (data.response?.header?.resultCode !== '00') {
      logger.error('API 응답 오류:', data.response?.header)
      throw new Error(`API Error: ${data.response?.header?.resultMsg || 'Unknown error'}`)
    }
    
    return this.transformApiData(data)
  }

  /**
   * API URL 생성
   */
  private buildApiUrl(year: number): string {
    // URL 인코딩하지 않고 직접 문자열로 구성
    const baseUrl = 'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo'
    const params = [
      `solYear=${year}`,
      `ServiceKey=${this.serviceKey}`,
      '_type=json',
      `numOfRows=${API_CONSTANTS.MAX_ROWS_PER_REQUEST}`
    ]
    
    return `${baseUrl}?${params.join('&')}`
  }

  /**
   * API 응답 파싱
   */
  private async parseResponse(response: Response): Promise<HolidayApiResponse> {
    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      const data = await response.json()
      return data
    }
    
    // XML 또는 텍스트 응답 처리
    const text = await response.text()
    
    // XML 오류 확인
    if (this.isXmlError(text)) {
      this.logXmlError(text)
      throw new Error('API returned XML error')
    }
    
    // JSON 파싱 시도
    try {
      const data = JSON.parse(text)
      return data
    } catch (error) {
      throw new Error('Failed to parse API response')
    }
  }

  /**
   * XML 오류 응답 확인
   */
  private isXmlError(text: string): boolean {
    return text.includes('<OpenAPI_ServiceResponse>') && text.includes('<errMsg>')
  }

  /**
   * XML 오류 로깅
   */
  private logXmlError(text: string): void {
    const errMsg = text.match(/<errMsg>(.*?)<\/errMsg>/)?.[1]
    const authMsg = text.match(/<returnAuthMsg>(.*?)<\/returnAuthMsg>/)?.[1]
    
    logger.error('공휴일 API 오류:', { errMsg, authMsg })
    
    if (authMsg === 'SERVICE_KEY_IS_NOT_REGISTERED_ERROR') {
      logger.error('서비스 키가 등록되지 않았습니다.')
    }
  }

  /**
   * 월별 공휴일 필터링
   */
  private filterHolidaysByMonth(holidays: Holiday[], month: number): Holiday[] {
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date)
      return holidayDate.getMonth() + 1 === month
    })
  }

  /**
   * 여러 개월의 공휴일 데이터 일괄 조회
   */
  async getHolidaysForRange(startDate: Date, endDate: Date): Promise<Holiday[]> {
    // 한국 로케일이 아닌 경우 빈 배열 반환
    const isKorean = this.locale === 'ko-KR' || this.locale === 'ko'
    if (!isKorean) {
      return []
    }
    const promises: Promise<Holiday[]>[] = []
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1)

    while (current <= end) {
      promises.push(this.getHolidays(current.getFullYear(), current.getMonth() + 1))
      current.setMonth(current.getMonth() + 1)
    }

    try {
      const results = await Promise.all(promises)
      return results.flat()
    } catch (error) {
      logger.error('공휴일 범위 조회 실패:', error)
      return []
    }
  }

  /**
   * API 응답 데이터를 내부 Holiday 타입으로 변환
   */
  private transformApiData(data: HolidayApiResponse): Holiday[] {
    const items = data.response?.body?.items?.item
    
    if (!items || !Array.isArray(items)) {
      return []
    }

    return items
      .filter(this.isHolidayItem)
      .map(this.convertToHoliday.bind(this))
  }

  /**
   * 공휴일 여부 확인
   */
  private isHolidayItem(item: HolidayApiItem): boolean {
    return item.isHoliday === 'Y'
  }

  /**
   * API 아이템을 Holiday 타입으로 변환
   */
  private convertToHoliday(item: HolidayApiItem): Holiday {
    return {
      id: `holiday-${item.locdate}`,
      name: item.dateName,
      date: this.formatDate(item.locdate),
      color: 'red'
    }
  }

  /**
   * YYYYMMDD 형식을 YYYY-MM-DD 형식으로 변환
   */
  private formatDate(locdate: number): string {
    const dateStr = locdate.toString()
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)
    return `${year}-${month}-${day}`
  }

  /**
   * 캐시 클리어
   */
  clearCache(): void {
    holidayCache.clear()
  }
}

// 기본 인스턴스 export
export const holidayService = new HolidayService()