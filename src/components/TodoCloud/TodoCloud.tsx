import {
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Todo, TodoTag } from "../../types/todo";
import "./TodoCloud.css";
import { NotTodayList } from "./NotTodayList";
import { TodoItem } from "./TodoItem";

type TodoCloudProps = {
  activeTodos: Todo[];
  isLoadingTodos: boolean;
  notTodayTodos: Todo[];
  tags: TodoTag[];
  onAssignTodoTag: (id: string, tagId: string | null) => void;
  onEditTodoText: (id: string, nextText: string) => boolean;
  onMarkTodoNotToday: (id: string) => void;
  onMarkTodoNotNow: (id: string) => void;
  onResetTodoCount: (id: string) => void;
  onRestoreTodo: (id: string) => void;
  onToggleEndOfDayRepeat: (id: string) => void;
  onToggleTodo: (id: string) => void;
};

export function TodoCloud({
  activeTodos,
  isLoadingTodos,
  notTodayTodos,
  tags,
  onAssignTodoTag,
  onEditTodoText,
  onMarkTodoNotToday,
  // onMarkTodoNotNow,
  onResetTodoCount,
  onRestoreTodo,
  onToggleEndOfDayRepeat,
  onToggleTodo,
}: TodoCloudProps) {
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editId) return;

    editInputRef.current?.focus();
    editInputRef.current?.select();
  }, [editId]);

  const handleEdit = (todo: Todo) => {
    setEditId(todo.id);
    setEditText(todo.text);
  };

  function cancelEditing() {
    setEditId(null);
    setEditText("");
  }

  function finishEditing(todo: Todo) {
    const trimmedText = editText.trim().replace(/\s+/g, " ");

    if (!trimmedText || trimmedText === todo.text) {
      cancelEditing();
      return;
    }

    if (onEditTodoText(todo.id, trimmedText)) {
      cancelEditing();
    }
  }

  function handleEditSubmit(event: FormEvent<HTMLFormElement>, todo: Todo) {
    event.preventDefault();
    finishEditing(todo);
  }

  function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  }

  function handleTodoDragStart(event: DragEvent<HTMLElement>, todoId: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", todoId);
  }

  function handleCloudDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleCloudDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();

    const todoId = event.dataTransfer.getData("text/plain");
    if (todoId) {
      onRestoreTodo(todoId);
    }
  }

  return (
    <section className="main-panel">
      <div
        className="cloud"
        onDragOver={handleCloudDragOver}
        onDrop={handleCloudDrop}
      >
        {isLoadingTodos && <p className="status">Loading todos...</p>}
        {!isLoadingTodos && notTodayTodos.length > 0 && (
          <NotTodayList todos={notTodayTodos} onClick={onRestoreTodo} />
        )}
        {!isLoadingTodos && activeTodos.length === 0 && (
          <p className="status">No todos yet. Add the first one.</p>
        )}
        {activeTodos.map((todo, index) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            editId={editId}
            index={index}
            onToggleTodo={onToggleTodo}
            onAssignTodoTag={onAssignTodoTag}
            onMarkTodoNotToday={onMarkTodoNotToday}
            onToggleEndOfDayRepeat={onToggleEndOfDayRepeat}
            onResetTodoCount={onResetTodoCount}
            handleEdit={handleEdit}
            editInputRef={editInputRef}
            editText={editText}
            setEditText={setEditText}
            finishEditing={finishEditing}
            handleEditSubmit={handleEditSubmit}
            handleEditKeyDown={handleEditKeyDown}
            handleTodoDragStart={handleTodoDragStart}
            tags={tags}
          />
        ))}
      </div>
    </section>
  );
}
