import { type CSSProperties, type FormEvent } from 'react';
import type { Todo } from '../types/todo';
import { getTagSize } from '../utils/todos';

type TodoCloudProps = {
  activeTodos: Todo[];
  isLoadingTodos: boolean;
  text: string;
  onTextChange: (text: string) => void;
  onAddTodo: (event: FormEvent<HTMLFormElement>) => void;
  onToggleTodo: (id: string) => void;
};

export function TodoCloud({
  activeTodos,
  isLoadingTodos,
  text,
  onTextChange,
  onAddTodo,
  onToggleTodo,
}: TodoCloudProps) {
  return (
    <section className="main-panel">
      <form className="todo-form" onSubmit={onAddTodo}>
        <input
          aria-label="New todo"
          disabled={isLoadingTodos}
          placeholder="Add a task"
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
        />
        <button disabled={isLoadingTodos} type="submit">
          Add
        </button>
      </form>

      <div className="cloud" aria-label="Todo list">
        {isLoadingTodos ? <p className="status">Loading todos...</p> : null}
        {!isLoadingTodos && activeTodos.length === 0 ? (
          <p className="status">No todos yet. Add the first one.</p>
        ) : null}
        {activeTodos.map((todo, index) => (
          <span
            className={`tag tag-${getTagSize(todo.count)}`}
            key={todo.id}
            style={{ '--tag-offset': `${index % 5}` } as CSSProperties}
            title={`Added ${todo.count} ${todo.count === 1 ? 'time' : 'times'}`}
          >
            <button type="button" onClick={() => onToggleTodo(todo.id)}>
              {todo.text}
              <span className="tag-count" aria-hidden="true">
                {todo.count}
              </span>
            </button>
          </span>
        ))}
      </div>
    </section>
  );
}
