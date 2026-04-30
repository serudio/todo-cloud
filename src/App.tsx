import { type FormEvent, useState } from 'react';

type Todo = {
  id: string;
  text: string;
  done: boolean;
};

const initialTodos: Todo[] = [
  { id: crypto.randomUUID(), text: 'plan weekend', done: false },
  { id: crypto.randomUUID(), text: 'buy coffee', done: false },
  { id: crypto.randomUUID(), text: 'ship tiny app', done: true },
];

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [text, setText] = useState('');

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedText = text.trim();
    if (!trimmedText) return;

    setTodos((currentTodos) => [
      ...currentTodos,
      { id: crypto.randomUUID(), text: trimmedText, done: false },
    ]);
    setText('');
  }

  function toggleTodo(id: string) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    );
  }

  function deleteTodo(id: string) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  }

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">todo cloud</p>
        <h1>Turn tasks into a tag cloud.</h1>
      </section>

      <form className="todo-form" onSubmit={addTodo}>
        <input
          aria-label="New todo"
          placeholder="Add a task"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <div className="cloud" aria-label="Todo list">
        {todos.map((todo) => (
          <span className={`tag ${todo.done ? 'done' : ''}`} key={todo.id}>
            <button type="button" onClick={() => toggleTodo(todo.id)}>
              {todo.text}
            </button>
            <button
              aria-label={`Delete ${todo.text}`}
              className="delete"
              type="button"
              onClick={() => deleteTodo(todo.id)}
            >
              x
            </button>
          </span>
        ))}
      </div>
    </main>
  );
}
