/**
 * 리팩토링된 InfiniteCalendar 컴포넌트
 * - 비즈니스 로직과 UI 완전 분리
 * - 복잡한 로직을 커스텀 훅으로 추출
 * - 단일 책임 원칙 적용
 * - 성능 최적화 및 메모리 리크 방지
 */

import { memo, useRef, useMemo, useEffect } from 'react'
import { cn } from '@/utils/cn'
import { CalendarHeader } from './CalendarHeader'
import { DateSelector } from './DateSelector'
import { WeekDaysHeader } from './WeekDaysHeader'
import { MonthRow } from './MonthRow'
import { useCalendarState } from '@/hooks/useCalendarState'
import { useDateSelectorLogic } from '@/hooks/useDateSelectorLogic'
import { useHeaderOptions } from '@/hooks/useHeaderOptions'
import { useScrollManagement } from '@/hooks/useScrollManagement'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { useAutoHeight } from '@/hooks/useAutoHeight'
import { useInitialScroll } from '@/hooks/useInitialScroll'
import { useMultiRef } from '@/hooks/useMultiRef'
import { injectRequiredStyles } from '@/utils/styleInjector'
import { initializeLogger } from '@/utils/logger'
import type { CalendarEvent, Holiday, LocaleCode, CalendarOptions } from '@/types'

// 컴포넌트 props 인터페이스
interface InfiniteCalendarProps {
  // === 데이터 ===
  events?: CalendarEvent[]
  holidays?: Holiday[]
  
  // === 동적 이벤트 로딩 ===
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
  
  // === 이벤트 핸들러 ===
  onDayAction?: (date: Date, dayInfo?: { events: CalendarEvent[], holidays: Holiday[] }) => void
  onEventClick?: (event: CalendarEvent) => void
  
  // === 지역화 ===
  locale?: LocaleCode | string
  holidayServiceKey?: string
  
  // === UI/스타일 옵션 ===
  options?: CalendarOptions
  
  // === 레거시 지원 (deprecated) ===
  showTodayButton?: boolean
  showDatePicker?: boolean
  height?: number | 'auto'
  initialDate?: Date
}

/**
 * 무한 스크롤 캘린더 컴포넌트
 * 
 * @example
 * ```tsx
 * <InfiniteCalendar
 *   events={events}
 *   dynamicEvents={async (startDate, endDate) => await fetchEvents(startDate, endDate)}
 *   onDayAction={(date, dayInfo) => handleDayClick(date, dayInfo)}
 *   options={{
 *     debug: true,
 *     height: 'auto',
 *     autoHeight: { bottomOffset: 20 }
 *   }}
 * />
 * ```
 */
