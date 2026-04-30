import type { CSSProperties } from "react";
import type { Todo, TodoTag } from "../types/todo";
import { formatDateKey } from "../utils/todos";

type DoneListProps = {
  todos: Todo[];
  tags: TodoTag[];
  onAddTodoText: (text: string) => void;
  onAssignTodoTag: (id: string, tagId: string | null) => void;
  onDeleteTodo: (id: string) => void;
  onResetTodoCount: (id: string) => void;
  onToggleEndOfDayRepeat: (id: string) => void;
};

export function DoneList({
  todos,
  tags,
  onAddTodoText,
  onAssignTodoTag,
  onDeleteTodo,
  onResetTodoCount,
  onToggleEndOfDayRepeat,
}: DoneListProps) {
  return (
    <aside className="suggestions" aria-label="Done todos">
      <p className="eyebrow">done</p>
      {todos.length === 0 ? (
        <p className="status">Done items will show up here.</p>
      ) : (
        <ol className="suggestion-list">
          {todos.map((todo) => {
            const selectedTag = tags.find((tag) => tag.id === todo.tagId);

            return (
              <li
                key={todo.id}
                style={{ "--tag-color": selectedTag?.color } as CSSProperties}
              >
                <button
                  className="suggestion-add"
                  type="button"
                  onClick={() => onAddTodoText(todo.text)}
                >
                  <span>{todo.text}</span>
                </button>
                <span className="count-anchor">
                  <span
                    aria-label={`${todo.text} count is ${todo.count}`}
                    className="tag-count"
                    tabIndex={0}
                    title={`Added ${todo.count} ${todo.count === 1 ? "time" : "times"}`}
                  >
                    {todo.count}
                  </span>
                  <span className="count-popover" role="status">
                    <span className="count-popover-title">Count</span>
                    <button
                      type="button"
                      onClick={() => onResetTodoCount(todo.id)}
                    >
                      Reset to 0
                    </button>
                  </span>
                </span>
                <select
                  aria-label={`Select tag for ${todo.text}`}
                  className="suggestion-tag-picker"
                  value={todo.tagId ?? ""}
                  onChange={(event) =>
                    onAssignTodoTag(todo.id, event.target.value || null)
                  }
                >
                  <option value="">No tag</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <button
                  aria-label={`Add ${todo.text} again at midnight`}
                  aria-pressed={todo.repeatAtEndOfDay}
                  className="suggestion-repeat"
                  title="Add again at midnight"
                  type="button"
                  onClick={() => onToggleEndOfDayRepeat(todo.id)}
                >
                  <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
                    <path d="M15.8 5.4A6.7 6.7 0 0 0 4.4 4.1l1.2 1.2a5 5 0 0 1 8.9 2.9H12l3.6 3.6 3.6-3.6h-2.9a6.7 6.7 0 0 0-.5-2.8ZM4.2 14.6a6.7 6.7 0 0 0 11.4 1.3l-1.2-1.2a5 5 0 0 1-8.9-2.9H8L4.4 8.2.8 11.8h2.9c0 1 .2 1.9.5 2.8Z" />
                  </svg>
                </button>
                <span className="details-anchor">
                  <span
                    aria-label={`Show details for ${todo.text}`}
                    className="suggestion-details"
                    tabIndex={0}
                  >
                    i
                  </span>
                  <span className="todo-details-popover" role="status">
                    <span className="todo-details-title">Last added</span>
                    <span>{formatDateKey(todo.lastAddedDate)}</span>
                  </span>
                </span>
                <button
                  aria-label={`Delete ${todo.text}`}
                  className="delete"
                  type="button"
                  onClick={() => onDeleteTodo(todo.id)}
                >
                  x
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </aside>
  );
}
