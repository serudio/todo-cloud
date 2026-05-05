import type { DragEvent } from "react";
import type { Todo } from "../types/todo";
import { SectionCard } from "./Shared/SectionCard";
import { Chip } from "@mui/joy";
import { markTodoNotNow, markTodoNow } from "../utils/todos";

type NotNowListProps = {
  todos: Todo[];
  updateTodo: (todo: Todo) => void;
};

export function NotNowList({ todos, updateTodo }: NotNowListProps) {
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
      {!notNowTodos.length && <p className="status">Drag cloud tasks here to hide them for now.</p>}
      {notNowTodos.map((todo) => (
        <Chip
          key={todo.id}
          draggable
          onClick={handleClick(todo.id)}
          onDragStart={(event) => handleDragStart(event, todo.id)}
          size="sm"
        >
          {todo.text}
        </Chip>
      ))}
    </SectionCard>
  );
}
