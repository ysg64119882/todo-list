import React from 'react';
import { formatCurrentDateKorean } from '../lib/date';

interface HeaderProps {
  total: number;
  completed: number;
  rate: number;
}

export const Header: React.FC<HeaderProps> = ({ total, completed, rate }) => {
  const currentDate = formatCurrentDateKorean();

  return (
    <header className="app-header">
      <div className="header-top">
        <h1 className="app-title">나의 할 일</h1>
        <time className="header-date" dateTime={new Date().toISOString().split('T')[0]}>
          {currentDate}
        </time>
      </div>
      <p className="header-subtitle">작은 실천으로 채우는 하루</p>

      <section className="progress-section" aria-label="할 일 진행 현황">
        <div className="progress-info">
          <span>진행률</span>
          <span className="progress-stats">
            {completed} / {total} 완료 ({rate}%)
          </span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={rate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`할 일 총 ${total}개 중 ${completed}개 완료, 진행률 ${rate}%`}
        >
          <div className="progress-bar" style={{ width: `${rate}%` }} />
        </div>
      </section>
    </header>
  );
};
