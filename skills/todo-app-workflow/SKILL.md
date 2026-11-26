---
name: todo-app-workflow
description: TodoList 웹앱 개발, 접근성 검증 및 로컬 스토리지 안전성 관리 가이드
---

# TodoList 개발 및 검증 워크플로 스킬

이 스킬은 본 TodoList 웹앱의 요구사항, 디자인 명세(`DESIGN.md`), 접근성 가이드라인(WCAG 2.1 AA) 및 안전한 로컬 스토리지 관리를 준수하여 프로젝트를 개발·테스트·검증하는 표준 절차를 제공합니다.

## 1. 컴포넌트 개발 규칙
- **의미론적 마크업**: `<main>`, `<header>`, `<section>`, `<ul>`, `<li>`, `<button>`, `<input>`을 준수합니다.
- **접근성 속성**: 
  - 상태 필터: `aria-pressed`
  - 진행률: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext`
  - 에러 메시지: `aria-describedby`, `aria-invalid="true"`
  - 대화상자: `<dialog>` 요소, `aria-labelledby`, `aria-describedby`, 포커스 트랩 및 Esc 취소
  - 알림 영역: `role="status"`, `aria-live="polite"`
- **키보드 접근성**: 모든 주요 액션은 키보드로 접근 및 실행 가능해야 하며, 조작 후 포커스 유실이 없도록 포커스 복귀를 처리합니다.
- **IME 지원**: 한국어 자모 조합 중 Enter 키 입력 시 중복 등록되거나 저장이 조기 실행되지 않도록 `e.nativeEvent.isComposing`을 엄격히 검사합니다.

## 2. 데이터 저장소 및 안정성 원칙
- **스키마 버전 관리**: 키 `todo-app:v1`, 구조 `{ schemaVersion: 1, tasks: Task[] }`
- **유효성 검증**: JSON 파싱 실패 또는 필드 누락 시 기존 데이터를 덮어쓰지 않고 에러 상태를 표기하며 메모리 상태를 보존합니다.
- **저장 예외 처리**: `QuotaExceededError` 또는 권한 거부 시 사용자에게 알림을 제공하고 앱 사용을 지속할 수 있게 합니다.

## 3. 검증 체크리스트
- [ ] 입력값 전후 공백 제거 및 빈 문자열 차단
- [ ] 200자 제한
- [ ] 삭제 후 원래 위치 복원 실행 취소
- [ ] 전체 데이터 0개일 때 진행률 0% 안전 처리 (ZeroDivisionError 방지)
- [ ] 다이얼로그 포커스 관리 (진입, 유지, Esc, 복귀)
- [ ] 360px 모바일 및 반응형 가로 스크롤 없음
- [ ] 텍스트 대비 4.5:1 이상 충족
