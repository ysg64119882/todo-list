import React from 'react';
import { StorageStatus } from '../types/todo';

interface TodoSummaryProps {
  remainingCount: number;
  completedCount: number;
  storageStatus: StorageStatus;
  onRequestClearCompleted: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const TodoSummary: React.FC<TodoSummaryProps> = ({
  remainingCount,
  completedCount,
  storageStatus,
  onRequestClearCompleted,
}) => {
  const isStorageError = storageStatus.state === 'error';

  return (
    <footer className="todo-summary">
      <div className="summary-main">
        <span className="remaining-count" aria-live="polite">
          남은 할 일 {remainingCount}개
        </span>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onRequestClearCompleted}
          disabled={completedCount === 0}
          aria-label={`완료한 할 일 ${completedCount}개 일괄 삭제`}
        >
          완료 항목 삭제
        </button>
      </div>

      <div className={`summary-footer ${isStorageError ? 'storage-error-text' : ''}`}>
        {isStorageError ? (
          <span role="alert">
            {storageStatus.message} 창을 닫으면 변경 사항이 저장되지 않을 수 있습니다.
          </span>
        ) : (
          <span>이 브라우저에 자동 저장됩니다.</span>
        )}
      </div>
    </footer>
  );
};
