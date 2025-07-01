# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-07-01

### 🚀 Added
- **자동 높이 조정**: 캘린더가 화면 크기에 맞게 자동으로 높이 조정
- **스마트 클릭 제어**: 과거 날짜는 이벤트가 있는 날만 클릭 가능

### 🔧 Changed  
- **공휴일 캐시 최적화**: 필요한 월만 조회하여 API 호출 횟수 대폭 감소
- **성능 로그 개선**: 월 변경 시 로그 출력 최적화

### 🐛 Fixed
- 자동 높이 계산 무한 루프 문제 해결
- 월 변경 시 과도한 공휴일 캐시 로그 문제 해결
- 과거 날짜 클릭 정책 일관성 문제 해결

### 🧹 Removed
- 프로덕션 환경에서 불필요한 console.log 제거

### 📱 Mobile Optimizations
- 터치 인터페이스 개선
- 자동 높이 계산으로 모바일 화면 활용도 향상
- 불필요한 스크롤 영역 제거

### 💡 Usage Example
```jsx
<InfiniteCalendar
  events={events}
  options={{
    autoHeight: {
      bottomOffset: 56, // 하단 여백 조정
    },
    debug: {
      enabled: false, // 프로덕션에서는 false
    }
  }}
  onDayAction={(date) => {
    // 과거 날짜는 이벤트가 있는 날만 호출됨
    console.log('날짜 클릭:', date)
  }}
/>
```

### 🔄 Migration Guide
v1.0.x에서 v1.1.0으로 업그레이드 시 **별도 변경사항 없음** - 하위 호환성 보장

---

## [1.0.2] - 2025-06-30

### 🐛 Fixed
- useAutoHeight 무한 실행 문제 해결

## [1.0.1] - 2025-06-30

### 🔧 Changed
- 버전 번호 수정

## [1.0.0] - 2025-06-30

### 🚀 Added
- 초기 릴리즈
- 무한 스크롤 캘린더 컴포넌트
- 한국 공휴일 지원
- 모바일 최적화
- TypeScript 지원