import { memo, useMemo, useCallback } from 'react'
import { format } from 'date-fns'
import { cn } from '@/utils/cn'
import { getDateFnsLocale, getTodayButtonText, isKoreanLocale } from '@/utils/localeUtils'
import type { LocaleCode, HeaderDisplayOptions, ClassNameOptions } from '@/types'

interface CalendarHeaderProps {
  // 날짜 및 로케일
  activeMonth: Date
  locale: LocaleCode | string
  
  // 표시 옵션
  headerOptions: HeaderDisplayOptions
  
  // 스타일 옵션
  classNames?: ClassNameOptions
  isCurrentMonthVisible: boolean
  
  // 이벤트 핸들러
  onTodayClick: () => void
  onDatePickerClick?: () => void
}

const CalendarHeader = memo(function CalendarHeader({
  activeMonth,
  locale,
  headerOptions,
  classNames,
  isCurrentMonthVisible,
  onTodayClick,
  onDatePickerClick
}: CalendarHeaderProps) {
  // 로케일 처리
  const currentLocale = getDateFnsLocale(locale)
  const todayButtonText = getTodayButtonText(locale)
  
  // 날짜 포맷 함수 (메모이제이션)
  const formatMonthYear = useCallback((date: Date) => {
    if (isKoreanLocale(locale)) {
      return format(date, 'yyyy년 MM월')
    }
    return format(date, 'MMMM yyyy', { locale: currentLocale })
  }, [locale, currentLocale])
  
  // 클래스네임들 (메모이제이션)
  const headerClassName = useMemo(() => cn(
    "flex-shrink-0",
    classNames?.header
  ), [classNames?.header])
  
  const monthTitleClassName = useMemo(() => cn(
    "text-lg font-semibold transition-all duration-300 cursor-pointer hover:text-blue-600",
    !isCurrentMonthVisible && "text-orange-600",
    classNames?.monthTitle
  ), [isCurrentMonthVisible, classNames?.monthTitle])
  
  const todayButtonClassName = useMemo(() => cn(
    "text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1 touch-manipulation px-2 py-1",
    classNames?.todayButton
  ), [classNames?.todayButton])

  if (!headerOptions.show) {
    return null
  }

  return (
    <div className={headerClassName}>
      <div className="flex items-center justify-between">
        {/* 월 타이틀 */}
        {headerOptions.monthTitle && (
          <h2 
            className={monthTitleClassName}
            onClick={headerOptions.datePicker ? onDatePickerClick : undefined}
          >
            {formatMonthYear(activeMonth)}
          </h2>
        )}
        
        {/* 빈 공간 (타이틀이 없을 때) */}
        {!headerOptions.monthTitle && <div />}
        
        {/* 오늘 버튼 */}
        {headerOptions.todayButton && (
          <button
            onClick={onTodayClick}
            className={todayButtonClassName}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            🎯{todayButtonText}
          </button>
        )}
      </div>
    </div>
  )
})

CalendarHeader.displayName = 'CalendarHeader'

export { CalendarHeader }