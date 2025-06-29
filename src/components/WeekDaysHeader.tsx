import { memo, useMemo } from 'react'
import { cn } from '@/utils/cn'
import { getWeekDays } from '@/utils/localeUtils'
import type { LocaleCode, ClassNameOptions } from '@/types'

interface WeekDaysHeaderProps {
  locale: LocaleCode | string
  classNames?: ClassNameOptions
  show: boolean
}

const WeekDaysHeader = memo(function WeekDaysHeader({
  locale,
  classNames,
  show
}: WeekDaysHeaderProps) {
  // 요일 데이터 (메모이제이션)
  const weekDays = useMemo(() => getWeekDays(locale), [locale])
  
  // 요일 클래스네임 (메모이제이션)
  const weekDayClassName = useMemo(() => {
    return (index: number) => cn(
      "py-2 text-center text-sm font-bold border-b border-gray-200",
      index === 0 && "text-red-500",    // 일요일
      index === 6 && "text-blue-500",   // 토요일
      classNames?.weekDay
    )
  }, [classNames?.weekDay])

  if (!show) {
    return null
  }

  return (
    <div className="grid grid-cols-7 mt-3">
      {weekDays.map((day, index) => (
        <div
          key={day}
          className={weekDayClassName(index)}
        >
          {day}
        </div>
      ))}
    </div>
  )
})

WeekDaysHeader.displayName = 'WeekDaysHeader'

export { WeekDaysHeader }