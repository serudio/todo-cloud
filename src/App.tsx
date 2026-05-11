import { type FormEvent, useEffect } from "react";
import { SetupRequired } from "./components/AppState/SetupRequired";
import { AuthCard } from "./components/AuthCard";
import { DeletedCard } from "./components/DeletedCard/DeletedCard";
import { DoneCard } from "./components/DoneCard/DoneCard";
import { LinksCard } from "./components/LinksCard/LinksCard";
import { NotesCard } from "./components/NotesCard.tsx";
import { NotNowList } from "./components/NotNowList.tsx";
import { TagsCard } from "./components/Tags/TagsCard";
import { TodoCloud } from "./components/TodoCloud/TodoCloud";
import { isSupabaseConfigured, supabase } from "./supabase";
import { getTodosWithDailyUpdates, normalizeTodoText } from "./utils/todos";
import { Box } from "@mui/material";
import { Header } from "./components/Layout";
import { AddTask } from "./components/TodoCloud/AddTask.tsx";
import { LoadingComponent } from "./components/Layout/LoadingComponent.tsx";
import { useAppInit } from "./hooks/app.ts";
import { NotificationsToast } from "./components/Layout/NotificationAlert";
import { getLocalDateKey, getNextMidnightDelay } from "./utils/date.ts";
import {
  clearDeletedTodos,
  createDeletedTodo,
  readDeletedTodos,
  restoreDeletedTodo,
  saveDeletedTodos,
} from "./utils/deletedTodos";
import { moveItemToFront } from "./utils/arrays";

