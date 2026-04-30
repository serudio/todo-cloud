import type { Todo } from '../types/todo';

type DoneListProps = {
  todos: Todo[];
  onAddTodoText: (text: string) => void;
  onDeleteTodo: (id: string) => void;
};

export function DoneList({ todos, onAddTodoText, onDeleteTodo }: DoneListProps) {
  return (
    <aside className="suggestions" aria-label="Done todos">
      <p className="eyebrow">done</p>
      <h2>Done</h2>
      {todos.length === 0 ? (
        <p className="status">Done items will show up here.</p>
      ) : (
        <ol className="suggestion-list">
          {todos.map((todo) => (
            <li key={todo.id}>
              <button
                className="suggestion-add"
                type="button"
                onClick={() => onAddTodoText(todo.text)}
              >
                <span>{todo.text}</span>
                <strong title={`Added ${todo.count} ${todo.count === 1 ? 'time' : 'times'}`}>
                  {todo.count}
                </strong>
              </button>
              <button
                aria-label={`Delete ${todo.text}`}
                className="delete"
                type="button"
                onClick={() => onDeleteTodo(todo.id)}
              >
                x
              </button>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
