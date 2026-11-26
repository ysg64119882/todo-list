import { StorageData, Task } from '../types/todo';

export const STORAGE_KEY = 'todo-app:v1';
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * 객체가 유효한 Task인지 검증
 */
export function isValidTask(obj: unknown): obj is Task {
  if (typeof obj !== 'object' || obj === null) return false;
  const t = obj as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    t.id.trim().length > 0 &&
    typeof t.text === 'string' &&
    typeof t.completed === 'boolean' &&
    typeof t.createdAt === 'string' &&
    !isNaN(Date.parse(t.createdAt)) &&
    typeof t.updatedAt === 'string' &&
    !isNaN(Date.parse(t.updatedAt))
  );
}

/**
 * 스토리지 페이로드 유효성 검증
 */
export function validateStorageData(data: unknown): StorageData {
  if (typeof data !== 'object' || data === null) {
    throw new Error('저장 데이터가 올바른 객체 형식이 아닙니다.');
  }

  const record = data as Record<string, unknown>;
  if (typeof record.schemaVersion !== 'number') {
    throw new Error('스키마 버전 정보가 누락되었거나 유효하지 않습니다.');
  }

  if (record.schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `지원하지 않는 상위 스키마 버전입니다 (v${record.schemaVersion}). 데이터 보호를 위해 로드를 중단합니다.`
    );
  }

  if (!Array.isArray(record.tasks)) {
    throw new Error('할 일 목록이 배열 형식이 아닙니다.');
  }

  const validTasks: Task[] = [];
  const seenIds = new Set<string>();

  for (const item of record.tasks) {
    if (!isValidTask(item)) {
      throw new Error('할 일 데이터 중 필수 필드가 누락되었거나 형식이 잘못된 항목이 있습니다.');
    }
    if (seenIds.has(item.id)) {
      throw new Error(`중복된 할 일 ID(${item.id})가 발견되었습니다.`);
    }
    seenIds.add(item.id);
    validTasks.push(item);
  }

  return {
    schemaVersion: record.schemaVersion,
    tasks: validTasks,
  };
}

/**
 * localStorage에서 데이터 로드
 */
export function loadFromLocalStorage(): { data: StorageData | null; error: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { data: null, error: null };
    }
    const parsed = JSON.parse(raw);
    const validated = validateStorageData(parsed);
    return { data: validated, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 스토리지 읽기 오류';
    return { data: null, error: message };
  }
}

/**
 * localStorage에 데이터 저장
 */
export function saveToLocalStorage(tasks: Task[]): { success: boolean; error: string | null } {
  try {
    const payload: StorageData = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      tasks,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : '스토리지 저장 실패';
    return { success: false, error: message };
  }
}
