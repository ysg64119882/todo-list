import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types/todo';

interface TodoItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, newText: string) => boolean;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  task,
  onToggle,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editError, setEditError] = useState('');

  const editInputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  // 편집 시작 시 포커스 이동
  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditText(task.text);
    setEditError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(task.text);
    setEditError('');
    // 수정 버튼으로 포커스 복귀
    setTimeout(() => editButtonRef.current?.focus(), 0);
  };

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (!trimmed) {
      setEditError('할 일 내용을 입력해 주세요.');
      editInputRef.current?.focus();
      return;
    }

    if (trimmed.length > 200) {
      setEditError('할 일은 최대 200자까지 입력할 수 있습니다.');
      editInputRef.current?.focus();
      return;
    }

    const success = onUpdate(task.id, trimmed);
    if (success) {
      setIsEditing(false);
      setEditError('');
      setTimeout(() => editButtonRef.current?.focus(), 0);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
    <li className={`todo-item ${task.completed ? 'completed' : ''}`}>
      <div className="todo-checkbox-wrapper">
        <input
          type="checkbox"
          id={`todo-check-${task.id}`}
          className="todo-checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={`'${task.text}' 완료 상태 전환`}
        />
      </div>

      {isEditing ? (
        <div className="edit-form">
          <input
            ref={editInputRef}
            type="text"
            className={`edit-input ${editError ? 'input-error' : ''}`}
            value={editText}
            onChange={(e) => {
              setEditText(e.target.value);
              if (editError) setEditError('');
            }}
            onKeyDown={handleEditKeyDown}
            maxLength={200}
            aria-label="할 일 내용 수정"
            aria-invalid={!!editError}
          />
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={handleSaveEdit}
            aria-label="수정 내용 저장"
            title="저장"
          >
            ✓
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={handleCancelEdit}
            aria-label="수정 취소"
            title="취소"
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <label
            htmlFor={`todo-check-${task.id}`}
            className="todo-text-wrapper"
          >
            <span className="todo-text">{task.text}</span>
          </label>

          <div className="todo-actions">
            <button
              ref={editButtonRef}
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={handleStartEdit}
              aria-label={`'${task.text}' 수정`}
              title="수정"
            >
              ✎
            </button>
            <button
              type="button"
              className="btn btn-destructive btn-icon"
              onClick={() => onDelete(task.id)}
              aria-label={`'${task.text}' 삭제`}
              title="삭제"
            >
              🗑
            </button>
          </div>
        </>
      )}
    </li>
  );
};
