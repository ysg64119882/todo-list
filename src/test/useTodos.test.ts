import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useTodos } from '../hooks/useTodos';

describe('useTodos 훅 비즈니스 로직 테스트', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('할 일 추가, 공백 차단, 200자 초과 차단 검증', () => {
    const { result } = renderHook(() => useTodos());

    // 정상 추가
    act(() => {
      const success = result.current.addTask('리액트 공부하기');
      expect(success).toBe(true);
    });
    expect(result.current.tasks.length).toBe(1);
    expect(result.current.tasks[0].text).toBe('리액트 공부하기');
    expect(result.current.tasks[0].completed).toBe(false);

    // 공백만 있는 입력 차단
    act(() => {
      const success = result.current.addTask('   ');
      expect(success).toBe(false);
    });
    expect(result.current.tasks.length).toBe(1);

    // 200자 초과 차단
    act(() => {
      const success = result.current.addTask('a'.repeat(201));
      expect(success).toBe(false);
    });
    expect(result.current.tasks.length).toBe(1);
  });

  it('완료/미완료 토글 및 현황 통계 계산 검증', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTask('할 일 1');
      result.current.addTask('할 일 2');
    });

    expect(result.current.stats.total).toBe(2);
    expect(result.current.stats.completed).toBe(0);
    expect(result.current.stats.remaining).toBe(2);
    expect(result.current.stats.rate).toBe(0);

    const task1Id = result.current.tasks[1].id;

    act(() => {
      result.current.toggleTask(task1Id);
    });

    expect(result.current.tasks.find(t => t.id === task1Id)?.completed).toBe(true);
    expect(result.current.stats.completed).toBe(1);
    expect(result.current.stats.remaining).toBe(1);
    expect(result.current.stats.rate).toBe(50);
  });

  it('수정 기능 검증 (공백 차단 및 취소선/completed 보존)', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTask('기존 내용');
    });

    const taskId = result.current.tasks[0].id;

    // 빈 내용 수정 시도 거부
    act(() => {
      const success = result.current.updateTaskText(taskId, '   ');
      expect(success).toBe(false);
    });
    expect(result.current.tasks[0].text).toBe('기존 내용');

    // 정상 수정
    act(() => {
      const success = result.current.updateTaskText(taskId, '수정된 내용');
      expect(success).toBe(true);
    });
    expect(result.current.tasks[0].text).toBe('수정된 내용');
  });

  it('삭제 및 실행 취소로 원래 인덱스 위치 복원 검증', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTask('A'); // index 2 (맨 밑)
      result.current.addTask('B'); // index 1 (중간)
      result.current.addTask('C'); // index 0 (맨 위)
    });

    // 목록 순서: C, B, A
    expect(result.current.tasks.map(t => t.text)).toEqual(['C', 'B', 'A']);

    // 중간 항목 'B' 삭제
    const bId = result.current.tasks[1].id;
    act(() => {
      result.current.deleteTask(bId);
    });

    expect(result.current.tasks.map(t => t.text)).toEqual(['C', 'A']);
    expect(result.current.deletedSnapshot?.task.text).toBe('B');

    // 실행 취소
    act(() => {
      result.current.undoDelete();
    });

    // 원래 중간 인덱스로 복원되었는지 확인
    expect(result.current.tasks.map(t => t.text)).toEqual(['C', 'B', 'A']);
  });

  it('연속 삭제 시 최신 삭제 1건만 복원 대상이 됨을 검증', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTask('1');
      result.current.addTask('2');
    });

    const id1 = result.current.tasks[1].id; // 1
    const id2 = result.current.tasks[0].id; // 2

    // 1 삭제 후 2 연속 삭제
    act(() => {
      result.current.deleteTask(id1);
    });
    act(() => {
      result.current.deleteTask(id2);
    });

    expect(result.current.deletedSnapshot?.task.id).toBe(id2);

    // 실행 취소 시 2가 복원됨
    act(() => {
      result.current.undoDelete();
    });

    expect(result.current.tasks.map(t => t.text)).toEqual(['2']);
  });

  it('필터와 검색어 교집합 필터링 검증', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTask('사과 사기');
      result.current.addTask('바나나 사기');
      result.current.addTask('사과 먹기');
    });

    // 사과 먹기 완료 처리
    const appleEatId = result.current.tasks.find(t => t.text === '사과 먹기')!.id;
    act(() => {
      result.current.toggleTask(appleEatId);
    });

    // 1. 검색어: '사과'
    act(() => {
      result.current.setSearchQuery('사과');
    });
    expect(result.current.filteredTasks.length).toBe(2);

    // 2. 검색어 '사과' + 상태 필터 'completed'
    act(() => {
      result.current.setFilter('completed');
    });
    expect(result.current.filteredTasks.length).toBe(1);
    expect(result.current.filteredTasks[0].text).toBe('사과 먹기');

    // 3. 검색어 '사과' + 상태 필터 'active'
    act(() => {
      result.current.setFilter('active');
    });
    expect(result.current.filteredTasks.length).toBe(1);
    expect(result.current.filteredTasks[0].text).toBe('사과 사기');
  });

  it('완료 항목 일괄 삭제 검증', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTask('할 일 1');
      result.current.addTask('할 일 2');
    });

    act(() => {
      result.current.toggleTask(result.current.tasks[0].id);
    });

    expect(result.current.stats.completed).toBe(1);

    act(() => {
      result.current.clearCompleted();
    });

    expect(result.current.tasks.length).toBe(1);
    expect(result.current.stats.completed).toBe(0);
  });
});
