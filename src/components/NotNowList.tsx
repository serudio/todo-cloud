import { type DragEvent, useState } from "react";
import type { Todo } from "../types/todo";
import { Panel } from "./Shared/Panel";
import { PanelHeader } from "./Shared/PanelHeader";
import "./NotNowList.css";

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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <Panel onDragOver={handleDragOver} onDrop={handleDrop}>
      <PanelHeader onClick={() => setIsCollapsed((current) => !current)}>
        not now
      </PanelHeader>
      {!isCollapsed && (
        <>
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
        </>
      )}
    </Panel>
  );
}
