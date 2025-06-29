/**
 * 동적 이벤트 로딩 훅
 * 인피니티 스크롤 시 자동으로 이벤트를 미리 로드하여 지연 없는 UX 제공
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import { uiLogger } from '@/utils/logger'
import type { CalendarEvent } from '@/types'

interface UseDynamicEventsProps {
  dynamicEvents?: (startDate: string | Date, endDate: string | Date) => Promise<any[]>
  infiniteMonths: Date[]
  enableDynamicLoading: boolean
  // 데이터 매핑 옵션
  dynamicEventMapping?: {
    id?: string
    title?: string  
    date?: string
    startTime?: string
    endTime?: string
    color?: string
    description?: string
  }
  dynamicEventTransform?: (apiData: any) => CalendarEvent
  onDynamicEventLoad?: (startDate: Date, endDate: Date, events: CalendarEvent[]) => void
}

interface DynamicEventState {
  loadedEvents: CalendarEvent[]
  loadingMonths: Set<string>
  loadedMonths: Set<string>
  errorMonths: Map<string, string>
}

// 스마트 로딩 설정
const SMART_LOADING_CONFIG = {
  PRELOAD_BUFFER: 2,        // 현재 월 기준 앞뒤로 몇 달 미리 로드
  MAX_RETRIES: 3,           // API 실패 시 최대 재시도 횟수
  RETRY_DELAY: 1000,        // 재시도 간격 (ms)
  CACHE_SIZE: 50,           // 최대 캐시할 월 수
} as const

export function useDynamicEvents({
  dynamicEvents,
  infiniteMonths: initialInfiniteMonths,
  enableDynamicLoading,
  dynamicEventMapping,
  dynamicEventTransform,
  onDynamicEventLoad
}: UseDynamicEventsProps) {
  
  // 내부 상태로 infiniteMonths 관리
  const [infiniteMonths, setInfiniteMonths] = useState<Date[]>(initialInfiniteMonths || [])
  const [state, setState] = useState<DynamicEventState>({
    loadedEvents: [],
    loadingMonths: new Set(),
    loadedMonths: new Set(),
    errorMonths: new Map()
  })

  // 캐시된 이벤트 데이터 (메모리 관리를 위한 Map)
  const eventCacheRef = useRef<Map<string, CalendarEvent[]>>(new Map())
  const loadingPromisesRef = useRef<Map<string, Promise<CalendarEvent[]>>>(new Map())

  // 월 문자열 생성 (YYYY-MM 형식)
  const getMonthKey = useCallback((date: Date): string => {
    return format(date, 'yyyy-MM')
  }, [])

  // 데이터 매핑 함수
  const transformApiData = useCallback((apiData: any[]): CalendarEvent[] => {
    if (!apiData || !Array.isArray(apiData)) return []

    return apiData.map((item, index) => {
      // 함수형 변환이 있으면 우선 사용
      if (dynamicEventTransform) {
        try {
          return dynamicEventTransform(item)
        } catch (error) {
          uiLogger.error('동적 이벤트 변환 함수 실행 실패:', error)
          return null
        }
      }

      // 키 매핑 사용
      if (dynamicEventMapping) {
        const mapped: CalendarEvent = {
          id: item[dynamicEventMapping.id || 'id'] || `dynamic-${Date.now()}-${index}`,
          title: item[dynamicEventMapping.title || 'title'] || 'Untitled Event',
          date: item[dynamicEventMapping.date || 'date'] || format(new Date(), 'yyyy-MM-dd'),
        }

        // 옵셔널 필드들 (타입 강제 변환)
        if (dynamicEventMapping.startTime && item[dynamicEventMapping.startTime]) {
          (mapped as any).startTime = item[dynamicEventMapping.startTime]
        }
        if (dynamicEventMapping.endTime && item[dynamicEventMapping.endTime]) {
          (mapped as any).endTime = item[dynamicEventMapping.endTime]
        }
        if (dynamicEventMapping.color && item[dynamicEventMapping.color]) {
          mapped.color = item[dynamicEventMapping.color]
        }
        if (dynamicEventMapping.description && item[dynamicEventMapping.description]) {
          (mapped as any).description = item[dynamicEventMapping.description]
        }

        return mapped
      }

      // 매핑 정보가 없으면 기본 구조 가정
      const defaultMapped: any = {
        id: item.id || `dynamic-${Date.now()}-${index}`,
        title: item.title || item.name || 'Untitled Event',
        date: item.date || item.startDate || format(new Date(), 'yyyy-MM-dd'),
        color: item.color
      }
      
      // 선택적 필드들
      if (item.startTime) defaultMapped.startTime = item.startTime
      if (item.endTime) defaultMapped.endTime = item.endTime
      if (item.description) defaultMapped.description = item.description
      
      return defaultMapped
    }).filter(Boolean) as CalendarEvent[]
  }, [dynamicEventMapping, dynamicEventTransform])

  // 로드가 필요한 월들 계산 (현재 월 + 버퍼)
  const getMonthsToLoad = useCallback((currentMonths: Date[]): Date[] => {
    if (!currentMonths.length) return []

    const allMonths = new Set<string>()
    
    currentMonths.forEach(month => {
      // 현재 월
      allMonths.add(getMonthKey(month))
      
      // 앞쪽 버퍼
      for (let i = 1; i <= SMART_LOADING_CONFIG.PRELOAD_BUFFER; i++) {
        allMonths.add(getMonthKey(subMonths(month, i)))
      }
      
      // 뒤쪽 버퍼
      for (let i = 1; i <= SMART_LOADING_CONFIG.PRELOAD_BUFFER; i++) {
        allMonths.add(getMonthKey(addMonths(month, i)))
      }
    })

    return Array.from(allMonths).map(monthKey => {
      const [year, month] = monthKey.split('-')
      return new Date(parseInt(year), parseInt(month) - 1, 1)
    })
  }, [getMonthKey])

  // 단일 월 이벤트 로드 (재시도 로직 포함)
  const loadMonthEvents = useCallback(async (
    month: Date, 
    retryCount = 0
  ): Promise<CalendarEvent[]> => {
    if (!dynamicEvents) return []

    const monthKey = getMonthKey(month)
    
    // 캐시된 데이터가 있으면 반환
    const cached = eventCacheRef.current.get(monthKey)
    if (cached) {
      uiLogger.debug(`동적 이벤트 캐시 히트: ${monthKey}`, { count: cached.length })
      return cached
    }

    // 이미 로딩 중인 요청이 있으면 재사용
    const existingPromise = loadingPromisesRef.current.get(monthKey)
    if (existingPromise) {
      return existingPromise
    }

    const loadPromise = (async () => {
      try {
        // 월의 시작일과 종료일 계산
        const [year, month] = monthKey.split('-')
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
        const endDate = new Date(parseInt(year), parseInt(month), 0) // 다음 달 0일 = 이번 달 마지막 날
        
        uiLogger.info(`동적 이벤트 로드 시작: ${monthKey}`, {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          startDateObj: startDate,
          endDateObj: endDate
        })
        
        // API 호출 (startDate, endDate 전달)
        const apiData = await dynamicEvents!(startDate, endDate)
        
        // 데이터 변환 적용
        const events = transformApiData(apiData)
        
        // 이벤트에 월 정보 태그 추가 (디버깅용)
        const taggedEvents = events.map(event => ({
          ...event,
          _loadedFrom: monthKey
        }))

        // 캐시에 저장
        eventCacheRef.current.set(monthKey, taggedEvents)
        
        // 캐시 크기 관리
        if (eventCacheRef.current.size > SMART_LOADING_CONFIG.CACHE_SIZE) {
          const firstKey = eventCacheRef.current.keys().next().value
          if (firstKey) {
            eventCacheRef.current.delete(firstKey)
          }
        }

        uiLogger.info(`동적 이벤트 로드 완료: ${monthKey}`, { 
          count: taggedEvents.length,
          cacheSize: eventCacheRef.current.size 
        })

        // 콜백 호출
        if (onDynamicEventLoad) {
          onDynamicEventLoad(startDate, endDate, taggedEvents)
        }

        return taggedEvents
      } catch (error) {
        uiLogger.error(`동적 이벤트 로드 실패: ${monthKey}`, error)
        
        // 재시도 로직
        if (retryCount < SMART_LOADING_CONFIG.MAX_RETRIES) {
          uiLogger.info(`동적 이벤트 재시도: ${monthKey} (${retryCount + 1}/${SMART_LOADING_CONFIG.MAX_RETRIES})`)
          
          await new Promise(resolve => 
            setTimeout(resolve, SMART_LOADING_CONFIG.RETRY_DELAY * (retryCount + 1))
          )
          
          return loadMonthEvents(month, retryCount + 1)
        }

        throw error
      } finally {
        // 로딩 프로미스 정리
        loadingPromisesRef.current.delete(monthKey)
      }
    })()

    // 로딩 프로미스 등록
    loadingPromisesRef.current.set(monthKey, loadPromise)
    
    return loadPromise
  }, [dynamicEvents, getMonthKey])

  // 여러 월 이벤트 병렬 로드
  const loadEvents = useCallback(async (monthsToLoad: Date[]) => {
    if (!enableDynamicLoading || !dynamicEvents || !monthsToLoad.length) return

    const monthKeys = monthsToLoad.map(getMonthKey)
    const newMonthsToLoad = monthKeys.filter(key => 
      !state.loadedMonths.has(key) && 
      !state.loadingMonths.has(key)
    )

    if (!newMonthsToLoad.length) return

    uiLogger.info('동적 이벤트 배치 로드 시작', { 
      months: newMonthsToLoad,
      totalMonthsToLoad: newMonthsToLoad.length 
    })

    // 로딩 상태 업데이트
    setState(prev => ({
      ...prev,
      loadingMonths: new Set([...prev.loadingMonths, ...newMonthsToLoad])
    }))

    try {
      // 병렬로 이벤트 로드
      const loadPromises = monthsToLoad
        .filter(month => newMonthsToLoad.includes(getMonthKey(month)))
        .map(month => loadMonthEvents(month))

      const results = await Promise.all(
        loadPromises.map(promise => 
          promise.then(
            value => ({ status: 'fulfilled' as const, value }),
            reason => ({ status: 'rejected' as const, reason })
          )
        )
      )
      
      const allNewEvents: CalendarEvent[] = []
      const successfulMonths = new Set<string>()
      const errorMonths = new Map<string, string>()

      results.forEach((result: any, index: number) => {
        const monthKey = newMonthsToLoad[index]
        
        if (result.status === 'fulfilled') {
          allNewEvents.push(...result.value)
          successfulMonths.add(monthKey)
        } else {
          errorMonths.set(monthKey, result.reason?.message || 'Unknown error')
        }
      })

      // 상태 업데이트
      setState(prev => ({
        loadedEvents: [...prev.loadedEvents, ...allNewEvents],
        loadingMonths: new Set(Array.from(prev.loadingMonths).filter(key => !newMonthsToLoad.includes(key))),
        loadedMonths: new Set([...prev.loadedMonths, ...successfulMonths]),
        errorMonths: new Map([...prev.errorMonths, ...errorMonths])
      }))

      uiLogger.info('동적 이벤트 배치 로드 완료', {
        successfulMonths: Array.from(successfulMonths),
        errorMonths: Array.from(errorMonths.keys()),
        totalEventsLoaded: allNewEvents.length
      })

    } catch (error) {
      uiLogger.error('동적 이벤트 배치 로드 실패', error)
      
      // 로딩 상태 정리
      setState(prev => ({
        ...prev,
        loadingMonths: new Set(Array.from(prev.loadingMonths).filter(key => !newMonthsToLoad.includes(key)))
      }))
    }
  }, [enableDynamicLoading, dynamicEvents, state.loadedMonths, state.loadingMonths, getMonthKey, loadMonthEvents])

  // infiniteMonths 변경 시 필요한 월들 로드
  useEffect(() => {
    if (!enableDynamicLoading || !dynamicEvents) return

    const monthsToLoad = getMonthsToLoad(infiniteMonths)
    loadEvents(monthsToLoad)
  }, [infiniteMonths, enableDynamicLoading, dynamicEvents, getMonthsToLoad, loadEvents])

  // 데이트피커 점프 감지를 위한 이전 월 추적
  const prevInfiniteMonthsRef = useRef<Date[]>([])
  
  useEffect(() => {
    if (!enableDynamicLoading || !dynamicEvents || infiniteMonths.length === 0) return

    // 큰 날짜 점프 감지 (데이트피커 사용으로 추정)
    const prevMonths = prevInfiniteMonthsRef.current
    if (prevMonths.length > 0) {
      const currentCenter = infiniteMonths[Math.floor(infiniteMonths.length / 2)]
      const prevCenter = prevMonths[Math.floor(prevMonths.length / 2)]
      
      if (currentCenter && prevCenter) {
        const monthDiff = Math.abs(
          (currentCenter.getFullYear() - prevCenter.getFullYear()) * 12 + 
          (currentCenter.getMonth() - prevCenter.getMonth())
        )
        
        // 3개월 이상 점프하면 데이트피커로 간주하고 더 넓은 범위 로드
        if (monthDiff >= 3) {
          uiLogger.info(`데이트피커 점프 감지: ${monthDiff}개월 이동`, {
            from: `${prevCenter.getFullYear()}-${prevCenter.getMonth() + 1}`,
            to: `${currentCenter.getFullYear()}-${currentCenter.getMonth() + 1}`
          })
          
          // 더 넓은 범위 로드 (±3개월)
          const extendedMonths: Date[] = []
          for (let i = -3; i <= 3; i++) {
            extendedMonths.push(addMonths(currentCenter, i))
          }
          
          const extendedMonthsToLoad = getMonthsToLoad(extendedMonths)
          loadEvents(extendedMonthsToLoad)
        }
      }
    }
    
    prevInfiniteMonthsRef.current = [...infiniteMonths]
  }, [infiniteMonths, enableDynamicLoading, dynamicEvents, getMonthsToLoad, loadEvents])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      loadingPromisesRef.current.clear()
      // 캐시는 유지 (성능상 이점)
    }
  }, [])

  // infiniteMonths 업데이트 함수
  const updateInfiniteMonths = useCallback((newInfiniteMonths: Date[]) => {
    setInfiniteMonths(newInfiniteMonths)
  }, [])

  return {
    dynamicEvents: state.loadedEvents,
    loadingMonths: Array.from(state.loadingMonths),
    loadedMonths: Array.from(state.loadedMonths),
    errorMonths: Object.fromEntries(state.errorMonths),
    isLoading: state.loadingMonths.size > 0,
    updateInfiniteMonths,
    // 캐시 상태 (디버깅용)
    cacheInfo: {
      cacheSize: eventCacheRef.current.size,
      cachedMonths: Array.from(eventCacheRef.current.keys())
    }
  }
}