import {
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { Todo, TodoTag } from '../types/todo';
import { formatDateKey, getTagSize, isStaleTodo } from '../utils/todos';

type TodoCloudProps = {
  activeTodos: Todo[];
  isLoadingTodos: boolean;
  tags: TodoTag[];
  onAssignTodoTag: (id: string, tagId: string | null) => void;
  onEditTodoText: (id: string, nextText: string) => boolean;
  onResetTodoCount: (id: string) => void;
  onToggleEndOfDayRepeat: (id: string) => void;
  onToggleTodo: (id: string) => void;
};

export function TodoCloud({
  activeTodos,
  isLoadingTodos,
  tags,
  onAssignTodoTag,
  onEditTodoText,
  onResetTodoCount,
  onToggleEndOfDayRepeat,
  onToggleTodo,
}: TodoCloudProps) {
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const editingInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editingTodoId) return;

    editingInputRef.current?.focus();
    editingInputRef.current?.select();
  }, [editingTodoId]);

  function startEditing(todo: Todo) {
    setEditingTodoId(todo.id);
    setEditingText(todo.text);
  }

  function cancelEditing() {
    setEditingTodoId(null);
    setEditingText('');
  }

  function finishEditing(todo: Todo) {
    const trimmedText = editingText.trim().replace(/\s+/g, ' ');

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
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditing();
    }
  }

  return (
    <section className="main-panel">
      <div className="cloud" aria-label="Todo list">
        {isLoadingTodos ? <p className="status">Loading todos...</p> : null}
        {!isLoadingTodos && activeTodos.length === 0 ? (
          <p className="status">No todos yet. Add the first one.</p>
        ) : null}
        {activeTodos.map((todo, index) => {
          const isEditing = editingTodoId === todo.id;
          const isStale = isStaleTodo(todo.lastAddedDate);
          const selectedTag = tags.find((tag) => tag.id === todo.tagId);

          return (
            <span
              className={`tag tag-${getTagSize(todo.count)}${isEditing ? ' editing' : ''}${isStale ? ' stale' : ''}`}
              key={todo.id}
              style={
                {
                  '--tag-color': selectedTag?.color,
                  '--tag-offset': `${index % 5}`,
                } as CSSProperties
              }
              title={`Added ${todo.count} ${todo.count === 1 ? 'time' : 'times'}`}
            >
              {isEditing ? (
                <form
                  className="tag-editor"
                  onSubmit={(event) => handleEditSubmit(event, todo)}
                >
                  <input
                    ref={editingInputRef}
                    aria-label={`Edit ${todo.text}`}
                    value={editingText}
                    onBlur={() => finishEditing(todo)}
                    onChange={(event) => setEditingText(event.target.value)}
                    onKeyDown={handleEditKeyDown}
                  />
                </form>
              ) : (
                <>
                  <button
                    className="tag-text"
                    type="button"
                    onClick={() => onToggleTodo(todo.id)}
                  >
                    {todo.text}
                  </button>
                  {isStale ? (
                    <span
                      className="stale-badge"
                      title="Added at least a month ago"
                    >
                      STALE
                    </span>
                  ) : null}
                  <span className="tag-actions">
                    <span className="count-anchor">
                      <span
                        aria-label={`${todo.text} count is ${todo.count}`}
                        className="tag-count"
                        tabIndex={0}
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
                      className="tag-picker"
                      value={todo.tagId ?? ''}
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
                      className="tag-repeat"
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
                        className="tag-details"
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
                      aria-label={`Edit ${todo.text}`}
                      className="tag-edit"
                      type="button"
                      onClick={() => startEditing(todo)}
                    >
                      <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
                        <path d="M4 13.5V16h2.5L14 8.5 11.5 6 4 13.5Zm11-6 1-1a1.4 1.4 0 0 0 0-2l-.5-.5a1.4 1.4 0 0 0-2 0l-1 1L15 7.5Z" />
                      </svg>
                    </button>
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
