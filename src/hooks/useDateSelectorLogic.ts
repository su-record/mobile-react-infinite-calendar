/**
 * 날짜 선택기 로직 훅
 * DateSelector와 관련된 모든 이벤트 핸들러를 관리
 */

import { useCallback } from 'react'
import { uiLogger } from '@/utils/logger'

interface UseDateSelectorLogicProps {
  // 상태
  selectedYear: number
  selectedMonth: number
  showYearDropdown: boolean
  showMonthDropdown: boolean
  
  // 액션
  setSelectedYear: (year: number) => void
  setSelectedMonth: (month: number) => void
  setShowYearDropdown: (show: boolean) => void
  setShowMonthDropdown: (show: boolean) => void
  confirmDateSelection: () => void
  
  // 디버그
  isDebugEnabled?: boolean
}

export function useDateSelectorLogic({
  selectedYear,
  selectedMonth,
  showYearDropdown,
  showMonthDropdown,
  setSelectedYear,
  setSelectedMonth,
  setShowYearDropdown,
  setShowMonthDropdown,
  confirmDateSelection,
  isDebugEnabled = false
}: UseDateSelectorLogicProps) {

  // 연도 선택 핸들러
  const handleYearSelect = useCallback((year: number) => {
    if (isDebugEnabled) {
      uiLogger.debug('연도 선택', { year, previousYear: selectedYear })
    }
    setSelectedYear(year)
    setShowYearDropdown(false)
  }, [setSelectedYear, setShowYearDropdown, selectedYear, isDebugEnabled])

  // 월 선택 핸들러
  const handleMonthSelect = useCallback((month: number) => {
    if (isDebugEnabled) {
      uiLogger.debug('월 선택', { month, previousMonth: selectedMonth })
    }
    setSelectedMonth(month)
    setShowMonthDropdown(false)
  }, [setSelectedMonth, setShowMonthDropdown, selectedMonth, isDebugEnabled])

  // 연도 드롭다운 토글
  const handleToggleYearDropdown = useCallback(() => {
    setShowYearDropdown(!showYearDropdown)
    setShowMonthDropdown(false)
  }, [showYearDropdown, setShowYearDropdown, setShowMonthDropdown])

  // 월 드롭다운 토글
  const handleToggleMonthDropdown = useCallback(() => {
    setShowMonthDropdown(!showMonthDropdown)
    setShowYearDropdown(false)
  }, [showMonthDropdown, setShowMonthDropdown, setShowYearDropdown])

  // 날짜 확인 핸들러
  const handleConfirmDateSelection = useCallback(() => {
    if (isDebugEnabled) {
      uiLogger.info('날짜 선택 확인', { selectedYear, selectedMonth })
    }
    confirmDateSelection()
  }, [confirmDateSelection, selectedYear, selectedMonth, isDebugEnabled])

  return {
    handleYearSelect,
    handleMonthSelect,
    handleToggleYearDropdown,
    handleToggleMonthDropdown,
    handleConfirmDateSelection
  }
}