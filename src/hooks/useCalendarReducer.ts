/**
 * 캘린더 상태 관리를 위한 Reducer
 */

import { Holiday } from '@/types'

// 상태 타입 정의
export interface CalendarState {
  // 공휴일 관련
  autoHolidays: Holiday[]
  holidayLoading: boolean
  
  // 날짜 관련
  displayMonth: Date
  activeMonth: Date
  infiniteMonths: Date[]
  
  // UI 상태
  availableHeight: number | null
  isCurrentMonthVisible: boolean
  isInitialScrollSet: boolean
  
  // 날짜 선택기
  showDateSelector: boolean
  selectedYear: number
  selectedMonth: number
  showYearDropdown: boolean
  showMonthDropdown: boolean
}

// 액션 타입 정의
export type CalendarAction =
  // 공휴일 액션
  | { type: 'SET_AUTO_HOLIDAYS'; payload: Holiday[] }
  | { type: 'SET_HOLIDAY_LOADING'; payload: boolean }
  
  // 날짜 액션
  | { type: 'SET_DISPLAY_MONTH'; payload: Date }
  | { type: 'SET_ACTIVE_MONTH'; payload: Date }
  | { type: 'SET_INFINITE_MONTHS'; payload: Date[] }
  | { type: 'ADD_PREV_MONTH' }
  | { type: 'ADD_NEXT_MONTH' }
  
  // UI 액션
  | { type: 'SET_AVAILABLE_HEIGHT'; payload: number | null }
  | { type: 'SET_CURRENT_MONTH_VISIBLE'; payload: boolean }
  | { type: 'SET_INITIAL_SCROLL'; payload: boolean }
  
  // 날짜 선택기 액션
  | { type: 'OPEN_DATE_SELECTOR' }
  | { type: 'CLOSE_DATE_SELECTOR' }
  | { type: 'SET_SELECTED_YEAR'; payload: number }
  | { type: 'SET_SELECTED_MONTH'; payload: number }
  | { type: 'TOGGLE_YEAR_DROPDOWN' }
  | { type: 'TOGGLE_MONTH_DROPDOWN' }
  | { type: 'CONFIRM_DATE_SELECTION' }
  
  // 복합 액션
  | { type: 'GO_TO_TODAY' }
  | { type: 'RESET_TO_DATE'; payload: Date }

// 초기 상태 생성 함수
export const createInitialState = (initialDate?: Date): CalendarState => {
  const today = initialDate || new Date()
  
  return {
    // 공휴일
    autoHolidays: [],
    holidayLoading: false,
    
    // 날짜
    displayMonth: new Date(today),
    activeMonth: new Date(today),
    infiniteMonths: [
      new Date(today.getFullYear(), today.getMonth() - 1),
      new Date(today),
      new Date(today.getFullYear(), today.getMonth() + 1)
    ],
    
    // UI
    availableHeight: null,
    isCurrentMonthVisible: true,
    isInitialScrollSet: false,
    
    // 날짜 선택기
    showDateSelector: false,
    selectedYear: today.getFullYear(),
    selectedMonth: today.getMonth() + 1,
    showYearDropdown: false,
    showMonthDropdown: false
  }
}

// Reducer 함수
export function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    // 공휴일 관련
    case 'SET_AUTO_HOLIDAYS':
      return { ...state, autoHolidays: action.payload }
      
    case 'SET_HOLIDAY_LOADING':
      return { ...state, holidayLoading: action.payload }
    
    // 날짜 관련
    case 'SET_DISPLAY_MONTH':
      return { ...state, displayMonth: action.payload }
      
    case 'SET_ACTIVE_MONTH':
      return { ...state, activeMonth: action.payload }
      
    case 'SET_INFINITE_MONTHS':
      return { ...state, infiniteMonths: action.payload }
      
    case 'ADD_PREV_MONTH': {
      const firstMonth = state.infiniteMonths[0]
      const newMonth = new Date(firstMonth.getFullYear(), firstMonth.getMonth() - 1)
      return {
        ...state,
        infiniteMonths: [newMonth, ...state.infiniteMonths]
      }
    }
    
    case 'ADD_NEXT_MONTH': {
      const lastMonth = state.infiniteMonths[state.infiniteMonths.length - 1]
      const newMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1)
      return {
        ...state,
        infiniteMonths: [...state.infiniteMonths, newMonth]
      }
    }
    
    // UI 관련
    case 'SET_AVAILABLE_HEIGHT':
      return { ...state, availableHeight: action.payload }
      
    case 'SET_CURRENT_MONTH_VISIBLE':
      return { ...state, isCurrentMonthVisible: action.payload }
      
    case 'SET_INITIAL_SCROLL':
      return { ...state, isInitialScrollSet: action.payload }
    
    // 날짜 선택기 관련
    case 'OPEN_DATE_SELECTOR':
      return {
        ...state,
        showDateSelector: true,
        selectedYear: state.activeMonth.getFullYear(),
        selectedMonth: state.activeMonth.getMonth() + 1
      }
      
    case 'CLOSE_DATE_SELECTOR':
      return {
        ...state,
        showDateSelector: false,
        showYearDropdown: false,
        showMonthDropdown: false
      }
      
    case 'SET_SELECTED_YEAR':
      return { ...state, selectedYear: action.payload }
      
    case 'SET_SELECTED_MONTH':
      return { ...state, selectedMonth: action.payload }
      
    case 'TOGGLE_YEAR_DROPDOWN':
      return {
        ...state,
        showYearDropdown: !state.showYearDropdown,
        showMonthDropdown: false
      }
      
    case 'TOGGLE_MONTH_DROPDOWN':
      return {
        ...state,
        showMonthDropdown: !state.showMonthDropdown,
        showYearDropdown: false
      }
      
    case 'CONFIRM_DATE_SELECTION': {
      const newDate = new Date(state.selectedYear, state.selectedMonth - 1, 1)
      const prevMonth = new Date(newDate.getFullYear(), newDate.getMonth() - 1)
      const nextMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1)
      
      return {
        ...state,
        activeMonth: newDate,
        displayMonth: newDate,
        infiniteMonths: [prevMonth, newDate, nextMonth],
        isInitialScrollSet: false,
        showDateSelector: false,
        showYearDropdown: false,
        showMonthDropdown: false
      }
    }
    
    // 복합 액션
    case 'GO_TO_TODAY': {
      const today = new Date()
      const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1)
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1)
      
      return {
        ...state,
        activeMonth: today,
        displayMonth: today,
        infiniteMonths: [prevMonth, today, nextMonth],
        isInitialScrollSet: false
      }
    }
    
    case 'RESET_TO_DATE': {
      const date = action.payload
      const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1)
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1)
      
      return {
        ...state,
        activeMonth: date,
        displayMonth: date,
        infiniteMonths: [prevMonth, date, nextMonth],
        isInitialScrollSet: false,
        selectedYear: date.getFullYear(),
        selectedMonth: date.getMonth() + 1
      }
    }
    
    default:
      return state
  }
}