/**
 * 스타일 주입 유틸리티
 * CSS 키프레임과 스타일을 동적으로 주입
 */

// CSS 키프레임 애니메이션 및 모바일 Safari 최적화
const REQUIRED_STYLES = `
  @keyframes customBounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0,-8px,0);
    }
    70% {
      transform: translate3d(0,-4px,0);
    }
    90% {
      transform: translate3d(0,-2px,0);
    }
  }

  /* 모바일 Safari 터치 스크롤 최적화 */
  .scrollbar-hide {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* iOS Safari 바운스 효과 제어 */
  .infinite-calendar-container {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  /* 모바일 터치 타겟 최적화 */
  .touch-manipulation {
    touch-action: manipulation;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }

  /* 모바일에서 hover 효과 비활성화 */
  @media (hover: none) and (pointer: coarse) {
    .hover\\:bg-blue-50:hover,
    .hover\\:text-blue-600:hover,
    .hover\\:bg-gray-200:hover,
    .hover\\:bg-blue-700:hover,
    .hover\\:border-blue-500:hover {
      background-color: inherit !important;
      color: inherit !important;
      border-color: inherit !important;
    }
  }

  /* 모바일 터치 영역 최소 크기 보장 */
  @media (max-width: 768px) {
    button, .touch-target {
      min-height: 44px;
      min-width: 44px;
    }
  }
`

/**
 * 필요한 CSS 스타일을 문서에 주입
 */
export function injectRequiredStyles(): void {
  // 서버 사이드 렌더링 환경에서는 스킵
  if (typeof document === 'undefined') return
  
  // 이미 주입된 경우 스킵
  if (document.getElementById('infinite-calendar-styles')) return
  
  const style = document.createElement('style')
  style.id = 'infinite-calendar-styles'
  style.textContent = REQUIRED_STYLES
  document.head.appendChild(style)
}

/**
 * 주입된 스타일 제거 (테스트나 정리 목적)
 */
export function removeInjectedStyles(): void {
  if (typeof document === 'undefined') return
  
  const existingStyle = document.getElementById('infinite-calendar-styles')
  if (existingStyle) {
    existingStyle.remove()
  }
}