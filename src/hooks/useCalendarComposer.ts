import { useMemo, useEffect, useCallback, useReducer } from 'react'
import { format, startOfMonth, endOfMonth, getDay, isSameMonth } from 'date-fns'
import { HolidayService } from '@/services/holidayService'
import { generateEventId, generateHolidayId } from '@/utils/idGenerator'
import { LOCALE_CONSTANTS } from '@/constants/calendar'
import { logger, initializeLogger } from '@/utils/logger'
import { calendarReducer, createInitialState } from './useCalendarReducer'
import type { Holiday, LocaleCode, CalendarEvent, DetailedCalendarEvent } from '@/types'

// 디버그 로그 활성화
initializeLogger(true)

// 월 데이터 인터페이스
export interface MonthData {
  month: Date
  weeks: (Date | null)[][]
  eventsByDate: Record<string, CalendarEvent[]>
  holidaysByDate: Record<string, Holiday[]>
}

interface UseCalendarComposerProps {
  events: CalendarEvent[]
  holidays?: Holiday[]
  locale?: LocaleCode | string  // 로케일
  holidayServiceKey?: string    // 공휴일 API 서비스 키
}

// 이벤트 타입 체크 함수 (기존 호환성 유지)
const isDetailedEvent = (event: CalendarEvent): event is DetailedCalendarEvent => {
  return 'startTime' in event && 'endTime' in event
}

// 이벤트를 날짜별로 그룹핑하는 함수
const getEventDate = (event: CalendarEvent): string => {
  if (isDetailedEvent(event)) {
    const startDate = new Date(event.startTime)
    return format(startDate, 'yyyy-MM-dd')
  } else {
    return event.date
  }
}

// 이벤트에 ID가 없으면 자동 생성
const ensureEventId = (event: CalendarEvent, index: number): CalendarEvent => {
  if (event.id) return event
  
  const dateStr = getEventDate(event)
  const title = isDetailedEvent(event) ? event.title : (event.title || 'event')
  
  return {
    ...event,
    id: generateEventId(dateStr, title, index)
  }
}

