import React from 'react';
import { FilterType } from '../types/todo';

interface TodoFilterProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalFilteredCount: number;
}

export const TodoFilter: React.FC<TodoFilterProps> = ({
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  totalFilteredCount,
}) => {
  return (
    <div className="filter-search-container" role="search" aria-label="할 일 필터 및 검색">
      <div className="filter-group" role="group" aria-label="할 일 완료 상태 필터">
        <button
          type="button"
          className="filter-btn"
          aria-pressed={currentFilter === 'all'}
          onClick={() => onFilterChange('all')}
        >
          전체
        </button>
        <button
          type="button"
          className="filter-btn"
          aria-pressed={currentFilter === 'active'}
          onClick={() => onFilterChange('active')}
        >
          진행 중
        </button>
        <button
          type="button"
          className="filter-btn"
          aria-pressed={currentFilter === 'completed'}
          onClick={() => onFilterChange('completed')}
        >
          완료
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder="할 일 검색"
          aria-label="할 일 검색"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear-btn"
            aria-label="검색어 초기화"
            onClick={() => onSearchChange('')}
          >
            ✕
          </button>
        )}
      </div>

      {searchQuery && (
        <span className="filter-status-hint" aria-live="polite">
          검색 결과 {totalFilteredCount}개
        </span>
      )}
    </div>
  );
};
