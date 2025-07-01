/**
 * 자동 높이 계산 커스텀 훅
 */

import { useEffect, useRef, useCallback, useMemo, RefObject } from 'react'
import { AUTO_HEIGHT_DEFAULTS } from '@/constants/calendar'
import { uiLogger } from '@/utils/logger'
import type { AutoHeightOptions } from '@/types'

interface UseAutoHeightProps {
  containerRef: RefObject<HTMLDivElement>
  height?: number | 'auto' | string
  autoHeight?: AutoHeightOptions
  onHeightChange: (height: number) => void
}

export function useAutoHeight({
  containerRef,
  height,
  autoHeight,
  onHeightChange
}: UseAutoHeightProps) {
  const lastCalculatedHeight = useRef<number | null>(null)
  const calculationTimeoutRef = useRef<any>(null)
  const isCalculatingRef = useRef(false)
  const hasInitializedRef = useRef(false)
  const hasCalculatedRef = useRef(false)
  
  // autoHeight 옵션 메모이제이션
  const memoizedOptions = useMemo(() => {
    if (!autoHeight) return null
    return {
      topOffset: AUTO_HEIGHT_DEFAULTS.TOP_OFFSET,
      bottomOffset: AUTO_HEIGHT_DEFAULTS.BOTTOM_OFFSET,
      minHeight: AUTO_HEIGHT_DEFAULTS.MIN_HEIGHT,
      maxHeight: AUTO_HEIGHT_DEFAULTS.MAX_HEIGHT(),
      ...autoHeight
    } as Required<AutoHeightOptions>
  }, [autoHeight])
  
  // 높이 계산 함수 (최적화된 버전)
  const calculateHeight = useCallback(() => {
    // 중복 계산 방지
    if (isCalculatingRef.current || !containerRef.current || !memoizedOptions) {
      uiLogger.debug('높이 계산 스킵', {
        isCalculating: isCalculatingRef.current,
        hasContainer: !!containerRef.current,
        hasOptions: !!memoizedOptions
      })
      return
    }
    
    isCalculatingRef.current = true
    
    try {
      const rect = containerRef.current.getBoundingClientRect()
      
      // 뷰포트 기준 top 위치를 사용하여 정확한 계산
      const containerTop = rect.top
      const topPosition = containerTop + memoizedOptions.topOffset
      const availableSpace = window.innerHeight - topPosition - memoizedOptions.bottomOffset
      
      
      // 최소/최대 높이 제한
      const calculatedHeight = Math.min(
        Math.max(memoizedOptions.minHeight, availableSpace),
        memoizedOptions.maxHeight
      )
      
      // 의미있는 변화만 업데이트 (최소 5px 차이)
      const heightDiff = Math.abs((lastCalculatedHeight.current || 0) - calculatedHeight)
      if (heightDiff >= 5) {
        uiLogger.debug('자동 높이 계산', {
          previousHeight: lastCalculatedHeight.current,
          calculatedHeight,
          heightDiff,
          windowHeight: window.innerHeight,
          containerTop,
          availableSpace
        })
        lastCalculatedHeight.current = calculatedHeight
        onHeightChange(calculatedHeight)
      }
    } finally {
      isCalculatingRef.current = false
    }
  }, [memoizedOptions])
  
  // 강화된 디바운싱 (300ms)
  const debouncedCalculateHeight = useCallback(() => {
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current)
    }
    calculationTimeoutRef.current = setTimeout(calculateHeight, 300)
  }, [])

  useEffect(() => {
    // height가 'auto'이거나 autoHeight 옵션이 있는 경우 자동 계산
    const shouldAutoCalculate = height === 'auto' || Boolean(autoHeight)
    
    // 초기화 시에만 설정
    if (!hasInitializedRef.current) {
      uiLogger.info('자동 높이 계산 초기화', {
        height,
        autoHeight,
        shouldAutoCalculate,
        isNumberHeight: typeof height === 'number'
      })
      hasInitializedRef.current = true
    }
    
    if (shouldAutoCalculate && typeof height !== 'number' && memoizedOptions) {
      // 초기 계산 및 재시도
      if (!hasCalculatedRef.current) {
        // 즉시 계산 시도
        calculateHeight()
        
        // DOM이 완전히 준비되지 않았을 경우를 위한 재시도
        const timeoutId = setTimeout(() => {
          calculateHeight()
          
          // 계산 성공 여부 확인
          if (lastCalculatedHeight.current && lastCalculatedHeight.current > memoizedOptions.minHeight) {
            hasCalculatedRef.current = true
          } else {
            // 계산 실패 시 추가 재시도
            setTimeout(() => {
              calculateHeight()
              hasCalculatedRef.current = true
            }, 300)
          }
        }, 50)
        
        // resize 이벤트 등록
        window.addEventListener('resize', debouncedCalculateHeight, { passive: true })
        
        return () => {
          clearTimeout(timeoutId)
          if (calculationTimeoutRef.current) {
            clearTimeout(calculationTimeoutRef.current)
          }
          window.removeEventListener('resize', debouncedCalculateHeight)
          isCalculatingRef.current = false
        }
      } else {
        // 이미 계산된 경우 resize 이벤트만 등록
        window.addEventListener('resize', debouncedCalculateHeight, { passive: true })
        
        return () => {
          window.removeEventListener('resize', debouncedCalculateHeight)
        }
      }
    }
  }, [height, memoizedOptions]) // 함수들을 의존성에서 제거하여 무한 루프 방지
}