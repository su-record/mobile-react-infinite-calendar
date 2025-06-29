# React Infinite Calendar Mobile

모바일 최적화된 무한 스크롤 캘린더 컴포넌트 (한국 공휴일 지원)

A mobile-optimized infinite scroll calendar component for React with Korean holidays support.

## 특징

- 🔄 **무한 스크롤**: 월간 부드러운 무한 스크롤
- 📱 **모바일 최적화**: 터치 친화적 디자인과 반응형 레이아웃
- 🎯 **자동 포커스**: IntersectionObserver를 통한 자동 월 감지
- 📅 **날짜 선택기**: 내장된 연도/월 드롭다운 선택기
- 🎉 **한국 공휴일 지원**: API 키 설정으로 한국 공휴일 표시
- 🚀 **동적 이벤트 로딩**: API 기반 스마트 이벤트 로딩 및 캐싱
- 🎨 **커스터마이징**: 유연한 테마 및 스타일 옵션
- 🌐 **다국어 지원**: 여러 언어 지원 (ko, en, ja, zh, de, fr, it, es)
- ⚡ **고성능**: 가상화 렌더링으로 부드러운 성능
- 🔧 **최적화된 상태 관리**: 격리된 로컬 상태로 성능 최적화
- 📦 **TypeScript**: 완벽한 TypeScript 지원
- 🏗️ **모듈러 아키텍처**: 비즈니스 로직과 UI 완전 분리
- 🌐 **브라우저 호환성**: 모던 브라우저 및 Safari 12.1+ 지원

## 설치

```bash
npm install mobile-react-infinite-calendar
```

### Peer Dependencies

다음 패키지들이 설치되어 있어야 합니다:

```bash
npm install react react-dom date-fns
```

## 브라우저 호환성

### ✅ **지원 브라우저**

| 브라우저       | 최소 버전 | 비고              |
| -------------- | --------- | ----------------- |
| **Chrome**     | 58+       | 완전 지원         |
| **Firefox**    | 55+       | 완전 지원         |
| **Safari**     | 12.1+     | **완전 지원**     |
| **iOS Safari** | 12.2+     | **모바일 최적화** |
| **Edge**       | 79+       | 완전 지원         |

### 🔑 **핵심 기능 호환성**

- ✅ **IntersectionObserver**: Safari 12.1+ 지원
- ✅ **CSS Grid/Flexbox**: 모든 모던 브라우저
- ✅ **Touch Events**: 모바일 Safari 완전 지원
- ✅ **Date API**: 네이티브 JavaScript Date 사용

### 📱 **모바일 Safari 최적화**

이 패키지는 모바일 Safari에서 발생할 수 있는 터치 이슈들을 미리 방지합니다:

- ✅ **Passive Scroll Events**: 터치 성능 최적화
- ✅ **Bounce Effect 제어**: iOS 스크롤 바운스 효과 처리
- ✅ **Touch Scrolling**: `-webkit-overflow-scrolling: touch` 적용
- ✅ **주소창 동적 높이**: 자동 높이 계산으로 대응

**터치 최적화 기능:**

- 🚫 스크롤 바운스 중 무한 로딩 방지
- ⚡ 하드웨어 가속 스크롤 활성화
- 📏 동적 뷰포트 높이 자동 대응
- 🎯 **버튼/셀렉트 터치 최적화**:
  - 최소 44px 터치 타겟 크기 보장
  - `touch-action: manipulation` 으로 더블탭 지연 제거
  - 모바일에서 hover 효과 자동 비활성화
  - iOS 하이라이트 제거

## 빠른 시작

```tsx
import { InfiniteCalendar } from "mobile-react-infinite-calendar";

// 가장 간단한 사용법 (한국 공휴일 지원)
function App() {
  return <InfiniteCalendar holidayServiceKey="your_api_key_here" />;
}
```

## 사용 가이드

### 1. 기본 사용법

```tsx
import { InfiniteCalendar } from "mobile-react-infinite-calendar";

function App() {
  return (
    <InfiniteCalendar
      holidayServiceKey="your_api_key_here"
      onDayAction={(date, dayInfo) => {
        console.log("날짜 클릭:", date.toDateString());
        if (dayInfo?.events.length > 0) {
          console.log(`이벤트 ${dayInfo.events.length}개`);
        }
      }}
    />
  );
}
```

