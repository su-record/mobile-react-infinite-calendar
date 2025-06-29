/**
 * 초기 스크롤 위치 설정 커스텀 훅
 */

import { useEffect, RefObject } from 'react'
import { UI_CONSTANTS } from '@/constants/calendar'
import { uiLogger } from '@/utils/logger'
import type { MonthData } from './useCalendarComposer'

interface UseInitialScrollProps {
  calendarRef: RefObject<HTMLDivElement>
  monthsData: MonthData[]
  availableHeight: number | null
  isInitialScrollSet: boolean
  onInitialScrollSet: (value: boolean) => void
}

export function useInitialScroll({
  calendarRef,
  monthsData,
  availableHeight,
  isInitialScrollSet,
  onInitialScrollSet
}: UseInitialScrollProps) {
  useEffect(() => {
    if (!calendarRef.current || !availableHeight || isInitialScrollSet || monthsData.length < 3) {
      return
    }
    
    // 현재 월(중간 인덱스)의 위치 계산
    const currentMonthIndex = Math.floor(monthsData.length / 2)
    let totalHeightBeforeCurrent = 0
    
    // 현재 월 이전까지의 높이 계산
    for (let i = 0; i < currentMonthIndex; i++) {
      totalHeightBeforeCurrent += monthsData[i].weeks.length * UI_CONSTANTS.DAY_CELL_HEIGHT
    }
    
    // 현재 월의 중간 위치 계산
    const currentMonthHeight = monthsData[currentMonthIndex].weeks.length * UI_CONSTANTS.DAY_CELL_HEIGHT
    const currentMonthMiddle = totalHeightBeforeCurrent + (currentMonthHeight / 2)
    
    // 캘린더 영역의 중간 위치 (헤더 제외)
    const calendarAreaMiddle = (availableHeight - UI_CONSTANTS.HEADER_HEIGHT) / 2
    
    // 현재 월이 화면 가운데 오도록 스크롤 위치 계산
    const scrollPosition = Math.max(0, currentMonthMiddle - calendarAreaMiddle)
    
    uiLogger.debug('초기 스크롤 위치 계산', {
      currentMonthIndex,
      totalHeightBeforeCurrent,
      currentMonthHeight,
      currentMonthMiddle,
      availableHeight,
      calendarAreaMiddle,
      scrollPosition
    })
    
    // DOM이 준비되면 즉시 스크롤 설정
    calendarRef.current.scrollTop = scrollPosition
    onInitialScrollSet(true)
  }, [calendarRef, monthsData, availableHeight, isInitialScrollSet, onInitialScrollSet])
}