import type { Todo } from "../../types/todo";
import { type ChangeEvent, type FormEvent, type KeyboardEvent, useEffect, useMemo, useState } from "react";
import { getDoneTodos, getNewTodo, normalizeTodoText, restoreTodoFromDone } from "../../utils/todos";
import { alpha, Box, List, ListItemButton, ListItemText, TextField } from "@mui/material";
import { ADD_TODO_Z } from "../../constants/ui";
import { moveItemToFront } from "../../utils/arrays";

type Props = {
  isLoadingTodos: boolean;
  todos: Todo[];
  updateTodos: (todos: Todo[]) => void;
  setNotification: (notification: string) => void;
};

export const AddTask: React.FC<Props> = ({ isLoadingTodos, todos, updateTodos, setNotification }) => {
  const [text, setText] = useState("");

  const suggestedTodos = getDoneTodos(todos);

  // -1 means nothing is highlighted, so Enter adds exactly what was typed.
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const matchingTodos = useMemo(() => {
    const normalizedText = normalizeTodoText(text);
    if (!normalizedText) return [];

    return suggestedTodos.filter((todo) => normalizeTodoText(todo.text).includes(normalizedText)).slice(0, 6);
  }, [suggestedTodos, text]);

  const showSuggestions = isSuggestionsOpen && matchingTodos.length > 0;

  // Only a suggestion identical to the typed text is highlighted up front.
  const exactMatchIndex = useMemo(() => {
    const normalizedText = normalizeTodoText(text);
    if (!normalizedText) return -1;

    return matchingTodos.findIndex((todo) => normalizeTodoText(todo.text) === normalizedText);
  }, [matchingTodos, text]);

  useEffect(() => {
    setActiveSuggestionIndex(exactMatchIndex);
    setIsSuggestionsOpen(text.trim().length > 0);
  }, [exactMatchIndex, text]);

  const handleInoutChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    setIsSuggestionsOpen(true);
  };

  // Adds a task by text, reviving duplicates from done/hidden states when needed.
  function addTodoText(todoText: string) {
    const trimmedText = normalizeTodoText(todoText);
    if (!trimmedText || isLoadingTodos) return;

    const existingTodo = todos.find((todo) => normalizeTodoText(todo.text) === trimmedText);

    if (existingTodo && !existingTodo.done) {
      setNotification(`"${existingTodo.text}" is already there.`);
      setText("");
      return;
    }

    const newTodos = existingTodo
      ? moveItemToFront(
          todos.map((todo) => (todo.id === existingTodo.id ? restoreTodoFromDone(todo) : todo)),
          (todo) => todo.id === existingTodo.id,
        )
      : [getNewTodo(trimmedText), ...todos];

    setNotification(`"${trimmedText}" added.`);
    setText("");
    updateTodos(newTodos);
  }

  function selectSuggestion(todo: Todo) {
    addTodoText(todo.text);
    setActiveSuggestionIndex(-1);
    setIsSuggestionsOpen(false);
  }

  function handleInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setIsSuggestionsOpen(false);
      return;
    }

    if (matchingTodos.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsSuggestionsOpen(true);
      setActiveSuggestionIndex((currentIndex) => (currentIndex + 1) % matchingTodos.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setIsSuggestionsOpen(true);
      setActiveSuggestionIndex((currentIndex) => (currentIndex <= 0 ? matchingTodos.length - 1 : currentIndex - 1));
      return;
    }

    // With no suggestion highlighted, let the form submit the typed text as-is.
    if (e.key === "Enter" && showSuggestions && activeSuggestionIndex >= 0) {
      e.preventDefault();
      selectSuggestion(matchingTodos[activeSuggestionIndex]);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSuggestionsOpen(false);
    addTodoText(text);
  }

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 12, md: 30 },
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(400px, calc(100vw - 24px))",
        zIndex: ADD_TODO_Z,
      }}
    >
      <form onSubmit={handleSubmit}>
        <TextField
          variant="outlined"
          placeholder="Add a task"
          disabled={isLoadingTodos}
          value={text}
          onBlur={() => setIsSuggestionsOpen(false)}
          onChange={handleInoutChange}
          onFocus={() => setIsSuggestionsOpen(text.trim().length > 0)}
          onKeyDown={handleInputKeyDown}
          sx={{ width: "100%" }}
          autoComplete="off"
          size="small"
        />

        {showSuggestions && (
          <List
            disablePadding
            sx={{
              position: "absolute",
              bottom: "100%",
              left: 0,
              right: 0,
              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.82),
              backdropFilter: "blur(8px)",
            }}
          >
            {matchingTodos.map((todo, i) => {
              const { text, count } = todo;
              return (
                <ListItemButton
                  key={todo.id}
                  selected={i === activeSuggestionIndex}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectSuggestion(todo);
                  }}
                  onMouseEnter={() => setActiveSuggestionIndex(i)}
                  onMouseLeave={() => setActiveSuggestionIndex(exactMatchIndex)}
                  sx={{ paddingTop: 0.5, paddingBottom: 0.5 }}
                >
                  <ListItemText primary={`${text} • ${count}`} />
                </ListItemButton>
              );
            })}
          </List>
        )}
      </form>
    </Box>
  );
};
