import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Todo } from "../types/todo";
import { normalizeTodoText } from "../utils/todos";
import "./TopBar.css";

type TopBarProps = {
  email: string | undefined;
  isLoadingTodos: boolean;
  suggestedTodos: Todo[];
  text: string;
  onAddTodo: (event: FormEvent<HTMLFormElement>) => void;
  onAddTodoText: (text: string) => void;
  onRefresh: () => void;
  onSignOut: () => void;
  onTextChange: (text: string) => void;
};

export function TopBar({
  email,
  isLoadingTodos,
  suggestedTodos,
  text,
  onAddTodo,
  onAddTodoText,
  onRefresh,
  onSignOut,
  onTextChange,
}: TopBarProps) {
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const matchingTodos = useMemo(() => {
    const normalizedText = normalizeTodoText(text);
    if (!normalizedText) return [];

    return suggestedTodos
      .filter((todo) => normalizeTodoText(todo.text).includes(normalizedText))
      .slice(0, 6);
  }, [suggestedTodos, text]);
  const showSuggestions = isSuggestionsOpen && matchingTodos.length > 0;

  useEffect(() => {
    setActiveSuggestionIndex(0);
    setIsSuggestionsOpen(text.trim().length > 0);
  }, [text]);

  function selectSuggestion(todo: Todo) {
    onAddTodoText(todo.text);
    setActiveSuggestionIndex(0);
    setIsSuggestionsOpen(false);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsSuggestionsOpen(false);
      return;
    }

    if (matchingTodos.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsSuggestionsOpen(true);
      setActiveSuggestionIndex(
        (currentIndex) => (currentIndex + 1) % matchingTodos.length,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsSuggestionsOpen(true);
      setActiveSuggestionIndex(
        (currentIndex) =>
          (currentIndex - 1 + matchingTodos.length) % matchingTodos.length,
      );
      return;
    }

    if (event.key === "Enter" && showSuggestions) {
      event.preventDefault();
      selectSuggestion(matchingTodos[activeSuggestionIndex]);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setIsSuggestionsOpen(false);
    onAddTodo(event);
  }

  return (
    <>
      <header className="topbar">
        <h1>Turn tasks into a tag cloud.</h1>
        <div className="topbar-actions">
          <span>{email}</span>
          <button
            className="refresh-button"
            disabled={isLoadingTodos}
            title="Refresh"
            type="button"
            onClick={onRefresh}
          >
            <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
              <path d="M15.4 5.3A6.6 6.6 0 0 0 4.1 7.7l1.6.6a4.9 4.9 0 0 1 8.2-1.7l-1.8 1.8H17V3.5l-1.6 1.8Zm-10.8 9.4a6.6 6.6 0 0 0 11.3-2.4l-1.6-.6a4.9 4.9 0 0 1-8.2 1.7l1.8-1.8H3v4.9l1.6-1.8Z" />
            </svg>
          </button>
          <button
            className="sign-out-button"
            title="Sign out"
            type="button"
            onClick={onSignOut}
          >
            <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
              <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6A1.5 1.5 0 0 1 12 3.5V6h-1.8V3.8H4.8v12.4h5.4V14H12v2.5a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 3 16.5v-13Zm10.7 3.1L17.1 10l-3.4 3.4-1.2-1.2 1.3-1.3H7.4V9.1h6.4l-1.3-1.3 1.2-1.2Z" />
            </svg>
          </button>
        </div>
      </header>
      <div className="bottom-add-bar">
        <form className="todo-form" onSubmit={handleSubmit}>
          <input
            aria-activedescendant={
              showSuggestions
                ? `task-suggestion-${matchingTodos[activeSuggestionIndex].id}`
                : undefined
            }
            aria-autocomplete="list"
            aria-controls="task-suggestions"
            aria-expanded={showSuggestions}
            disabled={isLoadingTodos}
            placeholder="Add a task"
            value={text}
            onBlur={() => setIsSuggestionsOpen(false)}
            onChange={(event) => {
              onTextChange(event.target.value);
              setIsSuggestionsOpen(true);
            }}
            onFocus={() => setIsSuggestionsOpen(text.trim().length > 0)}
            onKeyDown={handleInputKeyDown}
          />
          {showSuggestions ? (
            <ol
              className="task-suggestions"
              id="task-suggestions"
            >
              {matchingTodos.map((todo, index) => (
                <li key={todo.id}>
                  <button
                    aria-selected={index === activeSuggestionIndex}
                    className="task-suggestion"
                    id={`task-suggestion-${todo.id}`}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectSuggestion(todo);
                    }}
                    onMouseEnter={() => setActiveSuggestionIndex(index)}
                  >
                    <span>{todo.text}</span>
                    <strong>{todo.count}</strong>
                  </button>
                </li>
              ))}
            </ol>
          ) : null}
        </form>
      </div>
    </>
  );
}
