import { memo, useMemo } from 'react'
import { format, isSameMonth } from 'date-fns'
import { cn } from '@/utils/cn'
import { DayCell } from './DayCell'
import type { MonthData } from '@/hooks/useCalendarComposer'
import type { CalendarEvent, Holiday, ClassNameOptions } from '@/types'

interface MonthRowProps {
  monthData: MonthData
  monthIndex: number
  activeMonth: Date
  classNames?: ClassNameOptions
  onDayClick?: (date: Date, dayInfo?: { events: CalendarEvent[], holidays: Holiday[] }) => void
}

const MonthRow = memo(function MonthRow({
  monthData,
  monthIndex,
  activeMonth,
  classNames,
  onDayClick
}: MonthRowProps) {
  // 월별 클래스네임 계산 (메모이제이션)
  const monthClassName = useMemo(() => cn(
    "transition-all duration-300",
    !activeMonth || !monthData.month || 
    !isSameMonth(monthData.month, activeMonth) && "opacity-50 grayscale-[0.5]"
  ), [activeMonth, monthData.month])

  return (
    <div 
      key={monthData.month.toISOString()}
      data-month-index={monthIndex}
      className={monthClassName}
    >
      {monthData.weeks.map((week, weekIndex) => (
        <div 
          key={`${monthData.month.toISOString()}-week-${weekIndex}`} 
          className="grid grid-cols-7"
        >
          {week.map((day, dayIndex) => {
            // 날짜별 데이터 계산 (직접 계산)
            const dateKey = day ? format(day, 'yyyy-MM-dd') : ''
            const dayEvents = dateKey ? (monthData.eventsByDate[dateKey] || []) : []
            const dayHolidays = dateKey ? (monthData.holidaysByDate[dateKey] || []) : []
            
            return (
              <DayCell
                key={day ? day.toISOString() : `empty-${weekIndex}-${dayIndex}`}
                day={day}
                activeMonth={activeMonth}
                dayEvents={dayEvents}
                dayHolidays={dayHolidays}
                classNames={classNames}
                onDayClick={onDayClick}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
})

MonthRow.displayName = 'MonthRow'

export { MonthRow }