export function useCalendarComposer({ 
  events = [], 
  holidays = [],
  locale = 'ko-KR',
  holidayServiceKey
}: UseCalendarComposerProps) {
  
  // useReducer로 모든 상태 통합 관리
  const [state, dispatch] = useReducer(calendarReducer, undefined, createInitialState)

  // 액션 생성 함수들 (useCallback으로 메모이제이션)
  const setAutoHolidays = useCallback((holidays: Holiday[]) => {
    dispatch({ type: 'SET_AUTO_HOLIDAYS', payload: holidays })
  }, [])

  const setHolidayLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_HOLIDAY_LOADING', payload: loading })
  }, [])

  const setDisplayMonth = useCallback((date: Date) => {
    dispatch({ type: 'SET_DISPLAY_MONTH', payload: date })
  }, [])

  const setActiveMonth = useCallback((date: Date) => {
    dispatch({ type: 'SET_ACTIVE_MONTH', payload: date })
  }, [])

  const setInfiniteMonths = useCallback((months: Date[]) => {
    dispatch({ type: 'SET_INFINITE_MONTHS', payload: months })
  }, [])

  const setAvailableHeight = useCallback((height: number | null) => {
    dispatch({ type: 'SET_AVAILABLE_HEIGHT', payload: height })
  }, [])

  const setIsCurrentMonthVisible = useCallback((visible: boolean) => {
    dispatch({ type: 'SET_CURRENT_MONTH_VISIBLE', payload: visible })
  }, [])

  const setIsInitialScrollSet = useCallback((value: boolean) => {
    dispatch({ type: 'SET_INITIAL_SCROLL', payload: value })
  }, [])

  const setSelectedYear = useCallback((year: number) => {
    dispatch({ type: 'SET_SELECTED_YEAR', payload: year })
  }, [])

  const setSelectedMonth = useCallback((month: number) => {
    dispatch({ type: 'SET_SELECTED_MONTH', payload: month })
  }, [])

  const setShowYearDropdown = useCallback(() => {
    dispatch({ type: 'TOGGLE_YEAR_DROPDOWN' })
  }, [])

  const setShowMonthDropdown = useCallback(() => {
    dispatch({ type: 'TOGGLE_MONTH_DROPDOWN' })
  }, [])

  const addPrevInfiniteMonth = useCallback(() => {
    dispatch({ type: 'ADD_PREV_MONTH' })
  }, [])

  const addNextInfiniteMonth = useCallback(() => {
    dispatch({ type: 'ADD_NEXT_MONTH' })
  }, [])

  const openDateSelector = useCallback(() => {
    dispatch({ type: 'OPEN_DATE_SELECTOR' })
  }, [])

  const closeDateSelector = useCallback(() => {
    dispatch({ type: 'CLOSE_DATE_SELECTOR' })
  }, [])

  const confirmDateSelection = useCallback(() => {
    dispatch({ type: 'CONFIRM_DATE_SELECTION' })
  }, [])

  // 한국 로케일인지 확인
  const enableAutoHolidays = LOCALE_CONSTANTS.KOREAN_LOCALES.includes(locale as any)
  
  // 상태에서 필요한 값들 추출
  const {
    autoHolidays,
    holidayLoading,
    displayMonth,
    activeMonth,
    infiniteMonths,
    availableHeight,
    isCurrentMonthVisible,
    isInitialScrollSet,
    showDateSelector,
    selectedYear,
    selectedMonth,
    showYearDropdown,
    showMonthDropdown
  } = state


  // 로케일 또는 서비스 키 변경 시 인스턴스 업데이트 (메모이제이션)
  const holidayServiceInstanceMemo = useMemo(() => {
    return new HolidayService(holidayServiceKey, locale)
  }, [holidayServiceKey, locale])
  

  // 자동 공휴일 데이터 로딩 (최적화된 버전)
  useEffect(() => {
    if (!enableAutoHolidays) return

    let isCancelled = false
    
    const loadHolidays = async () => {
      setHolidayLoading(true)
      try {
        // 연도별로 그룹화하여 중복 API 호출 방지
        const yearGroups = new Map<number, Date[]>()
        state.infiniteMonths.forEach(month => {
          const year = month.getFullYear()
          if (!yearGroups.has(year)) {
            yearGroups.set(year, [])
          }
          yearGroups.get(year)!.push(month)
        })
        
        // 연도별로 데이터 로드
        const yearPromises = Array.from(yearGroups.keys()).map(async year => {
          // 해당 연도에서 실제로 표시되는 월들만 조회
          const monthsInYear = yearGroups.get(year) || []
          const uniqueMonths = Array.from(new Set(monthsInYear.map(date => date.getMonth() + 1)))
          const monthPromises = uniqueMonths.map(month => 
            holidayServiceInstanceMemo.getHolidays(year, month)
          )
          const monthResults = await Promise.all(monthPromises)
          return monthResults.flat()
        })
        
        const results = await Promise.all(yearPromises)
        
        if (isCancelled) return
        
        const allHolidays = results.flat()
        logger.info('공휴일 데이터 로드 완료', { 
          totalHolidays: allHolidays.length,
          years: Array.from(yearGroups.keys()),
          holidays: allHolidays.map(h => ({ name: h.name, date: h.date }))
        })
        setAutoHolidays(allHolidays)
      } catch (error) {
        if (!isCancelled) {
          logger.error('공휴일 데이터 로드 실패:', error)
          setAutoHolidays([])
        }
      } finally {
        if (!isCancelled) {
          setHolidayLoading(false)
        }
      }
    }

    loadHolidays()
    
    return () => {
      isCancelled = true
    }
  }, [state.infiniteMonths, enableAutoHolidays, holidayServiceInstanceMemo, setHolidayLoading, setAutoHolidays])

  // 이벤트 ID 추가 (메모이제이션)
  const eventsWithIds = useMemo(() => {
    return events.map((event, index) => ensureEventId(event, index))
  }, [events])
  
  // 최종 공휴일 데이터 (수동 + 자동) (메모이제이션)
  const finalHolidays = useMemo(() => {
    const allHolidays = enableAutoHolidays ? [...holidays, ...state.autoHolidays] : holidays
    
    // id가 없는 공휴일에 자동 생성
    return allHolidays.map(holiday => ({
      ...holiday,
      id: holiday.id || generateHolidayId(holiday.date, holiday.name)
    }))
  }, [holidays, state.autoHolidays, enableAutoHolidays])

  // 월별 캘린더 데이터 생성
  const monthsData = useMemo(() => {
    const result = state.infiniteMonths.map(month => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)
      
      // 캘린더 그리드 생성 (주 단위)
      const weeks: (Date | null)[][] = []
      const firstDayOfWeek = getDay(monthStart) // 0: 일요일, 1: 월요일, ...
      
      let currentDate = new Date(monthStart)
      currentDate.setDate(currentDate.getDate() - firstDayOfWeek)
      
      while (currentDate <= monthEnd || getDay(currentDate) !== 0) {
        const week: (Date | null)[] = []
        
        for (let i = 0; i < 7; i++) {
          if (isSameMonth(currentDate, month)) {
            week.push(new Date(currentDate))
          } else {
            week.push(null) // 다른 월의 날짜는 표시하지 않음
          }
          currentDate.setDate(currentDate.getDate() + 1)
        }
        
        weeks.push(week)
        
        if (currentDate > monthEnd && getDay(currentDate) === 0) break
      }
      
      // 날짜별 이벤트 데이터 그룹핑
      const eventsByDate: Record<string, CalendarEvent[]> = {}
      
      eventsWithIds.forEach(event => {
        const dateKey = getEventDate(event)
        
        if (!eventsByDate[dateKey]) {
          eventsByDate[dateKey] = []
        }
        eventsByDate[dateKey].push(event)
      })
      
      // 날짜별 공휴일 데이터 그룹핑
      const holidaysByDate: Record<string, Holiday[]> = {}
      finalHolidays.forEach(holiday => {
        const dateKey = format(new Date(holiday.date), 'yyyy-MM-dd')
        
        if (!holidaysByDate[dateKey]) {
          holidaysByDate[dateKey] = []
        }
        holidaysByDate[dateKey].push(holiday)
      })
      
      
      return {
        month,
        weeks,
        eventsByDate,
        holidaysByDate
      }
    })
    
    return result
  }, [state.infiniteMonths, eventsWithIds, finalHolidays])

  // 이전 월 추가 (메모이제이션)
  const addPrevMonth = useCallback(() => {
    addPrevInfiniteMonth()
  }, [addPrevInfiniteMonth])

  // 다음 월 추가 (멤모이제이션)
  const addNextMonth = useCallback(() => {
    addNextInfiniteMonth()
  }, [addNextInfiniteMonth])

  return {
    // UI 상태
    displayMonth,
    activeMonth,
    infiniteMonths,
    monthsData,
    availableHeight,
    isCurrentMonthVisible,
    isInitialScrollSet,
    showDateSelector,
    selectedYear,
    selectedMonth,
    showYearDropdown,
    showMonthDropdown,
    
    // UI 액션
    setActiveMonth,
    setDisplayMonth,
    setInfiniteMonths,
    setAvailableHeight,
    setIsCurrentMonthVisible,
    setIsInitialScrollSet,
    openDateSelector,
    closeDateSelector,
    setShowYearDropdown,
    setShowMonthDropdown,
    setSelectedYear,
    setSelectedMonth,
    confirmDateSelection,
    
    // 데이터 액션
    addPrevMonth,
    addNextMonth,
    
    // 공휴일 관련
    holidayLoading,
    autoHolidays
  }
}