/**
 * 스크롤 관리 커스텀 훅
 */

import { useEffect, RefObject } from 'react'
import { SCROLL_CONSTANTS } from '@/constants/calendar'

interface UseScrollManagementProps {
  scrollContainerRef: RefObject<HTMLDivElement>
  onScrollToTop: () => void
  onScrollToBottom: () => void
}

export function useScrollManagement({ 
  scrollContainerRef,
  onScrollToTop, 
  onScrollToBottom 
}: UseScrollManagementProps) {
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let isLoading = false

    const handleScroll = () => {
      if (isLoading) return

      const { scrollTop, scrollHeight, clientHeight } = container

      // iOS Safari 스크롤 바운스 효과 고려
      // 음수 scrollTop이나 과도한 스크롤은 무시
      if (scrollTop < -10 || scrollTop + clientHeight > scrollHeight + 10) {
        return
      }

      // 상단 근처에서 이전 월 추가
      if (scrollTop < SCROLL_CONSTANTS.THRESHOLD && scrollTop >= 0) {
        isLoading = true
        onScrollToTop()
        setTimeout(() => { 
          isLoading = false 
        }, SCROLL_CONSTANTS.LOADING_TIMEOUT)
      }
      // 하단 근처에서 다음 월 추가
      else if (scrollTop + clientHeight > scrollHeight - SCROLL_CONSTANTS.THRESHOLD && 
               scrollTop + clientHeight <= scrollHeight) {
        isLoading = true
        onScrollToBottom()
        setTimeout(() => { 
          isLoading = false 
        }, SCROLL_CONSTANTS.LOADING_TIMEOUT)
      }
    }

    // 모바일 Safari 최적화: passive scroll 이벤트 사용
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [scrollContainerRef, onScrollToTop, onScrollToBottom])
}