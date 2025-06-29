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
    if (isCalculatingRef.current || !containerRef.current || !memoizedOptions) return
    
    isCalculatingRef.current = true
    
    try {
      const rect = containerRef.current.getBoundingClientRect()
      
      // 자동 높이 계산
      const topPosition = rect.top + memoizedOptions.topOffset
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
          availableSpace: window.innerHeight - rect.top - memoizedOptions.topOffset - memoizedOptions.bottomOffset
        })
        lastCalculatedHeight.current = calculatedHeight
        onHeightChange(calculatedHeight)
      }
    } finally {
      isCalculatingRef.current = false
    }
  }, [containerRef, memoizedOptions, onHeightChange])
  
  // 강화된 디바운싱 (300ms)
  const debouncedCalculateHeight = useCallback(() => {
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current)
    }
    calculationTimeoutRef.current = setTimeout(calculateHeight, 300)
  }, [calculateHeight])

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
      // 즉시 계산 (초기 한 번만)
      if (!lastCalculatedHeight.current) {
        calculateHeight()
      }
      
      // DOM 준비 후 계산
      const timeoutId = setTimeout(calculateHeight, 100)
      
      // resize 이벤트만 등록 (다른 이벤트 제외)
      window.addEventListener('resize', debouncedCalculateHeight, { passive: true })
      
      return () => {
        clearTimeout(timeoutId)
        if (calculationTimeoutRef.current) {
          clearTimeout(calculationTimeoutRef.current)
        }
        window.removeEventListener('resize', debouncedCalculateHeight)
        isCalculatingRef.current = false
      }
    }
  }, [height, memoizedOptions, calculateHeight, debouncedCalculateHeight]) // autoHeight 제거하여 불필요한 리렌더링 방지
}