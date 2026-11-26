import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateStorageData,
  loadFromLocalStorage,
  saveToLocalStorage,
  STORAGE_KEY,
  CURRENT_SCHEMA_VERSION,
} from '../lib/storage';

describe('Storage 단위 테스트', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('올바른 데이터 구조를 검증하고 통과시킨다', () => {
    const validData = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      tasks: [
        {
          id: '1',
          text: '공부하기',
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    const validated = validateStorageData(validData);
    expect(validated.tasks.length).toBe(1);
    expect(validated.tasks[0].text).toBe('공부하기');
  });

  it('상위 스키마 버전의 데이터는 로드를 거부하여 보호한다', () => {
    const futureData = {
      schemaVersion: 999,
      tasks: [],
    };

    expect(() => validateStorageData(futureData)).toThrow('지원하지 않는 상위 스키마 버전');
  });

  it('중복된 ID가 포함된 데이터는 에러를 발생시킨다', () => {
    const duplicateData = {
      schemaVersion: 1,
      tasks: [
        {
          id: 'dup-id',
          text: '1',
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'dup-id',
          text: '2',
          completed: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    expect(() => validateStorageData(duplicateData)).toThrow('중복된 할 일 ID');
  });

  it('필수 필드가 누락된 항목이 있으면 거부한다', () => {
    const invalidItem = {
      schemaVersion: 1,
      tasks: [
        {
          id: 'item-1',
          // text 누락
          completed: false,
        },
      ],
    };

    expect(() => validateStorageData(invalidItem)).toThrow('필수 필드가 누락되었거나');
  });

  it('스토리지 저장 실패(예: QuotaExceededError 등)를 안전하게 처리하고 false를 반환한다', () => {
    const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });

    const result = saveToLocalStorage([]);
    expect(result.success).toBe(false);
    expect(result.error).toContain('QuotaExceeded');

    setItemSpy.mockRestore();
  });

  it('스토리지 로드 시 JSON 파싱 에러를 안전하게 처리하고 에러 메시지를 반환한다', () => {
    localStorage.setItem(STORAGE_KEY, '{ invalid json');
    const result = loadFromLocalStorage();
    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
  });
});
