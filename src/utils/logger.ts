/**
 * 패키지용 간단한 로거 유틸리티
 */

import type { DebugOptions } from '@/types'

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

const logLevels: Record<string, LogLevel> = {
  error: LogLevel.ERROR,
  warn: LogLevel.WARN,
  info: LogLevel.INFO,
  debug: LogLevel.DEBUG
}

// 글로벌 디버그 설정 (기본값: 완전 비활성화)
let globalDebugOptions: DebugOptions = {
  enabled: false,
  level: 'error',  // 더 제한적인 기본 레벨
  showPerformance: false
}

// 디버그 설정 초기화 (단순화)
export const initializeLogger = (debugOption?: boolean | DebugOptions): void => {
  if (typeof debugOption === 'boolean') {
    globalDebugOptions = {
      enabled: debugOption,
      level: debugOption ? 'info' : 'error', // debug: true일 때 INFO 레벨까지만 (ERROR, WARN, INFO)
      showPerformance: false // 성능 로그는 명시적으로 설정해야 함
    }
  } else if (debugOption) {
    globalDebugOptions = {
      enabled: debugOption.enabled !== false,
      level: debugOption.level || 'debug', // 기본레벨을 debug로 변경
      showPerformance: debugOption.showPerformance !== false // 기본적으로 성능 로그 활성화
    }
  } else {
    // 기본값: 완전 비활성화
    globalDebugOptions = {
      enabled: false,
      level: 'error',  // 에러만 출력
      showPerformance: false
    }
  }
  
  // 디버그 설정 확인 로그 (항상 출력)
  if (globalDebugOptions.enabled) {
    console.log('%c[React Infinite Calendar] Debug 로깅 활성화', 'color: #22c55e; font-weight: bold', {
      level: globalDebugOptions.level,
      showPerformance: globalDebugOptions.showPerformance
    })
  }
}

// 로그 활성화 체크
const isLogEnabled = (level: LogLevel, context?: string): boolean => {
  if (!globalDebugOptions.enabled) return false
  
  // Performance 로거는 showPerformance 설정도 확인
  if (context === 'Performance' && !globalDebugOptions.showPerformance) return false
  
  const configuredLevel = logLevels[globalDebugOptions.level || 'warn']
  return level <= configuredLevel
}

// 기본 로거 클래스
class Logger {
  private context: string

  constructor(context: string = 'Calendar') {
    this.context = context
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!isLogEnabled(level, this.context)) return
    
    const timestamp = new Date().toISOString()
    const levelName = LogLevel[level]
    const prefix = `[${timestamp}] [${levelName}] [${this.context}]`
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(prefix, message, ...args)
        break
      case LogLevel.WARN:
        console.warn(prefix, message, ...args)
        break
      case LogLevel.INFO:
        console.info(prefix, message, ...args)
        break
      case LogLevel.DEBUG:
        console.log(prefix, message, ...args)
        break
    }
  }

  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args)
  }

  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args)
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args)
  }

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args)
  }
}

// 전역 로거 인스턴스들
export const logger = new Logger('Calendar')
export const uiLogger = new Logger('CalendarUI')
export const performanceLogger = new Logger('Performance')

// 빈도 제한 로그 (throttled log)
const throttleMap = new Map<string, number>()

export const throttledLog = (
  key: string, 
  message: string, 
  intervalMs: number = 1000,
  level: LogLevel = LogLevel.DEBUG
): void => {
  const now = Date.now()
  const lastLogged = throttleMap.get(key) || 0
  
  if (now - lastLogged >= intervalMs) {
    switch (level) {
      case LogLevel.ERROR:
        logger.error(`[THROTTLED:${key}] ${message}`)
        break
      case LogLevel.WARN:
        logger.warn(`[THROTTLED:${key}] ${message}`)
        break
      case LogLevel.INFO:
        logger.info(`[THROTTLED:${key}] ${message}`)
        break
      case LogLevel.DEBUG:
        logger.debug(`[THROTTLED:${key}] ${message}`)
        break
    }
    throttleMap.set(key, now)
  }
}

// 디버그 상태 확인 함수 (개발자용)
export const getDebugInfo = () => {
  return {
    enabled: globalDebugOptions.enabled,
    level: globalDebugOptions.level,
    showPerformance: globalDebugOptions.showPerformance,
    currentLogLevel: logLevels[globalDebugOptions.level || 'warn']
  }
}

// 전역에서 접근 가능하도록 window 객체에 추가 (브라우저 환경에서)
if (typeof window !== 'undefined') {
  (window as any).getCalendarDebugInfo = getDebugInfo
}