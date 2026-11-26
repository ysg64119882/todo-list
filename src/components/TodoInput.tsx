import React, { useState, useRef } from 'react';

interface TodoInputProps {
  onAdd: (text: string) => boolean;
}

export const TodoInput: React.FC<TodoInputProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed) {
      setErrorMsg('할 일을 입력해 주세요.');
      inputRef.current?.focus();
      return;
    }

    if (trimmed.length > 200) {
      setErrorMsg('할 일은 최대 200자까지 입력할 수 있습니다.');
      inputRef.current?.focus();
      return;
    }

    const success = onAdd(trimmed);
    if (success) {
      setText('');
      setErrorMsg('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 한글 IME 조합 중 Enter 방어 (실제 브라우저 및 jsdom 환경 대응)
    const isComposing =
      Boolean(e.nativeEvent?.isComposing) ||
      Boolean((e as unknown as { isComposing?: boolean }).isComposing) ||
      e.keyCode === 229;

    if (isComposing) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length <= 200) {
      setText(val);
      if (errorMsg) setErrorMsg('');
    }
  };

  return (
    <form className="todo-input-form" onSubmit={handleSubmit} noValidate>
      <div className="input-row">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className={`todo-input ${errorMsg ? 'input-error' : ''}`}
            placeholder="어떤 일을 할 예정인가요?"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={200}
            aria-label="새 할 일"
            aria-invalid={!!errorMsg}
            aria-describedby={errorMsg ? 'todo-input-error' : undefined}
          />
          {text.length > 0 && (
            <span className="input-counter" aria-hidden="true">
              {text.length}/200
            </span>
          )}
        </div>
        <button type="submit" className="btn btn-primary" aria-label="할 일 추가">
          추가
        </button>
      </div>
      {errorMsg && (
        <p id="todo-input-error" className="input-error-msg" role="alert">
          {errorMsg}
        </p>
      )}
    </form>
  );
};
