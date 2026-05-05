import type { Todo } from "../../types/todo";
import { type FormEvent, type KeyboardEvent, useEffect, useMemo, useState } from "react";
import { normalizeTodoText } from "../../utils/todos";
import { Box, Input } from "@mui/joy";
import { ADD_TODO_Z } from "../../constants/ui";

type Props = {
  isLoadingTodos: boolean;
  suggestedTodos: Todo[];
  text: string;
  onAddTodo: (event: FormEvent<HTMLFormElement>) => void;
  onAddTodoText: (text: string) => void;
  onTextChange: (text: string) => void;
};

export const AddTask: React.FC<Props> = ({
  isLoadingTodos,
  suggestedTodos,
  text,
  onAddTodo,
  onAddTodoText,

  onTextChange,
}) => {
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const matchingTodos = useMemo(() => {
    const normalizedText = normalizeTodoText(text);
    if (!normalizedText) return [];

    return suggestedTodos.filter((todo) => normalizeTodoText(todo.text).includes(normalizedText)).slice(0, 6);
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
      setActiveSuggestionIndex((currentIndex) => (currentIndex + 1) % matchingTodos.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsSuggestionsOpen(true);
      setActiveSuggestionIndex((currentIndex) => (currentIndex - 1 + matchingTodos.length) % matchingTodos.length);
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
    <Box
      sx={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        width: 400,
        zIndex: ADD_TODO_Z,
      }}
    >
      <form className="todo-form" onSubmit={handleSubmit}>
        <Input
          variant="solid"
          placeholder="Add a task"
          disabled={isLoadingTodos}
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
          <ol className="task-suggestions" id="task-suggestions">
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
    </Box>
  );
};
