import { memo, useMemo, useCallback } from 'react'
import { format, isSameMonth, isToday, getDay, isBefore, startOfDay } from 'date-fns'
import { cn } from '@/utils/cn'
import { COLOR_CONSTANTS, UI_CONSTANTS } from '@/constants/calendar'
import type { CalendarEvent, Holiday, ClassNameOptions } from '@/types'

interface DayCellProps {
  // 날짜 관련
  day: Date | null
  activeMonth: Date
  
  // 데이터
  dayEvents: CalendarEvent[]
  dayHolidays: Holiday[]
  
  // 스타일
  classNames?: ClassNameOptions
  
  // 이벤트 핸들러
  onDayClick?: (date: Date, dayInfo?: { events: CalendarEvent[], holidays: Holiday[] }) => void
}

const DayCell = memo(function DayCell({
  day,
  activeMonth,
  dayEvents,
  dayHolidays,
  classNames,
  onDayClick
}: DayCellProps) {
  if (!day) {
    return (
      <div
        className="relative p-2"
        style={{ minHeight: `${UI_CONSTANTS.DAY_CELL_HEIGHT}px` }}
      />
    )
  }

  // 날짜 상태 계산 (메모이제이션)
  const dayState = useMemo(() => {
    const isCurrentMonth = isSameMonth(day, activeMonth)
    // 과거 날짜이면서 이벤트가 없는 경우만 비활성화
    const isPastDate = isBefore(day, startOfDay(new Date()))
    const hasEvents = dayEvents.length > 0
    const isDisabled = isPastDate && !hasEvents
    const dayOfWeek = getDay(day)
    const isHoliday = dayHolidays.length > 0
    const holidayColor = dayHolidays.length > 0 ? 
      (dayHolidays[0].color || COLOR_CONSTANTS.DEFAULT_HOLIDAY_COLOR) : null

    return {
      isCurrentMonth,
      isDisabled,
      dayOfWeek,
      isHoliday,
      holidayColor
    }
  }, [day, activeMonth, dayHolidays, dayEvents])

  // 색상 클래스 계산 (메모이제이션)
  const textColorData = useMemo(() => {
    const { isHoliday, holidayColor, dayOfWeek } = dayState
    
    let textColorClass = null
    
    if (isHoliday && holidayColor) {
      switch (holidayColor) {
        case COLOR_CONSTANTS.HOLIDAY_COLORS.RED:
          textColorClass = "text-red-500"
          break
        case COLOR_CONSTANTS.HOLIDAY_COLORS.GREEN:
          textColorClass = "text-green-500"
          break
        case COLOR_CONSTANTS.HOLIDAY_COLORS.PURPLE:
          textColorClass = "text-purple-500"
          break
        case COLOR_CONSTANTS.HOLIDAY_COLORS.ORANGE:
          textColorClass = "text-orange-500"
          break
        case COLOR_CONSTANTS.HOLIDAY_COLORS.PINK:
          textColorClass = "text-pink-500"
          break
        case COLOR_CONSTANTS.HOLIDAY_COLORS.YELLOW:
          textColorClass = "text-yellow-500"
          break
        default:
          textColorClass = null // hex 색상은 스타일로 처리
      }
    } else {
      // 공휴일이 아닌 경우 요일별 색상
      if (dayOfWeek === 0) textColorClass = "text-red-500"    // 일요일
      else if (dayOfWeek === 6) textColorClass = "text-blue-500"   // 토요일
    }
    
    const isCustomHexColor = isHoliday && holidayColor?.startsWith('#')
    
    return { textColorClass, isCustomHexColor }
  }, [dayState])

  // 셀 클래스명 계산 (메모이제이션)
  const cellClassName = useMemo(() => cn(
    "relative p-2 cursor-pointer",
    "transition-colors",
    "flex flex-col items-center justify-between",
    !dayState.isCurrentMonth && "opacity-40 cursor-not-allowed",
    dayState.isDisabled && "cursor-not-allowed",
    classNames?.dayCell
  ), [dayState.isCurrentMonth, dayState.isDisabled, classNames?.dayCell])

  // 날짜 텍스트 클래스명 계산 (메모이제이션)
  const dateTextClassName = useMemo(() => cn(
    "inline-block",
    dayEvents.length > 0 
      ? "text-base font-bold" 
      : "text-sm font-medium",
    isToday(day) && "animate-bounce",
    textColorData.textColorClass
  ), [dayEvents.length, day, textColorData.textColorClass])

  // 클릭 핸들러 (메모이제이션)
  const handleClick = useCallback(() => {
    if (!dayState.isDisabled && dayState.isCurrentMonth && onDayClick) {
      onDayClick(day, { events: dayEvents, holidays: dayHolidays })
    }
  }, [dayState.isDisabled, dayState.isCurrentMonth, onDayClick, day, dayEvents, dayHolidays])

  return (
    <div
      onClick={handleClick}
      className={cellClassName}
      style={{ 
        minHeight: `${UI_CONSTANTS.DAY_CELL_HEIGHT}px`,
      }}
    >
      {/* 날짜 영역 */}
      <div className="flex-1 flex flex-col items-center justify-start pt-2">
        <div className="text-center min-h-[20px]">
          <span 
            className={dateTextClassName}
            {...(textColorData.isCustomHexColor && dayState.holidayColor && {
              style: { color: dayState.holidayColor }
            })}
          >
            {format(day, 'd')}
          </span>
        </div>
      </div>
      
      {/* 이벤트 도트 영역 (항상 동일한 위치) */}
      <div className="h-2 flex items-center justify-center">
        {dayEvents.length > 0 && (
          <span className="text-[4px]">🔴</span>
        )}
      </div>
    </div>
  )
})

DayCell.displayName = 'DayCell'

export { DayCell }