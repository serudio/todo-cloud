import type { DragEvent } from "react";
import type { Todo, TodoTag } from "../types/todo";
import { SectionCard } from "./Shared/SectionCard";
import { Box, Chip } from "@mui/material";
import { getNotNowTodos, markTodoNotNow, markTodoNow } from "../utils/todos";
import { DEFAULT_TAG_COLOR } from "../constants/ui";
import { isSearching, matchesSearch } from "../utils/search";

type Props = {
  todos: Todo[];
  tags: TodoTag[];
  search: string;
  updateTodo: (todo: Todo) => void;
};

export const NotNowList: React.FC<Props> = ({ todos, updateTodo, tags, search }) => {
  const notNowTodos = getNotNowTodos(todos).filter((todo) => matchesSearch(search, todo.text));

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();

    const todoId = event.dataTransfer.getData("text/plain");
    if (todoId) {
      const newTodo = todos.find((x) => x.id === todoId);
      if (!newTodo) return;

      updateTodo(markTodoNotNow(newTodo));
    }
  }

  function handleDragStart(event: DragEvent<HTMLElement>, todoId: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", todoId);
  }

  const handleClick = (id: string) => () => {
    const newTodo = todos.find((x) => x.id === id);
    if (!newTodo) return;

    updateTodo(markTodoNow(newTodo));
  };

  return (
    <SectionCard
      title="Not Now"
      expanded={isSearching(search)}
      info="Tasks set aside here stay hidden from the cloud. A task with a due date comes back to the main list the day before it is due."
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Box sx={{ maxHeight: 200, overflow: "auto" }}>
        {!notNowTodos.length && !isSearching(search) && <p>Drag cloud tasks here to hide them for now.</p>}
        {notNowTodos.map((todo) => {
          const tag = tags.find((t) => t.id === todo.tagId);
          const color = tag?.color ?? DEFAULT_TAG_COLOR;
          return (
            <Chip
              key={todo.id}
              draggable
              onClick={handleClick(todo.id)}
              onDragStart={(event) => handleDragStart(event, todo.id)}
              label={todo.text}
              size="small"
              sx={{ color }}
            />
          );
        })}
      </Box>
    </SectionCard>
  );
};
