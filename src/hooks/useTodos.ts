import { useState, useMemo, useCallback } from 'react';
import { Task, FilterType, DeletedTaskSnapshot } from '../types/todo';
import { useStorage } from './useStorage';

export function useTodos() {
  const { tasks, setTasks, storageStatus, clearStorageError } = useStorage();

  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletedSnapshot, setDeletedSnapshot] = useState<DeletedTaskSnapshot | null>(null);
  const [lastAddedHidden, setLastAddedHidden] = useState<boolean>(false);

  // 할 일 추가
  const addTask = useCallback((rawText: string): boolean => {
    const text = rawText.trim();
    if (!text || text.length > 200) {
      return false;
    }

    const now = new Date().toISOString();
    const newTask: Task = {
      id: crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    setTasks(prev => [newTask, ...prev]);

    // 현재 필터/검색 조건으로 인해 보이지 않는지 검사
    const willBeFilteredOut =
      filter === 'completed' ||
      (searchQuery.trim() !== '' && !text.toLowerCase().includes(searchQuery.trim().toLowerCase()));

    setLastAddedHidden(willBeFilteredOut);
    return true;
  }, [filter, searchQuery, setTasks]);

  // 완료 상태 토글
  const toggleTask = useCallback((id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );
  }, [setTasks]);

  // 할 일 내용 수정
  const updateTaskText = useCallback((id: string, newRawText: string): boolean => {
    const trimmed = newRawText.trim();
    if (!trimmed || trimmed.length > 200) {
      return false;
    }

    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              text: trimmed,
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );
    return true;
  }, [setTasks]);

  // 개별 삭제
  const deleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const index = prev.findIndex(t => t.id === id);
      if (index === -1) return prev;
      const target = prev[index];
      // 실행 취소 스냅샷 저장
      setDeletedSnapshot({ task: target, index });
      return prev.filter(t => t.id !== id);
    });
  }, [setTasks]);

  // 실행 취소 (원래 위치 및 데이터 복원)
  const undoDelete = useCallback(() => {
    if (!deletedSnapshot) return;
    const { task, index } = deletedSnapshot;

    setTasks(prev => {
      // 이미 같은 ID가 존재하지 않는지 확인
      if (prev.some(t => t.id === task.id)) return prev;
      const copy = [...prev];
      const insertIndex = Math.min(index, copy.length);
      copy.splice(insertIndex, 0, task);
      return copy;
    });

    setDeletedSnapshot(null);
  }, [deletedSnapshot, setTasks]);

  // 스낵바 닫기
  const dismissUndo = useCallback(() => {
    setDeletedSnapshot(null);
  }, []);

  // 완료 항목 일괄 삭제
  const clearCompleted = useCallback(() => {
    setTasks(prev => prev.filter(task => !task.completed));
  }, [setTasks]);

  // 필터 및 검색 적용된 목록 계산
  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tasks.filter(task => {
      // 1. 상태 필터
      if (filter === 'active' && task.completed) return false;
      if (filter === 'completed' && !task.completed) return false;

      // 2. 검색어 필터
      if (query && !task.text.toLowerCase().includes(query)) {
        return false;
      }

      return true;
    });
  }, [tasks, filter, searchQuery]);

  // 현황 수치 계산
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const remaining = total - completed;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, remaining, rate };
  }, [tasks]);

  return {
    tasks,
    filteredTasks,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    stats,
    deletedSnapshot,
    lastAddedHidden,
    setLastAddedHidden,
    storageStatus,
    clearStorageError,
    addTask,
    toggleTask,
    updateTaskText,
    deleteTask,
    undoDelete,
    dismissUndo,
    clearCompleted,
  };
}