### 2. 이벤트 관리

```tsx
// 간단한 방식 (권장)
const events = [
  {
    date: '2024-01-15',
    title: '팀 미팅',
    color: '#3b82f6'
  },
  {
    date: '2024-01-20',
    title: '프로젝트 검토'
    // color, id 생략 시 자동 처리
  }
]

<InfiniteCalendar
  holidayServiceKey="your_api_key_here"
  events={events}
  onDayAction={(date, dayInfo) => {
    console.log(`날짜 클릭: ${date.toDateString()}`)
    if (dayInfo?.events.length > 0) {
      console.log(`이벤트 ${dayInfo.events.length}개`)
    }
  }}
/>

// 상세한 방식 (기존 호환성)
const detailedEvents = [
  {
    id: '1',
    title: '팀 미팅',
    startTime: '2024-01-15T10:00:00',
    endTime: '2024-01-15T11:00:00',
    color: '#3b82f6'
  }
]
```

### 3. 한국 공휴일 설정

```tsx
// 🔑 API 키 설정 (필수)
<InfiniteCalendar holidayServiceKey="your_api_key_here" />

// 커스텀 공휴일 추가 (자동 공휴일 + 커스텀)
const customHolidays = [
  { name: '회사 창립일', date: '2024-03-15', color: 'green' },
  { name: '팀 워크샵', date: '2024-06-20', color: 'purple' },
  { name: '프로젝트 마감', date: '2024-12-31', color: 'orange' },
  { name: '생일', date: '2024-08-15', color: 'pink' },
  { name: '특별 이벤트', date: '2024-10-10', color: '#4ecdc4' }  // hex 색상도 가능
]

<InfiniteCalendar
  holidayServiceKey="your_api_key_here"
  holidays={customHolidays}
/>
```

#### 한국 공휴일 API 키 발급

