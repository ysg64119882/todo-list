import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';

describe('App 통합 및 접근성 테스트', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('초기 렌더링 시 빈 상태와 진행률 0%를 안전하게 표시한다 (ZeroDivisionError 방지)', () => {
    render(<App />);

    expect(screen.getByText('나의 할 일')).toBeInTheDocument();
    expect(screen.getByText('아직 할 일이 없어요')).toBeInTheDocument();

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('할 일 추가 시 앞뒤 공백을 제거하고 최신 항목을 상단에 표시한다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    const addButton = screen.getByRole('button', { name: '할 일 추가' });

    await user.type(input, '  공백 제거 테스트  ');
    await user.click(addButton);

    expect(screen.getByText('공백 제거 테스트')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('빈 문자열 등록 시 오류 메시지와 aria-invalid를 표시한다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const addButton = screen.getByRole('button', { name: '할 일 추가' });
    await user.click(addButton);

    const errorMsg = screen.getByText('할 일을 입력해 주세요.');
    expect(errorMsg).toBeInTheDocument();

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('한글 IME 조합 중(isComposing: true) Enter 키는 제출을 막는다', () => {
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    fireEvent.change(input, { target: { value: '한글입력' } });

    // isComposing = true 인 Enter 이벤트
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true, keyCode: 229 });

    // 아직 제출되지 않아 목록에 없어야 함
    expect(screen.queryByText('한글입력')).not.toBeInTheDocument();

    // isComposing = false 인 Enter 이벤트
    fireEvent.keyDown(input, { key: 'Enter', isComposing: false, keyCode: 13 });

    // 이제 정상 등록됨
    expect(screen.getByText('한글입력')).toBeInTheDocument();
  });

  it('완료 체크박스 토글 시 취소선 스타일과 통계가 갱신된다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    await user.type(input, '체크박스 테스트{enter}');

    const checkbox = screen.getByRole('checkbox', { name: /체크박스 테스트/ });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(screen.getByText('1 / 1 완료 (100%)')).toBeInTheDocument();
  });

  it('수정 버튼 클릭 후 내용 편집 및 Enter 저장/Esc 취소가 정상 동작한다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    await user.type(input, '수정할 항목{enter}');

    const editBtn = screen.getByTitle('수정');
    await user.click(editBtn);

    const editInput = screen.getByLabelText('할 일 내용 수정');
    await user.clear(editInput);
    await user.type(editInput, '수정 완료{enter}');

    expect(screen.getByText('수정 완료')).toBeInTheDocument();
  });

  it('개별 삭제 시 실행 취소 스낵바가 표시되고 원래 항목으로 복원된다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    await user.type(input, '삭제할 항목{enter}');

    const deleteBtn = screen.getByTitle('삭제');
    await user.click(deleteBtn);

    expect(screen.queryByText('삭제할 항목')).not.toBeInTheDocument();
    expect(screen.getByText('할 일을 삭제했어요.')).toBeInTheDocument();

    const undoBtn = screen.getByRole('button', { name: '삭제한 할 일 복원하기' });
    await user.click(undoBtn);

    expect(screen.getByText('삭제할 항목')).toBeInTheDocument();
  });

  it('완료 항목 일괄 삭제 버튼 클릭 시 확인 다이얼로그가 뜨고 취소/삭제가 동작한다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    await user.type(input, '완료 1{enter}');
    await user.type(input, '완료 2{enter}');

    const check1 = screen.getByRole('checkbox', { name: /완료 1/ });
    const check2 = screen.getByRole('checkbox', { name: /완료 2/ });
    await user.click(check1);
    await user.click(check2);

    const clearBtn = screen.getByRole('button', { name: /일괄 삭제/ });
    await user.click(clearBtn);

    expect(screen.getByText('완료한 할 일을 삭제할까요?')).toBeInTheDocument();
    expect(screen.getByText('완료한 할 일 2개가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.')).toBeInTheDocument();

    // 취소 클릭
    const cancelBtn = screen.getByRole('button', { name: '취소' });
    await user.click(cancelBtn);

    expect(screen.getByText('완료 1')).toBeInTheDocument();
    expect(screen.getByText('완료 2')).toBeInTheDocument();

    // 다시 열고 확인 삭제 클릭
    await user.click(clearBtn);
    const confirmDeleteBtn = screen.getByRole('button', { name: '2개 삭제' });
    await user.click(confirmDeleteBtn);

    expect(screen.queryByText('완료 1')).not.toBeInTheDocument();
    expect(screen.queryByText('완료 2')).not.toBeInTheDocument();
  });
});
