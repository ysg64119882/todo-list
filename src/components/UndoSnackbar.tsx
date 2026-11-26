import React from 'react';

interface UndoSnackbarProps {
  onUndo: () => void;
  onDismiss: () => void;
}

export const UndoSnackbar: React.FC<UndoSnackbarProps> = ({
  onUndo,
  onDismiss,
}) => {
  return (
    <div className="undo-snackbar" role="status" aria-live="polite">
      <span className="undo-text">할 일을 삭제했어요.</span>
      <div className="undo-actions">
        <button
          type="button"
          className="btn-undo"
          onClick={onUndo}
          aria-label="삭제한 할 일 복원하기"
        >
          실행 취소
        </button>
        <button
          type="button"
          className="btn-undo-close"
          onClick={onDismiss}
          aria-label="알림 닫기"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