1. [공공데이터포털](https://www.data.go.kr/) 접속
2. "특일정보" API 검색 및 신청
3. 발급받은 키를 `holidayServiceKey`에 설정

```tsx
// 개발 환경 설정
// .env 파일
REACT_APP_HOLIDAY_API_KEY=your_api_key_here

// 사용
<InfiniteCalendar
  holidayServiceKey={process.env.REACT_APP_HOLIDAY_API_KEY}
/>
```

**지원되는 공휴일:**

- 🎌 신정, 설날, 추석 등 주요 공휴일
- 🏛️ 어린이날, 현충일, 광복절 등 국가 기념일
- 🌸 부처님오신날 등 종교 기념일
- 📅 대체공휴일 및 임시공휴일

**사용 가능한 색상:**

- `'red'` 🔴 (기본값) - 공휴일
- `'green'` 🟢 - 개인 기념일
- `'purple'` 🟣 - 특별 행사
- `'orange'` 🟠 - 마감일, 알림
- `'pink'` 🩷 - 생일, 기념일
- `'yellow'` 🟡 - 일반 이벤트
- `'#hex'` - 커스텀 색상 (예: `'#4ecdc4'`, `'#ff6b6b'`)

### 4. UI 커스터마이징

```tsx
// 헤더 커스터마이징
<InfiniteCalendar
  holidayServiceKey="your_api_key_here"
  options={{
    header: {
      show: true,
      monthTitle: true,
      todayButton: false,    // 오늘 버튼 숨김
      weekDays: false,       // 요일 헤더 숨김
      datePicker: true
    }
  }}
/>

// 높이 설정
<InfiniteCalendar
  holidayServiceKey="your_api_key_here"
  options={{
    height: 600        // 고정 높이 (px)
    // height: 'auto'  // 자동 높이 (기본값)
    // height: '100vh' // CSS 단위도 가능
  }}
/>

// 자동 높이 + 하단 네비게이션 고려
<InfiniteCalendar
  holidayServiceKey="your_api_key_here"
  options={{
    autoHeight: {
      bottomOffset: 80,   // 하단 네비게이션 높이
      minHeight: 300      // 최소 높이
    }
  }}
/>

// 모바일 Safari에서 더 부드러운 스크롤
<InfiniteCalendar
  holidayServiceKey="your_api_key_here"
  options={{
    height: 'auto',
    autoHeight: {
      bottomOffset: 100,  // Safari 주소창 고려
      topOffset: 60       // 상단 네비게이션 고려
    }
  }}
/>

// 스타일 커스터마이징
<InfiniteCalendar
  holidayServiceKey="your_api_key_here"
  options={{
    classNames: {
      container: 'my-calendar-container',
      header: 'custom-header bg-gray-100',
      dayCell: 'hover:bg-blue-50 rounded-lg',
      todayButton: 'btn-primary'
    }
  }}
/>

// 최소 UI (임베디드용)
<InfiniteCalendar
  holidayServiceKey="your_api_key_here"
  options={{
    header: false,  // 전체 헤더 숨김
    height: 400     // 고정 높이 권장
  }}
/>
```

### 5. 디버그 및 개발 도구

```tsx
// 간단한 디버깅 (ERROR, WARN, INFO만 출력)
<InfiniteCalendar
  holidayServiceKey="your_api_key_here"
  options={{
    debug: true
  }}
/>

// 상세한 디버그 설정
<InfiniteCalendar
  holidayServiceKey="your_api_key_here"
  options={{
    debug: {
      enabled: true,
      level: 'info',           // 로그 레벨: 'error' | 'warn' | 'info' | 'debug'
      showPerformance: false   // 성능 로그 표시 여부
    }
  }}
/>

// 개발 환경에서만 활성화
<InfiniteCalendar
  holidayServiceKey="your_api_key_here"
  options={{
    debug: process.env.NODE_ENV === 'development'
  }}
/>
```

## 고급 기능

### 1. 동적 이벤트 로딩

```tsx
// API 기반 동적 이벤트 로딩
const fetchEvents = async (startDate: Date, endDate: Date) => {
  const response = await fetch(`/api/events?start=${startDate.toISOString()}&end=${endDate.toISOString()}`)
  return response.json()
}

<InfiniteCalendar
  holidayServiceKey="your_api_key_here"
  dynamicEvents={fetchEvents}
  dynamicEventMapping={{
    id: 'eventId',
    title: 'eventName',
    date: 'eventDate',
    startTime: 'startTime',
    endTime: 'endTime',
    color: 'eventColor'
  }}
  onDynamicEventLoad={(startDate, endDate, events) => {
    console.log(`로드된 이벤트: ${events.length}개 (${startDate.toDateString()} ~ ${endDate.toDateString()})`)
  }}
/>

// 커스텀 데이터 변환
<InfiniteCalendar
  holidayServiceKey="your_api_key_here"
  dynamicEvents={fetchEvents}
  dynamicEventTransform={(apiData) => ({
    id: apiData.id || Math.random().toString(),
    title: apiData.subject || 'Untitled',
    date: apiData.scheduledDate,
    color: apiData.priority === 'high' ? '#ff4444' : '#4444ff'
  })}
/>
```

**동적 이벤트 특징:**

- 🔄 **자동 로딩**: 스크롤 시 필요한 월의 이벤트만 로드
- 💾 **스마트 캐싱**: 이미 로드된 월은 캐시에서 빠르게 표시
- 📅 **선행 로딩**: 현재 월 기준 ±2개월 미리 로드
- 🎯 **점프 감지**: 데이트피커로 먼 날짜 이동 시 확장 로드
- 🔄 **재시도 로직**: 네트워크 오류 시 자동 재시도
- 📊 **유연한 매핑**: 다양한 API 응답 구조 지원

### 2. 다국어 지원

```tsx
// 영어 사용자
function EnglishCalendar() {
  const holidays = [
    { name: "Independence Day", date: "2024-07-04", color: "red" },
    { name: "Thanksgiving", date: "2024-11-28", color: "orange" },
  ];

  return (
    <InfiniteCalendar
      locale="en-US" // 로케일 설정 필수
      holidays={holidays} // 공휴일 직접 제공
    />
  );
}

// 일본어 사용자
function JapaneseCalendar() {
  return <InfiniteCalendar locale="ja-JP" holidays={myJapaneseHolidays} />;
}
```

**지원 로케일:**

- `ko-KR`, `ko` - 한국어 (기본값, 공휴일 지원)
- `en-US`, `en` - 영어
- `ja-JP`, `ja` - 일본어
- `zh-CN`, `zh` - 중국어
- `de-DE`, `de` - 독일어
- `fr-FR`, `fr` - 프랑스어
- `it-IT`, `it` - 이탈리아어
- `es-ES`, `es` - 스페인어

### 3. 고급 훅 사용

```tsx
import { useCalendarComposer } from "su-react-infinite-calendar";

function CustomCalendarControls() {
  const { activeMonth, setActiveMonth, monthsData, addNextMonth } =
    useCalendarComposer({
      events: [],
      holidays: [],
      holidayServiceKey: "your_api_key_here",
    });

  return (
    <button onClick={() => setActiveMonth(new Date())}>Go to Today</button>
  );
}
```

### 4. 전체 옵션 예시

```tsx
<InfiniteCalendar
  events={events}
  holidays={customHolidays}
  holidayServiceKey="your_api_key_here"
  dynamicEvents={fetchEvents}
  onDayAction={(date, dayInfo) => {
    openEventModal(date, dayInfo?.events);
  }}
  options={{
    header: {
      show: true,
      monthTitle: true,
      todayButton: true,
      weekDays: true,
      datePicker: false,
    },
    classNames: {
      container: "shadow-lg rounded-xl",
      dayCell: "custom-day-cell",
    },
    height: "auto",
    initialDate: new Date(),
    debug: process.env.NODE_ENV === "development",
  }}
/>
```

## 타입 정의

### CalendarEvent

```tsx
interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  description?: string;
  color?: string;
  metadata?: Record<string, any>;
}
```

### Holiday

```tsx
interface Holiday {
  id?: string; // Optional (auto-generated if not provided)
  name: string;
  date: string; // YYYY-MM-DD format
  color?: string; // Text color for the date (default: 'red')
}
```

### CalendarOptions

```typescript
interface CalendarOptions {
  // Display 옵션
  header?:
    | boolean
    | {
        show?: boolean;
        monthTitle?: boolean;
        todayButton?: boolean;
        weekDays?: boolean;
        datePicker?: boolean;
      };

  // 스타일 커스터마이징
  classNames?: {
    container?: string;
    header?: string;
    monthTitle?: string;
    weekDay?: string;
    dayCell?: string;
    todayButton?: string;
  };

  // 높이 설정
  height?: number | "auto" | string;
  autoHeight?: {
    topOffset?: number; // 상단 여백 (기본: 0)
    bottomOffset?: number; // 하단 여백 (기본: 20)
    minHeight?: number; // 최소 높이 (기본: 400)
    maxHeight?: number; // 최대 높이 (기본: window.innerHeight)
  };

  // 디버그 옵션
  debug?:
    | boolean
    | {
        enabled?: boolean; // 로그 활성화/비활성화 (기본: false)
        level?: "error" | "warn" | "info" | "debug"; // 로그 레벨 (기본: 'error')
        showPerformance?: boolean; // 성능 로그 표시 (기본: false)
      };

  // 기타 UI 옵션
  initialDate?: Date;
}
```

## API Reference

### Props

| Prop                    | Type                                                                               | Default   | Description                 |
| ----------------------- | ---------------------------------------------------------------------------------- | --------- | --------------------------- |
| `events`                | `CalendarEvent[]`                                                                  | `[]`      | 정적 이벤트 배열            |
| `holidays`              | `Holiday[]`                                                                        | `[]`      | 커스텀 공휴일 배열          |
| `holidayServiceKey`     | `string`                                                                           | -         | 공휴일 API 키 (한국만 해당) |
| `dynamicEvents`         | `(startDate: Date, endDate: Date) => Promise<any[]>`                               | -         | 동적 이벤트 로딩 함수       |
| `dynamicEventMapping`   | `object`                                                                           | -         | API 응답 필드 매핑          |
| `dynamicEventTransform` | `(apiData: any) => CalendarEvent`                                                  | -         | 커스텀 데이터 변환 함수     |
| `onDynamicEventLoad`    | `(startDate: Date, endDate: Date, events: CalendarEvent[]) => void`                | -         | 동적 이벤트 로드 완료 콜백  |
| `onDayAction`           | `(date: Date, dayInfo?: { events: CalendarEvent[], holidays: Holiday[] }) => void` | -         | 날짜 클릭 시 콜백           |
| `onEventClick`          | `(event: CalendarEvent) => void`                                                   | -         | 이벤트 클릭 시 콜백         |
| `locale`                | `string`                                                                           | `'ko-KR'` | 로케일 설정                 |
| `options`               | `CalendarOptions`                                                                  | -         | UI/스타일 옵션              |

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
