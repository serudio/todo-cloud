import { type FormEvent, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './supabase';

type Todo = {
  id: string;
  text: string;
  done: boolean;
};

type TodoListRow = {
  id: string;
  items: unknown;
};

function parseTodos(items: unknown): Todo[] {
  if (!Array.isArray(items)) return [];

  return items.filter((item): item is Todo => {
    if (!item || typeof item !== 'object') return false;

    const todo = item as Record<string, unknown>;

    return (
      typeof todo.id === 'string' &&
      typeof todo.text === 'string' &&
      typeof todo.done === 'boolean'
    );
  });
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingTodos, setIsLoadingTodos] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [todoListId, setTodoListId] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!supabase) {
      setIsLoadingSession(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoadingSession(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session || !supabase) {
      setTodos([]);
      setTodoListId(null);
      setIsLoadingTodos(false);
      return;
    }

    loadTodoList(session.user.id);
  }, [session]);

  async function loadTodoList(userId: string) {
    if (!supabase) return;

    setIsLoadingTodos(true);
    setSaveError(null);

    const { data, error } = await supabase
      .from('todo_lists')
      .select('id, items')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle<TodoListRow>();

    if (error) {
      setSaveError(error.message);
      setTodos([]);
      setTodoListId(null);
      setIsLoadingTodos(false);
      return;
    }

    if (data) {
      setTodoListId(data.id);
      setTodos(parseTodos(data.items));
      setIsLoadingTodos(false);
      return;
    }

    const { data: createdTodoList, error: createError } = await supabase
      .from('todo_lists')
      .insert({ user_id: userId, items: [] })
      .select('id, items')
      .single<TodoListRow>();

    if (createError) {
      setSaveError(createError.message);
      setTodos([]);
      setTodoListId(null);
      setIsLoadingTodos(false);
      return;
    }

    setTodoListId(createdTodoList.id);
    setTodos(parseTodos(createdTodoList.items));
    setIsLoadingTodos(false);
  }

  async function saveTodos(nextTodos: Todo[]) {
    if (!supabase || !todoListId) return;

    setSaveError(null);

    const { error } = await supabase
      .from('todo_lists')
      .update({ items: nextTodos })
      .eq('id', todoListId);

    if (error) {
      setSaveError(error.message);
    }
  }

  async function signInWithGoogle() {
    if (!supabase) return;

    setAuthError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: new URL(import.meta.env.BASE_URL, window.location.origin).toString(),
      },
    });

    if (error) {
      setAuthError(error.message);
    }
  }

  async function signOut() {
    if (!supabase) return;

    await supabase.auth.signOut();
  }

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedText = text.trim();
    if (!trimmedText || isLoadingTodos) return;

    const nextTodos = [
      ...todos,
      { id: crypto.randomUUID(), text: trimmedText, done: false },
    ];

    setTodos(nextTodos);
    setText('');
    saveTodos(nextTodos);
  }

  function toggleTodo(id: string) {
    const nextTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo,
    );

    setTodos(nextTodos);
    saveTodos(nextTodos);
  }

  function deleteTodo(id: string) {
    const nextTodos = todos.filter((todo) => todo.id !== id);

    setTodos(nextTodos);
    saveTodos(nextTodos);
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="app auth-page">
        <section className="auth-card">
          <p className="eyebrow">setup needed</p>
          <h1>Connect Supabase first.</h1>
          <p>
            Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`,
            then restart `pnpm dev`.
          </p>
        </section>
      </main>
    );
  }

  if (isLoadingSession) {
    return (
      <main className="app auth-page">
        <section className="auth-card">
          <p className="eyebrow">todo cloud</p>
          <h1>Loading...</h1>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="app auth-page">
        <section className="auth-card">
          <p className="eyebrow">todo cloud</p>
          <h1>Sign in to sync your cloud.</h1>
          <p>Use Google to keep your todos available across devices.</p>
          <button className="google-button" type="button" onClick={signInWithGoogle}>
            Continue with Google
          </button>
          {authError ? <p className="error">{authError}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="topbar">
        <span>{session.user.email}</span>
        <button type="button" onClick={signOut}>
          Sign out
        </button>
      </header>

      <section className="hero">
        <p className="eyebrow">todo cloud</p>
        <h1>Turn tasks into a tag cloud.</h1>
      </section>

      <form className="todo-form" onSubmit={addTodo}>
        <input
          aria-label="New todo"
          disabled={isLoadingTodos}
          placeholder="Add a task"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button disabled={isLoadingTodos} type="submit">
          Add
        </button>
      </form>

      <div className="cloud" aria-label="Todo list">
        {isLoadingTodos ? <p className="status">Loading todos...</p> : null}
        {!isLoadingTodos && todos.length === 0 ? (
          <p className="status">No todos yet. Add the first one.</p>
        ) : null}
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
      {saveError ? <p className="error">{saveError}</p> : null}
    </main>
  );
}
