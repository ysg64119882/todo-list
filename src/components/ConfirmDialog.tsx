import React, { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
  triggerElement: HTMLElement | null;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  count,
  onConfirm,
  onCancel,
  triggerElement,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      // 열릴 때 취소 버튼에 포커스
      cancelBtnRef.current?.focus();
    } else {
      if (dialog.open) {
        dialog.close();
      }
      // 닫힐 때 호출한 엘리먼트로 포커스 복귀 (disabled되었으면 본문 또는 컨테이너)
      if (triggerElement && !triggerElement.hasAttribute('disabled')) {
        triggerElement.focus();
      } else {
        const fallback = document.querySelector('input.todo-input') as HTMLElement | null;
        fallback?.focus();
      }
    }
  }, [isOpen, triggerElement]);

  // Esc 키 또는 배경 클릭 시 닫기
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onCancel();
    }
  };

  const handleCancelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      onClick={handleDialogClick}
      onKeyDown={handleCancelKeyDown}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div className="dialog-content">
        <h2 id="confirm-dialog-title" className="dialog-title">
          완료한 할 일을 삭제할까요?
        </h2>
        <p id="confirm-dialog-desc" className="dialog-desc">
          완료한 할 일 {count}개가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>
        <div className="dialog-actions">
          <button
            ref={cancelBtnRef}
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className="btn btn-destructive-solid"
            onClick={onConfirm}
          >
            {count}개 삭제
          </button>
        </div>
      </div>
    </dialog>
  );
};
