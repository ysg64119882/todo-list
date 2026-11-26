import { useState, useEffect, useCallback, useRef } from 'react';
import { Task, StorageStatus } from '../types/todo';
import { loadFromLocalStorage, saveToLocalStorage } from '../lib/storage';

export function useStorage(initialTasks: Task[] = []) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const { data } = loadFromLocalStorage();
    return data ? data.tasks : initialTasks;
  });

  const [storageStatus, setStorageStatus] = useState<StorageStatus>(() => {
    const { error } = loadFromLocalStorage();
    if (error) {
      return { state: 'error', message: `저장 데이터 오류: ${error}`, type: 'load' };
    }
    return { state: 'saved' };
  });

  const isInitialMount = useRef(true);

  // tasks 상태가 변할 때마다 localStorage에 자동 저장
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const { success, error } = saveToLocalStorage(tasks);
    if (!success) {
      setStorageStatus({
        state: 'error',
        message: error || '스토리지 저장 실패',
        type: 'save',
      });
    } else {
      setStorageStatus({ state: 'saved' });
    }
  }, [tasks]);

  const clearStorageError = useCallback(() => {
    setStorageStatus({ state: 'saved' });
  }, []);

  return {
    tasks,
    setTasks,
    storageStatus,
    clearStorageError,
  };
}
