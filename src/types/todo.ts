export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type FilterType = 'all' | 'active' | 'completed';

export interface StorageData {
  schemaVersion: number;
  tasks: Task[];
}

export interface DeletedTaskSnapshot {
  task: Task;
  index: number;
}

export type StorageStatus = 
  | { state: 'idle' }
  | { state: 'saved' }
  | { state: 'error'; message: string; type: 'load' | 'save' };
