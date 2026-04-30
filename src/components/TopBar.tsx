import type { KeyboardEvent, RefObject } from "react";

type TopBarProps = {
  email: string | undefined;
  isEditingTodoListName: boolean;
  todoListName: string;
  todoListNameDraft: string;
  todoListNameInputRef: RefObject<HTMLInputElement | null>;
  onFinishEditingTodoListName: () => void;
  onSignOut: () => void;
  onStartEditingTodoListName: () => void;
  onTodoListNameDraftChange: (nextName: string) => void;
  onTodoListNameKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

export function TopBar({
  email,
  isEditingTodoListName,
  todoListName,
  todoListNameDraft,
  todoListNameInputRef,
  onFinishEditingTodoListName,
  onSignOut,
  onStartEditingTodoListName,
  onTodoListNameDraftChange,
  onTodoListNameKeyDown,
}: TopBarProps) {
  return (
    <header className="topbar">
      <h1>Turn tasks into a tag cloud.</h1>
      <div className="topbar-center">
        <p className="eyebrow editable-list-name">
          {isEditingTodoListName ? (
            <input
              ref={todoListNameInputRef}
              aria-label="Todo list name"
              value={todoListNameDraft}
              onBlur={onFinishEditingTodoListName}
              onChange={(event) =>
                onTodoListNameDraftChange(event.target.value)
              }
              onKeyDown={onTodoListNameKeyDown}
            />
          ) : (
            <button
              aria-label="Edit todo list name"
              type="button"
              onClick={onStartEditingTodoListName}
            >
              <span>{todoListName}</span>
              <span aria-hidden="true" className="edit-icon">
                <svg viewBox="0 0 20 20" focusable="false">
                  <path d="M4 13.5V16h2.5L14 8.5 11.5 6 4 13.5Zm11-6 1-1a1.4 1.4 0 0 0 0-2l-.5-.5a1.4 1.4 0 0 0-2 0l-1 1L15 7.5Z" />
                </svg>
              </span>
            </button>
          )}
        </p>
      </div>
      <div className="topbar-actions">
        <span>{email}</span>
        <button type="button" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </header>
  );
}
