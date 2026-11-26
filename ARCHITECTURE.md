# TodoList 웹앱 아키텍처 및 설계 문서

## 1. 기술 스택 및 구조
- **UI 라이브러리**: React 18 + TypeScript
- **빌더/번들러**: Vite
- **테스트 환경**: Vitest + Testing Library (@testing-library/react, @testing-library/jest-dom, @testing-library/user-event)
- **스타일링**: CSS Custom Properties 기반 디자인 토큰 (`DESIGN.md` 단일 원천) 및 CSS Modules / 시맨틱 CSS
- **상태 관리**: React `useReducer` 및 Custom Hooks (`useTodos`, `useStorage`) 기반의 명확한 단방향 데이터 흐름

## 2. 디렉터리 구조
```
src/
├── components/          # 시맨틱 UI 컴포넌트
│   ├── Header.tsx       # 타이틀, 날짜, 현황 및 진행률 막대
│   ├── TodoInput.tsx    # 할 일 추가 입력 폼 (IME 대응, 유효성 검사)
│   ├── TodoFilter.tsx   # 상태 필터 (전체/진행 중/완료) 및 검색
│   ├── TodoList.tsx     # 목록 렌더링 컨테이너
│   ├── TodoItem.tsx     # 개별 할 일 (체크, 인라인 수정, 삭제)
│   ├── TodoSummary.tsx  # 하단 요약 및 완료 항목 일괄 삭제 버튼
│   ├── ConfirmDialog.tsx# 완료 항목 일괄 삭제 확인 모달 (<dialog>)
│   ├── UndoSnackbar.tsx # 개별 삭제 실행 취소 알림
│   └── StorageAlert.tsx # 스토리지 오류/경고 알림 배너
├── hooks/
│   ├── useTodos.ts      # 할 일 CRUD, 필터링, 검색, 실행 취소 비즈니스 로직
│   └── useStorage.ts    # localStorage 읽기/쓰기, 스키마 검증, 예외 처리
├── types/
│   └── todo.ts          # Task 데이터 모델, 스토리지 스키마, 필터 타입
├── lib/
│   ├── storage.ts       # 스토리지 직렬화, 역직렬화 및 유효성 검증 함수
│   └── date.ts          # 한국어 날짜 포맷팅 유틸
├── styles/
│   ├── tokens.css       # DESIGN.md 기반 CSS custom properties
│   └── app.css          # 글로벌 스타일, 반응형 레이아웃, 포커스/접근성 스타일
├── test/
│   └── setup.ts         # Vitest 설정 및 jest-dom 매처 등록
├── App.tsx              # 메인 애플리케이션 컴포넌트
└── main.tsx             # 앱 진입점
```

## 3. 데이터 모델
```typescript
export interface Task {
  id: string;            // 고유 식별자 (crypto.randomUUID)
  text: string;          // 할 일 내용 (최대 200자)
  completed: boolean;    // 완료 여부
  createdAt: string;     // 생성 일시 (ISO 8601)
  updatedAt: string;     // 수정 일시 (ISO 8601)
}

export interface StorageData {
  schemaVersion: number; // 1
  tasks: Task[];
}
```

## 4. 핵심 설계 원칙
1. **단일 원천 상태(Single Source of Truth)**: 전체 목록 `tasks`와 UI 필터/검색 상태는 분리되며, 파생 상태(남은 개수, 완료 개수, 필터링된 목록)는 순수 계산으로 도출.
2. **복원 가능한 삭제**: 개별 삭제 시 항목의 원래 인덱스와 데이터를 스택/슬롯에 보관하여 "실행 취소" 시 정확한 위치로 복구.
3. **사용자 경험 & 접근성**:
   - 한글 IME 입력 중 Enter 키 오동작 방지
   - 키보드 포커스 제어 및 복귀 관리
   - WAI-ARIA 랜드마크와 시맨틱 HTML5
