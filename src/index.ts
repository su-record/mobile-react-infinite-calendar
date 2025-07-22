// 메인 컴포넌트 export
export { InfiniteCalendar } from './components'

// 타입 정의 export
export type {
  InfiniteCalendarProps,
  CalendarEvent,
  Holiday,
  ViewMode,
  ColorScheme,
  Theme,
  CalendarOptions,
  ClassNameOptions,
  LocaleCode,
  // Deprecated types (기존 호환성용)
  SimpleCalendarEvent,
  DetailedCalendarEvent,
  Reservation,
  Event
} from './types'

// 훅 export (고급 사용자용)
export { useCalendarComposer } from './hooks/useCalendarComposer'

// 서비스 export
export { holidayService, HolidayService } from './services/holidayService'

// 유틸리티 export
export { cn } from './utils/cn'