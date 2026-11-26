/**
 * 한국어 날짜 포맷 (예: 2026년 11월 26일 목요일)
 */
export function formatCurrentDateKorean(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date);
}
