import React from 'react';
import { Task, FilterType } from '../types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  tasks: Task[];
  totalTasksCount: number;
  currentFilter: FilterType;
  searchQuery: string;
  onToggle: (id: string) => void;
  onUpdate: (id: string, newText: string) => boolean;
  onDelete: (id: string) => void;
  onResetSearch: () => void;
  onResetFilter: () => void;
  onFocusInput: () => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  tasks,
  totalTasksCount,
  currentFilter,
  searchQuery,
  onToggle,
  onUpdate,
  onDelete,
  onResetSearch,
  onResetFilter,
  onFocusInput,
}) => {
  // 빈 상태 렌더링
  if (tasks.length === 0) {
    // 1. 전체 할 일이 없을 때
    if (totalTasksCount === 0) {
      return (
        <section className="empty-state" aria-label="할 일 목록 비어있음">
          <p className="empty-state-title">아직 할 일이 없어요</p>
          <p className="empty-state-desc">첫 할 일을 입력해 보세요.</p>
          <button type="button" className="btn btn-secondary" onClick={onFocusInput}>
            할 일 추가하러 가기
          </button>
        </section>
      );
    }

    // 2. 검색어가 있어서 검색 결과가 없을 때
    if (searchQuery.trim().length > 0) {
      return (
        <section className="empty-state" aria-label="검색 결과 없음">
          <p className="empty-state-title">일치하는 할 일이 없어요</p>
          <p className="empty-state-desc">다른 검색어로 검색해 보거나 검색어를 초기화하세요.</p>
          <button type="button" className="btn btn-secondary" onClick={onResetSearch}>
            검색어 초기화
          </button>
        </section>
      );
    }

    // 3. 필터 조건에 맞는 결과가 없을 때
    if (currentFilter === 'active') {
      return (
        <section className="empty-state" aria-label="진행 중인 할 일 없음">
          <p className="empty-state-title">진행 중인 할 일이 없어요</p>
          <p className="empty-state-desc">모든 할 일을 완료했거나 새로운 할 일을 추가해 보세요.</p>
          <button type="button" className="btn btn-secondary" onClick={onResetFilter}>
            전체 보기
          </button>
        </section>
      );
    }

    if (currentFilter === 'completed') {
      return (
        <section className="empty-state" aria-label="완료한 할 일 없음">
          <p className="empty-state-title">아직 완료한 할 일이 없어요</p>
          <p className="empty-state-desc">할 일을 완료하면 여기에 표시됩니다.</p>
          <button type="button" className="btn btn-secondary" onClick={onResetFilter}>
            전체 보기
          </button>
        </section>
      );
    }

    return (
      <section className="empty-state" aria-label="조건에 맞는 할 일 없음">
        <p className="empty-state-title">이 조건에 맞는 할 일이 없어요</p>
        <button type="button" className="btn btn-secondary" onClick={onResetFilter}>
          전체 보기
        </button>
      </section>
    );
  }

  return (
    <section className="todo-list-section" aria-label="할 일 목록">
      <ul className="todo-list">
        {tasks.map((task) => (
          <TodoItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </section>
  );
};
