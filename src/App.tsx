import { type FormEvent, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AuthCard } from "./components/AuthCard";
import { DoneList } from "./components/DoneList";
import { LoadingPage } from "./components/LoadingPage";
import { NotificationToast } from "./components/NotificationToast";
import { SetupRequired } from "./components/SetupRequired";
import { TodoCloud } from "./components/TodoCloud";
import { TopBar } from "./components/TopBar";
import { isSupabaseConfigured, supabase } from "./supabase";
import type { Notification } from "./types/notification";
import type { Todo } from "./types/todo";
import {
  createTodoList,
  getFirstTodoList,
  updateTodoListItems,
} from "./utils/db/todoLists";
import { normalizeTodoText, parseTodos } from "./utils/todos";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingTodos, setIsLoadingTodos] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [todoListId, setTodoListId] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [notification, setNotification] = useState<Notification | null>(null);

  const suggestedTodos = [...todos]
    .filter((todo) => todo.done)
    .sort((firstTodo, secondTodo) => secondTodo.count - firstTodo.count);
  const activeTodos = todos.filter((todo) => !todo.done);

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

  useEffect(() => {
    if (!notification) return;

    const timeoutId = window.setTimeout(() => {
      setNotification(null);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notification?.id]);

  function showNotification(message: string) {
    setNotification({
      id: crypto.randomUUID(),
      message,
    });
  }

  async function loadTodoList(userId: string) {
    if (!supabase) return;

    setIsLoadingTodos(true);
    setSaveError(null);

    const { data, error } = await getFirstTodoList(userId);

    if (error) {
      setSaveError(error.message);
      setTodos([]);
      setTodoListId(null);
      setIsLoadingTodos(false);
      return;
    }

    if (data) {
      const parsedTodos = parseTodos(data.items);

      setTodoListId(data.id);
      setTodos(parsedTodos);
      setIsLoadingTodos(false);

      if (
        !Array.isArray(data.items) ||
        parsedTodos.length !== data.items.length
      ) {
        await updateTodoListItems(data.id, parsedTodos);
      }

      return;
    }

    const { data: createdTodoList, error: createError } =
      await createTodoList(userId);

    if (createError || !createdTodoList) {
      setSaveError(createError?.message ?? "Todo list could not be created.");
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

    const { error } = await updateTodoListItems(todoListId, nextTodos);

    if (error) {
      setSaveError(error.message);
    }
  }

  async function signInWithGoogle() {
    if (!supabase) return;

    setAuthError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: new URL(
          import.meta.env.BASE_URL,
          window.location.origin,
        ).toString(),
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

  function addTodoText(todoText: string) {
    const trimmedText = todoText.trim().replace(/\s+/g, " ");
    if (!trimmedText || isLoadingTodos) return;

    const normalizedText = normalizeTodoText(trimmedText);
    const existingTodo = todos.find(
      (todo) => normalizeTodoText(todo.text) === normalizedText,
    );

    if (existingTodo && !existingTodo.done) {
      showNotification(`"${existingTodo.text}" is already there.`);
      setText("");
      return;
    }

    const nextTodos = existingTodo
      ? todos.map((todo) =>
          todo.id === existingTodo.id
            ? { ...todo, count: todo.count + 1, done: false }
            : todo,
        )
      : [
          ...todos,
          {
            id: crypto.randomUUID(),
            text: trimmedText,
            done: false,
            count: 1,
          },
        ];

    setTodos(nextTodos);
    setText("");
    showNotification(`"${trimmedText}" added.`);
    saveTodos(nextTodos);
  }

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addTodoText(text);
  }

  function toggleTodo(id: string) {
    const nextTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo,
    );

    setTodos(nextTodos);
    saveTodos(nextTodos);
  }

  function editTodoText(id: string, nextText: string) {
    const trimmedText = nextText.trim().replace(/\s+/g, " ");
    if (!trimmedText || isLoadingTodos) return false;

    const normalizedText = normalizeTodoText(trimmedText);
    const existingTodo = todos.find(
      (todo) => todo.id !== id && normalizeTodoText(todo.text) === normalizedText,
    );

    if (existingTodo) {
      showNotification(`"${existingTodo.text}" is already there.`);
      return false;
    }

    const nextTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, text: trimmedText } : todo,
    );

    setTodos(nextTodos);
    saveTodos(nextTodos);
    return true;
  }

  function deleteTodo(id: string) {
    const nextTodos = todos.filter((todo) => todo.id !== id);

    setTodos(nextTodos);
    saveTodos(nextTodos);
  }

  if (!isSupabaseConfigured) {
    return <SetupRequired />;
  }

  if (isLoadingSession) {
    return <LoadingPage />;
  }

  if (!session)
    return <AuthCard authError={authError} onSignIn={signInWithGoogle} />;

  return (
    <main className="app">
      <NotificationToast notification={notification} />

      <TopBar
        email={session.user.email}
        isLoadingTodos={isLoadingTodos}
        text={text}
        onAddTodo={addTodo}
        onSignOut={signOut}
        onTextChange={setText}
      />

      <div className="workspace">
        <TodoCloud
          activeTodos={activeTodos}
          isLoadingTodos={isLoadingTodos}
          onEditTodoText={editTodoText}
          onToggleTodo={toggleTodo}
        />

        <DoneList
          todos={suggestedTodos}
          onAddTodoText={addTodoText}
          onDeleteTodo={deleteTodo}
        />
      </div>
      {saveError ? <p className="error">{saveError}</p> : null}
    </main>
  );
}
