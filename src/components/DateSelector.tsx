import { memo, useMemo } from 'react'
import { format } from 'date-fns'
import { cn } from '@/utils/cn'
import { getDateFnsLocale, getCommonText, getYearSuffix, getMonthSuffix, isKoreanLocale } from '@/utils/localeUtils'
import { createYearRange } from '@/constants/calendar'
import type { LocaleCode } from '@/types'

interface DateSelectorProps {
  // 표시 상태
  show: boolean
  
  // 현재 선택된 값들
  selectedYear: number
  selectedMonth: number
  
  // 드롭다운 상태
  showYearDropdown: boolean
  showMonthDropdown: boolean
  
  // 로케일
  locale: LocaleCode | string
  
  // 이벤트 핸들러
  onClose: () => void
  onConfirm: () => void
  onYearSelect: (year: number) => void
  onMonthSelect: (month: number) => void
  onToggleYearDropdown: () => void
  onToggleMonthDropdown: () => void
}

const DateSelector = memo(function DateSelector({
  show,
  selectedYear,
  selectedMonth,
  showYearDropdown,
  showMonthDropdown,
  locale,
  onClose,
  onConfirm,
  onYearSelect,
  onMonthSelect,
  onToggleYearDropdown,
  onToggleMonthDropdown
}: DateSelectorProps) {
  const currentLocale = getDateFnsLocale(locale)
  const yearSuffix = getYearSuffix(locale)
  const monthSuffix = getMonthSuffix(locale)
  const cancelText = getCommonText('cancel', locale)
  const confirmText = getCommonText('confirm', locale)
  
  // 연도 범위 생성 (메모이제이션)
  const yearRange = useMemo(() => createYearRange(selectedYear - 5, 10), [selectedYear])
  
  // 월 배열 생성 (메모이제이션)
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), [])
  
  // 월 표시 텍스트 생성 (메모이제이션)
  const getMonthDisplayText = useMemo(() => {
    return (month: number) => {
      if (isKoreanLocale(locale)) {
        return `${month}${monthSuffix}`
      }
      return format(new Date(2024, month - 1), 'MMMM', { locale: currentLocale })
    }
  }, [locale, monthSuffix, currentLocale])

  if (!show) {
    return null
  }

  return (
    <div className="relative">
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* 셀렉트 박스 */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 w-72">
        <div className="space-y-3">
          <div className="flex gap-2 items-start">
            {/* 연도 선택 */}
            <div className="flex-1 relative">
              <button
                onClick={onToggleYearDropdown}
                className="w-full px-3 py-3 text-sm border border-gray-300 rounded-md bg-white text-left flex items-center justify-between hover:border-blue-500 touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <span>{selectedYear}{yearSuffix}</span>
                <span className="text-gray-400">▼</span>
              </button>
              {showYearDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                  {yearRange.map((year) => (
                    <button
                      key={year}
                      onClick={() => onYearSelect(year)}
                      className={cn(
                        "w-full px-3 py-3 text-sm text-left hover:bg-blue-50 hover:text-blue-600 touch-manipulation",
                        year === selectedYear && "bg-blue-100 text-blue-600"
                      )}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      {year}{yearSuffix}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* 월 선택 */}
            <div className="flex-1 relative">
              <button
                onClick={onToggleMonthDropdown}
                className="w-full px-3 py-3 text-sm border border-gray-300 rounded-md bg-white text-left flex items-center justify-between hover:border-blue-500 touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <span>{getMonthDisplayText(selectedMonth)}</span>
                <span className="text-gray-400">▼</span>
              </button>
              {showMonthDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                  {months.map((month) => (
                    <button
                      key={month}
                      onClick={() => onMonthSelect(month)}
                      className={cn(
                        "w-full px-3 py-2 text-sm text-left hover:bg-blue-50 hover:text-blue-600",
                        month === selectedMonth && "bg-blue-100 text-blue-600"
                      )}
                    >
                      {getMonthDisplayText(month)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* 버튼 영역 */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-3 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-3 py-3 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

DateSelector.displayName = 'DateSelector'

export { DateSelector }