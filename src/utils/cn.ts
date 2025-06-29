/**
 * 간단한 클래스명 조합 유틸리티 (clsx 대체)
 */

type ClassValue = string | number | boolean | undefined | null | ClassArray | ClassDictionary

interface ClassDictionary {
  [id: string]: any
}

interface ClassArray extends Array<ClassValue> {}

function toVal(mix: ClassValue): string {
  let k: string
  let y: string
  let str = ''

  if (typeof mix === 'string' || typeof mix === 'number') {
    str += mix
  } else if (typeof mix === 'object') {
    if (Array.isArray(mix)) {
      for (k of mix) {
        if (k) {
          if ((y = toVal(k))) {
            str && (str += ' ')
            str += y
          }
        }
      }
    } else if (mix) {
      for (k in mix) {
        if (mix[k]) {
          str && (str += ' ')
          str += k
        }
      }
    }
  }

  return str
}

export function cn(...inputs: ClassValue[]): string {
  let i = 0
  let tmp: string
  let x: ClassValue
  let str = ''

  while (i < inputs.length) {
    if ((x = inputs[i++])) {
      if ((tmp = toVal(x))) {
        str && (str += ' ')
        str += tmp
      }
    }
  }

  return str
}