export default function App() {
  // todo: combine useAppInit and useTodoListPersistence into a single hook
  const {
    session,
    setSession,
    setIsLoadingSession,
    isLoadingSession,
    sessionUserIdRef,

    saveError,

    todoListId,
    loadTodoList,
    saveTodoList,

    todos,
    setTodos,
    doneTodos,
    deletedTodos,
    setDeletedTodos,
    updateTodos,
    updateTodo,
    resetTodoList,
    isLoadingTodos,
    text,
    setText,
    todosRef,

    saveTodos,

    tags,
    setTags,
    links,
    notes,

    updateTags,
    updateLinks,
    updateNotes,

    notification,
    setNotification,
    closeNotification,
  } = useAppInit();

  const notTodayTodos = todos.filter((todo) => !todo.done && !todo.notNow && todo.notToday);

  // Moves a todo out of the saved list and into the local deleted history.
  function deleteTodo(id: string) {
    if (!session) return;

    const deletedTodo = todos.find((todo) => todo.id === id);
    if (!deletedTodo) return;

    const nextTodos = todos.filter((todo) => todo.id !== id);
    const nextDeletedTodos = [createDeletedTodo(deletedTodo), ...deletedTodos.filter((todo) => todo.id !== id)];

    updateTodos(nextTodos);
    setDeletedTodos(nextDeletedTodos);

    saveDeletedTodos(session.user.id, nextDeletedTodos);
  }

  // Initializes Supabase auth and only reloads data when the signed-in user changes.
  useEffect(() => {
    if (!supabase) {
      setIsLoadingSession(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      sessionUserIdRef.current = data.session?.user.id ?? null;
      setSession(data.session);
      setIsLoadingSession(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const nextUserId = nextSession?.user.id ?? null;
      if (sessionUserIdRef.current === nextUserId) return;

      sessionUserIdRef.current = nextUserId;
      setSession(nextSession);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // Loads or clears todo-list data when the authenticated user changes.
  useEffect(() => {
    if (!session || !supabase) {
      resetTodoList();
      setDeletedTodos([]);
      return;
    }

    setDeletedTodos(readDeletedTodos(session.user.id));
    loadTodoList(session.user.id);
  }, [session?.user.id]);

  // Keeps a ref copy of todos so scheduled midnight callbacks see fresh state.
  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

  // Runs daily todo updates now and schedules them to repeat after each midnight.
  useEffect(() => {
    if (!session || !todoListId || isLoadingTodos) return;

    // Applies daily changes and persists them only when something changed.
    function applyDailyTodoUpdates() {
      const nextTodos = getTodosWithDailyUpdates(todosRef.current);
      if (!nextTodos) return;

      todosRef.current = nextTodos;
      setTodos(nextTodos);
      saveTodos(nextTodos);
    }

    applyDailyTodoUpdates();

    let timeoutId: number;

    // Reschedules itself so the app handles every future local midnight.
    function scheduleNextMidnight() {
      timeoutId = window.setTimeout(() => {
        applyDailyTodoUpdates();
        scheduleNextMidnight();
      }, getNextMidnightDelay() + 1000);
    }

    scheduleNextMidnight();

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [session, todoListId, isLoadingTodos, tags, links, notes]);

  // todo
  // Adds a task by text, reviving duplicates from done/hidden states when needed.
  function addTodoText(todoText: string) {
    const trimmedText = normalizeTodoText(todoText);
    if (!trimmedText || isLoadingTodos) return;

    const today = getLocalDateKey();
    const normalizedText = normalizeTodoText(trimmedText);
    const existingTodo = todos.find((todo) => normalizeTodoText(todo.text) === normalizedText);

    if (existingTodo && !existingTodo.done) {
      setNotification(`"${existingTodo.text}" is already there.`);
      setText("");
      return;
    }

    const nextTodos = existingTodo
      ? moveItemToFront(
          todos.map((todo) =>
            todo.id === existingTodo.id
              ? {
                  ...todo,
                  count: todo.count + 1,
                  notNow: false,
                  notToday: false,
                  notTodayDate: null,
                  done: false,
                  doneAt: null,
                  lastAddedDate: today,
                }
              : todo,
          ),
          (todo) => todo.id === existingTodo.id,
        )
      : [
          {
            id: crypto.randomUUID(),
            text: trimmedText,
            done: false,
            doneAt: null,
            count: 1,
            lastAddedDate: today,
            repeatAtEndOfDay: false,
            lastAutoAddedDate: null,
            tagId: null,
            dueDate: null,
            notNow: false,
            notToday: false,
            notTodayDate: null,
          },
          ...todos,
        ];

    setTodos(nextTodos);
    setText("");
    setNotification(`"${trimmedText}" added.`);
    saveTodos(nextTodos);
  }

  // Handles the add-task form submit and delegates to text-based creation.
  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addTodoText(text);
  }

  // Manually reloads the current user's todo list from Supabase.
  function refreshTodoList() {
    if (!session) return;

    loadTodoList(session.user.id);
  }

  function clearDeletedItems() {
    if (!session) return;

    setDeletedTodos([]);
    clearDeletedTodos(session.user.id);
  }

  function removeDeletedItem(id: string) {
    if (!session) return;

    const nextDeletedTodos = deletedTodos.filter((todo) => todo.id !== id);

    setDeletedTodos(nextDeletedTodos);
    saveDeletedTodos(session.user.id, nextDeletedTodos);
  }

  function restoreDeletedItem(id: string) {
    if (!session) return;

    const deletedTodo = deletedTodos.find((todo) => todo.id === id);
    if (!deletedTodo) return;

    const restoredTodo = restoreDeletedTodo(deletedTodo);
    const nextTodos = [restoredTodo, ...todos.filter((todo) => todo.id !== id)];
    const nextDeletedTodos = deletedTodos.filter((todo) => todo.id !== id);

    setTodos(nextTodos);
    setDeletedTodos(nextDeletedTodos);
    saveTodos(nextTodos);
    saveDeletedTodos(session.user.id, nextDeletedTodos);
  }

  // Deletes a tag and removes that tag assignment from all todos.
  function deleteTag(id: string) {
    const nextTags = tags.filter((tag) => tag.id !== id);
    const nextTodos = todos.map((todo) => (todo.tagId === id ? { ...todo, tagId: null } : todo));

    setTags(nextTags);
    setTodos(nextTodos);
    saveTodoList(nextTodos, nextTags, links, notes);
  }

  if (!isSupabaseConfigured) return <SetupRequired />;
  if (!session) return <AuthCard />;
  if (isLoadingSession) return <LoadingComponent loading />;

  return (
    <Box sx={{ bgcolor: "background.body", color: "text.primary" }}>
      {saveError ? <p>{saveError}</p> : null}

      <NotificationsToast notification={notification} onClose={closeNotification} />

      <AddTask
        todos={todos}
        isLoadingTodos={isLoadingTodos}
        text={text}
        onAddTodo={addTodo}
        onAddTodoText={addTodoText}
        onTextChange={setText}
      />

      <Box
        sx={{
          paddingTop: 2,
          minHeight: "calc(100vh - 16px)",
          width: "min(1300px, calc(100% - 32px))",
          display: "flex",
          gap: 2,
          margin: "0 auto",
        }}
      >
        <Box
          sx={{
            gap: 2,
            display: "flex",
            flexDirection: "column",
            width: 230,
            minWidth: 230,
            maxHeight: "calc(100vh - 24px)",
          }}
        >
          <TagsCard tags={tags} updateTags={updateTags} setNotification={setNotification} onDeleteTag={deleteTag} />
          <LinksCard links={links} updateLinks={updateLinks} setNotification={setNotification} />
          <NotNowList tags={tags} todos={todos} updateTodo={updateTodo} />
          <NotesCard notes={notes} setNotes={updateNotes} />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          <Header isLoadingTodos={isLoadingTodos} onRefresh={refreshTodoList} email={session.user.email} />
          <TodoCloud
            todos={todos}
            updateTodo={updateTodo}
            isLoadingTodos={isLoadingTodos}
            notTodayTodos={notTodayTodos}
            tags={tags}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: 250,
            minWidth: 250,
            maxHeight: "calc(100vh - 24px)",
          }}
        >
          <DoneCard
            todos={doneTodos}
            updateTodo={updateTodo}
            tags={tags}
            onAddTodoText={addTodoText}
            onDeleteTodo={deleteTodo}
          />
          <DeletedCard
            deletedTodos={deletedTodos}
            onClear={clearDeletedItems}
            onRemoveDeletedTodo={removeDeletedItem}
            onRestoreDeletedTodo={restoreDeletedItem}
          />
        </Box>
      </Box>
    </Box>
  );
}
