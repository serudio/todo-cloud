import type { FormEvent } from "react";

type TopBarProps = {
  email: string | undefined;
  isLoadingTodos: boolean;
  text: string;
  onAddTodo: (event: FormEvent<HTMLFormElement>) => void;
  onSignOut: () => void;
  onTextChange: (text: string) => void;
};

export function TopBar({
  email,
  isLoadingTodos,
  text,
  onAddTodo,
  onSignOut,
  onTextChange,
}: TopBarProps) {
  return (
    <header className="topbar">
      <h1>Turn tasks into a tag cloud.</h1>
      <div className="topbar-center">
        <form className="todo-form" onSubmit={onAddTodo}>
          <input
            aria-label="New todo"
            disabled={isLoadingTodos}
            placeholder="Add a task"
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
          />
        </form>
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
