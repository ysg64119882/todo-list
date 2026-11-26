import React, { useState, useRef } from 'react';
import { useTodos } from './hooks/useTodos';
import { Header } from './components/Header';
import { TodoInput } from './components/TodoInput';
import { TodoFilter } from './components/TodoFilter';
import { TodoList } from './components/TodoList';
import { TodoSummary } from './components/TodoSummary';
import { ConfirmDialog } from './components/ConfirmDialog';
import { UndoSnackbar } from './components/UndoSnackbar';
import { StorageAlert } from './components/StorageAlert';
import './styles/app.css';

export const App: React.FC = () => {
  const {
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
  } = useTodos();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const triggerBtnRef = useRef<HTMLElement | null>(null);

  const handleOpenConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerBtnRef.current = e.currentTarget;
    setIsConfirmOpen(true);
  };

  const handleConfirmClear = () => {
    clearCompleted();
    setIsConfirmOpen(false);
  };

  const handleFocusInput = () => {
    const input = document.querySelector('input.todo-input') as HTMLInputElement | null;
    input?.focus();
  };

  const handleResetSearch = () => {
    setSearchQuery('');
  };

  const handleResetFilter = () => {
    setFilter('all');
    setSearchQuery('');
    setLastAddedHidden(false);
  };

  return (
    <main className="app-container">
      <div className="todo-card">
        {/* 스토리지 에러 안내 */}
        <StorageAlert
          storageStatus={storageStatus}
          onDismiss={clearStorageError}
        />

        {/* 헤더 및 진행률 */}
        <Header
          total={stats.total}
          completed={stats.completed}
          rate={stats.rate}
        />

        {/* 할 일 입력 */}
        <TodoInput onAdd={addTask} />

        {/* 새 항목이 현재 필터로 인해 가려졌을 때 안내 */}
        {lastAddedHidden && (
          <aside className="hidden-item-alert" role="status">
            <span>할 일을 추가했어요. 현재 조건에서는 보이지 않습니다.</span>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ padding: '4px 8px', minHeight: 'auto', minWidth: 'auto', fontWeight: 'bold' }}
              onClick={handleResetFilter}
            >
              전체 보기
            </button>
          </aside>
        )}

        {/* 필터 및 검색 */}
        <TodoFilter
          currentFilter={filter}
          onFilterChange={(f) => {
            setFilter(f);
            setLastAddedHidden(false);
          }}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setLastAddedHidden(false);
          }}
          totalFilteredCount={filteredTasks.length}
        />

        {/* 할 일 목록 */}
        <TodoList
          tasks={filteredTasks}
          totalTasksCount={tasks.length}
          currentFilter={filter}
          searchQuery={searchQuery}
          onToggle={toggleTask}
          onUpdate={updateTaskText}
          onDelete={deleteTask}
          onResetSearch={handleResetSearch}
          onResetFilter={handleResetFilter}
          onFocusInput={handleFocusInput}
        />

        {/* 하단 요약 및 완료 삭제 버튼 */}
        <TodoSummary
          remainingCount={stats.remaining}
          completedCount={stats.completed}
          storageStatus={storageStatus}
          onRequestClearCompleted={handleOpenConfirm}
        />
      </div>

      {/* 실행 취소 스낵바 */}
      {deletedSnapshot && (
        <UndoSnackbar
          onUndo={undoDelete}
          onDismiss={dismissUndo}
        />
      )}

      {/* 일괄 삭제 확인 모달 */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        count={stats.completed}
        onConfirm={handleConfirmClear}
        onCancel={() => setIsConfirmOpen(false)}
        triggerElement={triggerBtnRef.current}
      />
    </main>
  );
};

export default App;
