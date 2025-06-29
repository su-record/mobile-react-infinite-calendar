/**
 * 로케일 관련 유틸리티 함수들
 */

import { ko, enUS, ja, zhCN, de, fr, it, es } from 'date-fns/locale'
import type { LocaleCode } from '@/types'
import { LOCALE_CONSTANTS } from '@/constants/calendar'

// 로케일 매핑
export const localeMap = {
  'ko-KR': ko,
  'ko': ko,
  'en-US': enUS,
  'en': enUS,
  'ja-JP': ja,
  'ja': ja,
  'zh-CN': zhCN,
  'zh': zhCN,
  'de-DE': de,
  'de': de,
  'fr-FR': fr,
  'fr': fr,
  'it-IT': it,
  'it': it,
  'es-ES': es,
  'es': es
} as const

// 요일 텍스트 매핑
export const weekDaysMap = {
  'ko-KR': ['일', '월', '화', '수', '목', '금', '토'],
  'ko': ['일', '월', '화', '수', '목', '금', '토'],
  'en-US': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  'en': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  'ja-JP': ['日', '月', '火', '水', '木', '金', '土'],
  'ja': ['日', '月', '火', '水', '木', '金', '土'],
  'zh-CN': ['日', '一', '二', '三', '四', '五', '六'],
  'zh': ['日', '一', '二', '三', '四', '五', '六'],
  'de-DE': ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  'de': ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  'fr-FR': ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  'fr': ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  'it-IT': ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
  'it': ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
  'es-ES': ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  'es': ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
} as const

// 오늘 버튼 텍스트 매핑
export const todayButtonTextMap = {
  'ko-KR': '오늘',
  'ko': '오늘',
  'en-US': 'Today',
  'en': 'Today',
  'ja-JP': '今日',
  'ja': '今日',
  'zh-CN': '今天',
  'zh': '今天',
  'de-DE': 'Heute',
  'de': 'Heute',
  'fr-FR': "Aujourd'hui",
  'fr': "Aujourd'hui",
  'it-IT': 'Oggi',
  'it': 'Oggi',
  'es-ES': 'Hoy',
  'es': 'Hoy'
} as const

// 공통 텍스트 매핑
export const commonTextMap = {
  cancel: {
    'ko-KR': '취소',
    'ko': '취소',
    'en-US': 'Cancel',
    'en': 'Cancel',
    'ja-JP': 'キャンセル',
    'ja': 'キャンセル',
    'zh-CN': '取消',
    'zh': '取消',
    'de-DE': 'Abbrechen',
    'de': 'Abbrechen',
    'fr-FR': 'Annuler',
    'fr': 'Annuler',
    'it-IT': 'Annulla',
    'it': 'Annulla',
    'es-ES': 'Cancelar',
    'es': 'Cancelar'
  },
  confirm: {
    'ko-KR': '확인',
    'ko': '확인',
    'en-US': 'OK',
    'en': 'OK',
    'ja-JP': 'OK',
    'ja': 'OK',
    'zh-CN': '确定',
    'zh': '确定',
    'de-DE': 'OK',
    'de': 'OK',
    'fr-FR': 'OK',
    'fr': 'OK',
    'it-IT': 'OK',
    'it': 'OK',
    'es-ES': 'OK',
    'es': 'OK'
  }
} as const

/**
 * 한국 로케일인지 확인
 */
export const isKoreanLocale = (locale: string): boolean => {
  return LOCALE_CONSTANTS.KOREAN_LOCALES.includes(locale as any)
}

/**
 * 로케일에 맞는 date-fns 로케일 객체 반환
 */
export const getDateFnsLocale = (locale: LocaleCode | string) => {
  return localeMap[locale as keyof typeof localeMap] || ko
}

/**
 * 로케일에 맞는 요일 배열 반환
 */
export const getWeekDays = (locale: LocaleCode | string) => {
  return weekDaysMap[locale as keyof typeof weekDaysMap] || weekDaysMap['ko-KR']
}

/**
 * 로케일에 맞는 오늘 버튼 텍스트 반환
 */
export const getTodayButtonText = (locale: LocaleCode | string) => {
  return todayButtonTextMap[locale as keyof typeof todayButtonTextMap] || todayButtonTextMap['ko-KR']
}

/**
 * 로케일에 맞는 공통 텍스트 반환
 */
export const getCommonText = (key: keyof typeof commonTextMap, locale: LocaleCode | string) => {
  return commonTextMap[key][locale as keyof typeof commonTextMap[typeof key]] || commonTextMap[key]['ko-KR']
}

/**
 * 로케일에 맞는 연도 접미사 반환
 */
export const getYearSuffix = (locale: LocaleCode | string) => {
  return isKoreanLocale(locale) ? '년' : ''
}

/**
 * 로케일에 맞는 월 접미사 반환
 */
export const getMonthSuffix = (locale: LocaleCode | string) => {
  return isKoreanLocale(locale) ? '월' : ''
}