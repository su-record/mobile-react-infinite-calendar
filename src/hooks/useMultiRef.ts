/**
 * 다중 ref 관리 커스텀 훅
 */

import { useRef, RefObject } from 'react'

export function useMultiRef<T>(): [RefObject<T>, RefObject<T>, (el: T | null) => void] {
  const ref1 = useRef<T>(null)
  const ref2 = useRef<T>(null)
  
  const setRefs = (el: T | null) => {
    ;(ref1 as any).current = el
    ;(ref2 as any).current = el
  }
  
  return [ref1, ref2, setRefs]
}