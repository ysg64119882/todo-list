import React from 'react';
import { StorageStatus } from '../types/todo';

interface StorageAlertProps {
  storageStatus: StorageStatus;
  onDismiss: () => void;
}

export const StorageAlert: React.FC<StorageAlertProps> = ({
  storageStatus,
  onDismiss,
}) => {
  if (storageStatus.state !== 'error') return null;

  return (
    <div className="storage-alert-banner" role="alert">
      <span>{storageStatus.message}</span>
      <button
        type="button"
        className="btn-ghost"
        style={{ color: 'inherit', padding: '4px 8px', minHeight: 'auto', minWidth: 'auto' }}
        onClick={onDismiss}
        aria-label="스토리지 오류 알림 닫기"
      >
        닫기
      </button>
    </div>
  );
};
