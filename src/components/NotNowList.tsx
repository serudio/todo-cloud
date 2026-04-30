import { type DragEvent } from "react";
import type { Todo } from "../types/todo";

type NotNowListProps = {
  todos: Todo[];
  onDropTodo: (id: string) => void;
  onRestoreTodo: (id: string) => void;
};

export function NotNowList({
  todos,
  onDropTodo,
  onRestoreTodo,
}: NotNowListProps) {
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
    <aside
      className="not-now-panel"
      aria-label="Not now todos"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <p className="eyebrow">not now</p>
      {todos.length === 0 ? (
        <p className="status">Drag cloud tasks here to hide them for now.</p>
      ) : (
        <ol className="not-now-list">
          {todos.map((todo) => (
            <li key={todo.id}>
              <button
                draggable
                type="button"
                title="Click or drag back to the cloud"
                onClick={() => onRestoreTodo(todo.id)}
                onDragStart={(event) => handleDragStart(event, todo.id)}
              >
                {todo.text}
              </button>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
