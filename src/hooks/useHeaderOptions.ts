/**
 * 헤더 옵션 처리 훅
 * 헤더 관련 설정과 레거시 props 처리
 */

import { useMemo } from 'react'
import type { CalendarOptions, HeaderDisplayOptions } from '@/types'

interface UseHeaderOptionsProps {
  options: CalendarOptions
  // 레거시 props
  showTodayButton?: boolean
  showDatePicker?: boolean
  height?: number | 'auto'
  initialDate?: Date
}

export function useHeaderOptions({
  options = {},
  showTodayButton,
  showDatePicker,
  height,
  initialDate
}: UseHeaderOptionsProps) {

  // options 합치기 (레거시 지원)
  const mergedOptions: CalendarOptions = useMemo(() => ({
    ...options,
    height: height || options.height,
    initialDate: initialDate || options.initialDate
  }), [options, height, initialDate])

  // 헤더 표시 옵션 처리
  const headerOptions: HeaderDisplayOptions = useMemo(() => {
    if (typeof mergedOptions.header === 'boolean') {
      return { 
        show: mergedOptions.header,
        monthTitle: mergedOptions.header,
        todayButton: mergedOptions.header,
        weekDays: mergedOptions.header,
        datePicker: mergedOptions.header
      }
    }
    
    return {
      show: mergedOptions.header?.show !== false,
      monthTitle: mergedOptions.header?.monthTitle !== false,
      todayButton: showTodayButton ?? mergedOptions.header?.todayButton ?? true,
      datePicker: showDatePicker ?? mergedOptions.header?.datePicker ?? true,
      weekDays: mergedOptions.header?.weekDays !== false
    }
  }, [mergedOptions.header, showTodayButton, showDatePicker])

  return {
    mergedOptions,
    headerOptions
  }
}