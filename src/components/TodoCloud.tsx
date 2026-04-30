import {
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { Todo } from '../types/todo';
import { getTagSize } from '../utils/todos';

type TodoCloudProps = {
  activeTodos: Todo[];
  isLoadingTodos: boolean;
  onEditTodoText: (id: string, nextText: string) => boolean;
  onToggleTodo: (id: string) => void;
};

export function TodoCloud({
  activeTodos,
  isLoadingTodos,
  onEditTodoText,
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

          return (
            <span
              className={`tag tag-${getTagSize(todo.count)}${isEditing ? ' editing' : ''}`}
              key={todo.id}
              style={{ '--tag-offset': `${index % 5}` } as CSSProperties}
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
                  <span className="tag-actions">
                    <span className="tag-count" aria-hidden="true">
                      {todo.count}
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
