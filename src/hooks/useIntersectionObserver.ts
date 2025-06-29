/**
 * IntersectionObserver 관리 커스텀 훅
 */

import { useEffect, RefObject, useRef } from 'react'
import { isSameMonth } from 'date-fns'
import { createIntersectionThresholds } from '@/constants/calendar'
import type { MonthData } from './useCalendarComposer'

interface UseIntersectionObserverProps {
  calendarRef: RefObject<HTMLDivElement>
  monthsData: MonthData[]
  activeMonth: Date
  onActiveMonthChange: (month: Date) => void
  onCurrentMonthVisibilityChange: (visible: boolean) => void
}

export function useIntersectionObserver({
  calendarRef,
  monthsData,
  activeMonth,
  onActiveMonthChange,
  onCurrentMonthVisibilityChange
}: UseIntersectionObserverProps) {
  const debounceTimeoutRef = useRef<any>()
  
  useEffect(() => {
    if (!calendarRef.current || monthsData.length === 0) return

    const observedElements = new Map()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const monthElement = entry.target as HTMLElement
          const monthIndex = parseInt(monthElement.dataset.monthIndex || '0')
          const monthData = monthsData[monthIndex]

          if (monthData) {
            // 가시성 비율과 주 수 계산
            const visibleRatio = entry.intersectionRatio
            const totalWeeks = monthData.weeks.length
            const visibleWeeks = Math.floor(visibleRatio * totalWeeks)

            observedElements.set(monthIndex, {
              month: monthData.month,
              visibleWeeks,
              totalWeeks,
              ratio: visibleRatio
            })

            // 디바운싱으로 빠른 월 변경 방지
            if (debounceTimeoutRef.current) {
              clearTimeout(debounceTimeoutRef.current)
            }
            
            debounceTimeoutRef.current = setTimeout(() => {
              // 가장 많이 보이는 월을 active로 설정 (더 엄격한 기준)
              let maxVisibilityScore = 0
              let newActiveMonth = activeMonth

              observedElements.forEach((data) => {
                // 가시성 점수 계산: (보이는 주 수 / 전체 주 수) + 보이는 주 수 보너스
                const visibilityScore = (data.visibleWeeks / data.totalWeeks) + (data.visibleWeeks * 0.1)
                
                if (data.visibleWeeks >= 1 && visibilityScore > maxVisibilityScore) {
                  maxVisibilityScore = visibilityScore
                  newActiveMonth = data.month
                }
              })

              // 새로운 active month가 현재와 다르고 최소 가시성을 만족하는 경우에만 변경
              if (!isSameMonth(newActiveMonth, activeMonth) && maxVisibilityScore > 0.3) {
                onActiveMonthChange(newActiveMonth)
              }

              // 현재 active 월이 보이는지 체크
              const activeMonthData = Array.from(observedElements.values())
                .find(data => isSameMonth(data.month, activeMonth))

              onCurrentMonthVisibilityChange(
                activeMonthData ? activeMonthData.visibleWeeks >= 1 : false
              )
            }, 150) // 150ms 디바운싱으로 증가
          }
        })
      },
      {
        root: calendarRef.current,
        threshold: createIntersectionThresholds(),
        rootMargin: '0px'
      }
    )

    // 모든 월 요소를 관찰
    monthsData.forEach((_, index) => {
      const monthElement = calendarRef.current?.querySelector(`[data-month-index="${index}"]`)
      if (monthElement) {
        observer.observe(monthElement)
      }
    })

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      observer.disconnect()
      observedElements.clear()
    }
  }, [calendarRef, monthsData, activeMonth, onActiveMonthChange, onCurrentMonthVisibilityChange])
}