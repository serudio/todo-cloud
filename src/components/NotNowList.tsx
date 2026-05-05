import type { DragEvent } from "react";
import type { Todo } from "../types/todo";
import { SectionCard } from "./Shared/SectionCard";
import { Chip } from "@mui/joy";

type NotNowListProps = {
  todos: Todo[];
  onDropTodo: (id: string) => void;
  onRestoreTodo: (id: string) => void;
};

export function NotNowList({ todos, onDropTodo, onRestoreTodo }: NotNowListProps) {
  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();

    const todoId = event.dataTransfer.getData("text/plain");
    if (todoId) {
      onDropTodo(todoId);
    }
  }

  function handleDragStart(event: DragEvent<HTMLElement>, todoId: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", todoId);
  }

  return (
    <SectionCard title="Not Now" onDragOver={handleDragOver} onDrop={handleDrop}>
      {!todos.length && <p className="status">Drag cloud tasks here to hide them for now.</p>}
      {todos.map((todo) => (
        <Chip draggable onClick={() => onRestoreTodo(todo.id)} onDragStart={(event) => handleDragStart(event, todo.id)} size="sm">
          {todo.text}
        </Chip>
      ))}
    </SectionCard>
  );
}
