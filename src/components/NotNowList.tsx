import type { DragEvent } from "react";
import type { Todo, TodoTag } from "../types/todo";
import { SectionCard } from "./Shared/SectionCard";
import { Chip } from "@mui/material";
import { markTodoNotNow, markTodoNow } from "../utils/todos";
import { DEFAULT_TAG_COLOR } from "../constants/ui";

type Props = {
  todos: Todo[];
  tags: TodoTag[];
  updateTodo: (todo: Todo) => void;
};

export const NotNowList: React.FC<Props> = ({ todos, updateTodo, tags }) => {
  const notNowTodos = todos.filter((todo) => !todo.done && todo.notNow);

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
    <SectionCard title="Not Now" onDragOver={handleDragOver} onDrop={handleDrop}>
      {!notNowTodos.length && <p>Drag cloud tasks here to hide them for now.</p>}
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
    </SectionCard>
  );
};
