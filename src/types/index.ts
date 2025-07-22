// 패키지 전용 타입 정의

// 캘린더에 표시할 최소 정보
interface CalendarEventDisplay {
  date: string        // YYYY-MM-DD 형식
  title?: string      // 툴팁이나 클릭 시 표시용 (선택사항)
  color?: string      // 도트 색상 (기본: 빨강)
  id?: string         // 선택사항 (자동 생성 가능)
}

// 제네릭을 사용한 유연한 이벤트 타입
export interface CalendarEvent<T = any> extends CalendarEventDisplay {
  originalData?: T    // 원본 데이터를 그대로 보관
}

// 간단한 캘린더 이벤트 타입 (기존 호환성용, Deprecated)
export interface SimpleCalendarEvent extends CalendarEventDisplay {}

// 상세한 이벤트 타입 (기존 호환성용, Deprecated)
export interface DetailedCalendarEvent extends CalendarEventDisplay {
  id: string
  title: string
  startTime: string   // ISO date string
  endTime: string     // ISO date string
  description?: string
  metadata?: Record<string, any>
}

// 공휴일 타입
export interface Holiday {
  id?: string    // 선택사항 (자동 생성 가능)
  name: string
  date: string   // YYYY-MM-DD 형식
  color?: string // 텍스트 색상 (기본값: 'red', hex 색상 지원)
}

// 뷰 모드 타입
export type ViewMode = 'day' | 'week' | 'month'

// 지원하는 로케일 타입
export type LocaleCode = 'ko-KR' | 'en-US' | 'ja-JP' | 'zh-CN' | 'en-GB' | 'de-DE' | 'fr-FR' | 'it-IT' | 'es-ES' | 'ko' | 'en' | 'ja' | 'zh' | 'de' | 'fr' | 'it' | 'es'

// 색상 스키마 타입
export interface ColorScheme {
  primary?: string
  secondary?: string
  accent?: string
  background?: string
  text?: string
  border?: string
}

// 테마 타입
export type Theme = 'light' | 'dark' | 'custom'

// 헤더 표시 옵션
export interface HeaderDisplayOptions {
  show?: boolean
  monthTitle?: boolean
  todayButton?: boolean
  weekDays?: boolean
  datePicker?: boolean
}

// 클래스명 커스터마이징
export interface ClassNameOptions {
  container?: string
  header?: string
  monthTitle?: string
  weekDay?: string
  dayCell?: string
  todayButton?: string
  datePickerOverlay?: string
}

// 자동 높이 계산 옵션
export interface AutoHeightOptions {
  topOffset?: number      // 상단 여백 (기본값: 0)
  bottomOffset?: number   // 하단 여백 (기본값: 20)
  minHeight?: number      // 최소 높이 (기본값: 400)
  maxHeight?: number      // 최대 높이 (기본값: window.innerHeight)
}

// 디버그 옵션
export interface DebugOptions {
  enabled?: boolean          // 로그 활성화/비활성화 (기본: false)
  level?: 'error' | 'warn' | 'info' | 'debug'  // 로그 레벨 (기본: 'warn')
  showPerformance?: boolean  // 성능 로그 표시 (기본: false)
}

// UI 옵션
export interface CalendarOptions {
  // Display 옵션
  header?: boolean | HeaderDisplayOptions
  
  // 스타일 커스터마이징
  classNames?: ClassNameOptions
  
  // 높이 설정
  height?: number | 'auto' | string
  autoHeight?: AutoHeightOptions
  
  // 디버그 옵션
  debug?: boolean | DebugOptions
  
  // 공휴일 옵션
  disableHolidays?: boolean  // 공휴일 자동 로딩 비활성화
  
  // 기타 UI 옵션
  initialDate?: Date
}

// 메인 캘린더 props 인터페이스
export interface InfiniteCalendarProps {
  // 데이터
  events?: CalendarEvent[]
  holidays?: Holiday[]
  
  // 이벤트 핸들러
  onDateClick?: (date: Date, events: CalendarEvent[]) => void
  
  // 지역화
  locale?: LocaleCode | string    // 기본값: 'ko-KR'
  holidayServiceKey?: string      // 공휴일 API 서비스 키 (한국만 해당)
  
  // UI/스타일 옵션
  options?: CalendarOptions
  
  // 레거시 지원 (deprecated)
  showTodayButton?: boolean
  showDatePicker?: boolean
  height?: number | 'auto'
  initialDate?: Date
}

// 기존 타입들과의 호환을 위한 별칭
export type Reservation = CalendarEvent
export type Event = CalendarEvent