const InfiniteCalendar = memo(function InfiniteCalendar({ 
  // 데이터
  events,
  holidays,
  
  // 동적 이벤트
  dynamicEvents,
  dynamicEventMapping,
  dynamicEventTransform,
  onDynamicEventLoad,
  
  // 이벤트 핸들러
  onDayAction,
  onEventClick: _onEventClick, // 현재 미사용이지만 API 호환성을 위해 유지
  
  // 지역화
  locale = 'ko-KR',
  holidayServiceKey,
  
  // UI 옵션
  options = {},
  
  // 레거시 props
  showTodayButton,
  showDatePicker,
  height,
  initialDate
}: InfiniteCalendarProps) {

  // === 스타일 주입 (한 번만) ===
  useEffect(() => {
    injectRequiredStyles()
  }, [])

  // === 헤더 옵션 처리 ===
  const { mergedOptions, headerOptions } = useHeaderOptions({
    options,
    showTodayButton,
    showDatePicker,
    height,
    initialDate
  })

  // === 로거 초기화 (한 번만) ===
  useEffect(() => {
    initializeLogger(mergedOptions.debug)
  }, [mergedOptions.debug])

  // === 캘린더 상태 관리 ===
  const calendarState = useCalendarState({
    events,
    holidays,
    dynamicEvents,
    dynamicEventMapping,
    dynamicEventTransform,
    onDynamicEventLoad,
    locale,
    holidayServiceKey,
    options: mergedOptions
  })

  // === 날짜 선택기 로직 ===
  const dateSelectorLogic = useDateSelectorLogic({
    selectedYear: calendarState.selectedYear,
    selectedMonth: calendarState.selectedMonth,
    showYearDropdown: calendarState.showYearDropdown,
    showMonthDropdown: calendarState.showMonthDropdown,
    setSelectedYear: calendarState.setSelectedYear,
    setSelectedMonth: calendarState.setSelectedMonth,
    setShowYearDropdown: calendarState.setShowYearDropdown,
    setShowMonthDropdown: calendarState.setShowMonthDropdown,
    confirmDateSelection: calendarState.confirmDateSelection,
    isDebugEnabled: calendarState.isDebugEnabled
  })

  // === Refs ===
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollContainerRef, calendarRef, setScrollRefs] = useMultiRef<HTMLDivElement>()

  // === 자동 높이 계산 ===
  useAutoHeight({
    containerRef,
    height: mergedOptions.height,
    autoHeight: mergedOptions.autoHeight,
    onHeightChange: calendarState.setAvailableHeight
  })

  // === 스크롤 관리 ===
  useScrollManagement({
    scrollContainerRef,
    onScrollToTop: calendarState.addPrevMonth,
    onScrollToBottom: calendarState.addNextMonth
  })

  // === IntersectionObserver ===
  useIntersectionObserver({
    calendarRef,
    monthsData: calendarState.monthsData,
    activeMonth: calendarState.activeMonth,
    onActiveMonthChange: calendarState.setActiveMonth,
    onCurrentMonthVisibilityChange: calendarState.setIsCurrentMonthVisible
  })

  // === 초기 스크롤 설정 ===
  useInitialScroll({
    calendarRef,
    monthsData: calendarState.monthsData,
    availableHeight: calendarState.availableHeight,
    isInitialScrollSet: calendarState.isInitialScrollSet,
    onInitialScrollSet: calendarState.setIsInitialScrollSet
  })

  // === 컨테이너 스타일 (메모이제이션) ===
  const containerClassName = useMemo(() => cn(
    "flex flex-col bg-white infinite-calendar-container",
    mergedOptions.classNames?.container
  ), [mergedOptions.classNames?.container])

  const containerStyle = useMemo(() => {
    const { height: optionHeight, autoHeight } = mergedOptions
    const { availableHeight } = calendarState
    
    if (typeof optionHeight === 'number') {
      return { height: `${optionHeight}px` }
    }
    
    if (optionHeight === 'auto' || autoHeight) {
      return { height: availableHeight ? `${availableHeight}px` : '100%' }
    }
    
    return { height: optionHeight }
  }, [mergedOptions.height, mergedOptions.autoHeight, calendarState.availableHeight])

  return (
    <div 
      ref={containerRef}
      className={containerClassName}
      style={containerStyle}
    >
      {/* 헤더 영역 */}
      <CalendarHeader
        activeMonth={calendarState.activeMonth}
        locale={locale}
        headerOptions={headerOptions}
        classNames={mergedOptions.classNames}
        isCurrentMonthVisible={calendarState.isCurrentMonthVisible}
        onTodayClick={calendarState.handleTodayClick}
        onDatePickerClick={headerOptions.datePicker ? calendarState.openDateSelector : undefined}
      />

      {/* 날짜 선택 셀렉트 박스 */}
      {headerOptions.datePicker && (
        <DateSelector
          show={calendarState.showDateSelector}
          selectedYear={calendarState.selectedYear}
          selectedMonth={calendarState.selectedMonth}
          showYearDropdown={calendarState.showYearDropdown}
          showMonthDropdown={calendarState.showMonthDropdown}
          locale={locale}
          onClose={calendarState.closeDateSelector}
          onConfirm={dateSelectorLogic.handleConfirmDateSelection}
          onYearSelect={dateSelectorLogic.handleYearSelect}
          onMonthSelect={dateSelectorLogic.handleMonthSelect}
          onToggleYearDropdown={dateSelectorLogic.handleToggleYearDropdown}
          onToggleMonthDropdown={dateSelectorLogic.handleToggleMonthDropdown}
        />
      )}

      {/* 요일 헤더 */}
      <WeekDaysHeader
        locale={locale}
        classNames={mergedOptions.classNames}
        show={!!(headerOptions.show && headerOptions.weekDays)}
      />
      
      {/* 캘린더 영역 - 세로 스크롤, 남은 높이 차지 */}
      <div 
        className="flex-1 overflow-y-auto min-h-0 scrollbar-hide" 
        ref={setScrollRefs}
      >
        <div>
          {calendarState.monthsData.map((monthData, monthIndex) => (
            <MonthRow
              key={monthData.month.toISOString()}
              monthData={monthData}
              monthIndex={monthIndex}
              activeMonth={calendarState.activeMonth}
              classNames={mergedOptions.classNames}
              onDayClick={onDayAction}
            />
          ))}
        </div>
      </div>
    </div>
  )
})

InfiniteCalendar.displayName = 'InfiniteCalendar'

export { InfiniteCalendar }