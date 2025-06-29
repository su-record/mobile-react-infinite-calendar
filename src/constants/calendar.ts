/**
 * 캘린더 관련 상수 정의
 */

// 스크롤 관련 상수
export const SCROLL_CONSTANTS = {
  THRESHOLD: 100,                    // 무한 스크롤 임계값 (px)
  LOADING_TIMEOUT: 100,              // 로딩 방지 타임아웃 (ms)
} as const

// UI 관련 상수
export const UI_CONSTANTS = {
  DAY_CELL_HEIGHT: 60,              // 일자 셀 높이 (px)
  HEADER_HEIGHT: 100,               // 헤더 영역 높이 (px)
  MIN_CALENDAR_HEIGHT: 400,         // 최소 캘린더 높이 (px)
  INTERSECTION_THRESHOLD_STEPS: 21, // IntersectionObserver threshold 단계
  YEAR_DROPDOWN_SIZE: 10,           // 연도 드롭다운에 표시할 연도 수
} as const

// 날짜 관련 상수
export const DATE_CONSTANTS = {
  CURRENT_YEAR: new Date().getFullYear(),
  DAYS_PER_WEEK: 7,
  MAX_DAYS_PER_MONTH: 31,
  MIN_VISIBLE_WEEKS: 2,             // active 월 판정을 위한 최소 보이는 주 수
} as const

// API 관련 상수
export const API_CONSTANTS = {
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24시간 (ms)
  MAX_ROWS_PER_REQUEST: 31,            // API 요청당 최대 행 수
  REQUEST_TIMEOUT: 5000,               // API 요청 타임아웃 (ms)
} as const

// 색상 관련 상수
export const COLOR_CONSTANTS = {
  HOLIDAY_COLORS: {
    RED: 'red',
    GREEN: 'green', 
    PURPLE: 'purple',
    ORANGE: 'orange',
    PINK: 'pink',
    YELLOW: 'yellow',
  },
  DEFAULT_HOLIDAY_COLOR: 'red',
  DEFAULT_EVENT_COLOR: '#3b82f6',
} as const

// 자동 높이 계산 기본값
export const AUTO_HEIGHT_DEFAULTS = {
  TOP_OFFSET: 0,
  BOTTOM_OFFSET: 20,
  MIN_HEIGHT: 400,
  MAX_HEIGHT: () => window.innerHeight,
} as const

// 디버그 관련 기본값
export const DEBUG_DEFAULTS = {
  ENABLED: false,
  LEVEL: 'warn' as const,
  SHOW_PERFORMANCE: false,
} as const

// 로케일 관련 상수
export const LOCALE_CONSTANTS = {
  DEFAULT_LOCALE: 'ko-KR' as const,
  KOREAN_LOCALES: ['ko-KR', 'ko'] as const,
} as const

// IntersectionObserver threshold 배열 생성 함수
export const createIntersectionThresholds = (steps: number = UI_CONSTANTS.INTERSECTION_THRESHOLD_STEPS) => {
  return Array.from({ length: steps }, (_, i) => i * (1 / (steps - 1)))
}

// 연도 범위 생성 함수
export const createYearRange = (startYear?: number, size: number = UI_CONSTANTS.YEAR_DROPDOWN_SIZE) => {
  const start = startYear || DATE_CONSTANTS.CURRENT_YEAR
  return Array.from({ length: size }, (_, i) => start + i)
}