import {
  type CSSProperties,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Todo, TodoTag } from "../../types/todo";
import { formatDateKey, getTodoSize, isStaleTodo } from "../../utils/todos";
import { CountBadge } from "../Shared/CountBadge";
import { NotTodayButton } from "../Shared/NotTodayButton";
// import { NotNowButton } from "../Shared/NotNowButton";
import { TagPicker } from "../Shared/TagPicker";
import "./TodoCloud.css";
import { NotTodayList } from "./NotTodayList";
import { AutoRepeatButton } from "../Shared/AutoRepeatButton";
import { TodoEditButton } from "../Shared/TodoEditButton";

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
        {activeTodos.map((todo, index) => {
          const isEditing = editId === todo.id;
          const isStale = isStaleTodo(todo.lastAddedDate);
          const selectedTag = tags.find((tag) => tag.id === todo.tagId);

          return (
            <span
              className={`todo todo-${getTodoSize(todo.count)}${isEditing ? " editing" : ""}${isStale ? " stale" : ""}`}
              draggable={!isEditing}
              key={todo.id}
              style={
                {
                  "--todo-color": selectedTag?.color,
                  "--todo-offset": `${index % 5}`,
                } as CSSProperties
              }
              title={`Added ${todo.count} ${todo.count === 1 ? "time" : "times"}`}
              onDragStart={(event) => handleTodoDragStart(event, todo.id)}
            >
              {isEditing ? (
                <form
                  className="todo-editor"
                  onSubmit={(event) => handleEditSubmit(event, todo)}
                >
                  <input
                    ref={editInputRef}
                    value={editText}
                    onBlur={() => finishEditing(todo)}
                    onChange={(event) => setEditText(event.target.value)}
                    onKeyDown={handleEditKeyDown}
                  />
                </form>
              ) : (
                <>
                  <span className="item-text-control">
                    <button
                      className="todo-text"
                      type="button"
                      onClick={() => onToggleTodo(todo.id)}
                    >
                      {todo.text}
                    </button>
                    <CountBadge
                      count={todo.count}
                      onReset={() => onResetTodoCount(todo.id)}
                    />
                  </span>
                  {isStale ? (
                    <span
                      className="stale-badge"
                      title="Added at least a month ago"
                    >
                      STALE
                    </span>
                  ) : null}
                  <span className="todo-actions">
                    <TagPicker
                      selectedTagId={todo.tagId}
                      tags={tags}
                      onAssignTag={(tagId) => onAssignTodoTag(todo.id, tagId)}
                    />
                    <NotTodayButton
                      onClick={() => onMarkTodoNotToday(todo.id)}
                    />
                    {/* <NotNowButton onClick={() => onMarkTodoNotNow(todo.id)} /> */}
                    <AutoRepeatButton
                      onClick={() => onToggleEndOfDayRepeat(todo.id)}
                    />

                    <span className="details-anchor">
                      <span className="todo-details">i</span>
                      <span className="todo-details-popover">
                        <span className="todo-details-title">Last added</span>
                        <span>{formatDateKey(todo.lastAddedDate)}</span>
                      </span>
                    </span>
                    <TodoEditButton onClick={() => handleEdit(todo)} />
                  </span>
                </>
              )}
            </span>
          );
        })}
      </div>
    </section>
  );
}
