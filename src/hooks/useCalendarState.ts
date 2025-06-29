/**
 * 캘린더 상태 관리 훅
 * 모든 비즈니스 로직과 상태 관리를 담당
 */

import { useMemo, useCallback, useEffect } from 'react'
import { subMonths, addMonths } from 'date-fns'
import { useCalendarComposer } from './useCalendarComposer'
import { useDynamicEvents } from './useDynamicEvents'
import type { CalendarEvent, Holiday, LocaleCode, CalendarOptions } from '@/types'

interface UseCalendarStateProps {
  // 데이터
  events?: CalendarEvent[]
  holidays?: Holiday[]
  
  // 동적 이벤트
  dynamicEvents?: (startDate: string | Date, endDate: string | Date) => Promise<any[]>
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
  
  // 설정
  locale?: LocaleCode | string
  holidayServiceKey?: string
  options?: CalendarOptions
}

export function useCalendarState({
  events = [],
  holidays = [],
  dynamicEvents,
  dynamicEventMapping,
  dynamicEventTransform,
  onDynamicEventLoad,
  locale = 'ko-KR',
  holidayServiceKey,
  options = {}
}: UseCalendarStateProps) {
  
  // 로거 초기화 (한 번만)
  const isDebugEnabled = useMemo(() => !!options.debug, [options.debug])
  
  // 동적 이벤트 로딩 - infiniteMonths는 나중에 전달
  const {
    dynamicEvents: loadedDynamicEvents,
    loadingMonths,
    isLoading: isDynamicLoading,
    cacheInfo,
    updateInfiniteMonths
  } = useDynamicEvents({
    dynamicEvents,
    infiniteMonths: [], // 초기값
    enableDynamicLoading: !!dynamicEvents,
    dynamicEventMapping,
    dynamicEventTransform,
    onDynamicEventLoad
  })

  // 이벤트 병합
  const mergedEvents = useMemo(() => {
    const staticEvents = events || []
    const dynamicEventsArray = loadedDynamicEvents || []
    
    return [...staticEvents, ...dynamicEventsArray]
  }, [events, loadedDynamicEvents])

  // 캘린더 컴포저 (병합된 이벤트 사용)
  const calendarState = useCalendarComposer({ 
    events: mergedEvents,
    holidays,
    locale,
    holidayServiceKey
  })

  // infiniteMonths가 변경될 때마다 동적 이벤트 훅에 전달
  useEffect(() => {
    if (updateInfiniteMonths && calendarState.infiniteMonths) {
      updateInfiniteMonths(calendarState.infiniteMonths)
    }
  }, [calendarState.infiniteMonths, updateInfiniteMonths])

  // 오늘 버튼 핸들러
  const handleTodayClick = useCallback(() => {
    const today = new Date()
    
    calendarState.setActiveMonth(today)
    calendarState.setDisplayMonth(today)
    calendarState.setIsInitialScrollSet(false)
    
    // 무한 월 리스트 초기화
    const prevMonth = subMonths(today, 1)
    const nextMonth = addMonths(today, 1)
    
    calendarState.setInfiniteMonths([prevMonth, today, nextMonth])
  }, [calendarState])

  return {
    // 상태
    ...calendarState,
    
    // 동적 이벤트 관련
    isDynamicLoading,
    loadingMonths,
    cacheInfo,
    
    // 액션
    handleTodayClick,
    
    // 디버그
    isDebugEnabled
  }
}