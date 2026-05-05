import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { SetupRequired } from "./components/AppState/SetupRequired";
import { AuthCard } from "./components/AuthCard";
import { DoneCard } from "./components/DoneCard/DoneCard";
import { LinksCard } from "./components/LinksCard/LinksCard";
import { NotesCard } from "./components/NotesCard.tsx";
import { NotNowList } from "./components/NotNowList.tsx";
import { TagsCard } from "./components/Tags/TagsCard";
import { TodoCloud } from "./components/TodoCloud/TodoCloud";
import { isSupabaseConfigured, supabase } from "./supabase";
import type { CustomLink, Todo, TodoTag } from "./types/todo";
import { normalizeTodoText } from "./utils/todos";
import { Box } from "@mui/material";
import { Header } from "./components/Layout";
import { AddTask } from "./components/TodoCloud/AddTask.tsx";
import { LoadingComponent } from "./components/Layout/LoadingComponent.tsx";
import { useAppInit } from "./hooks/app.ts";
import { useTodoListPersistence } from "./hooks/useTodoListPersistence";
import { NotificationsToast } from "./components/Layout/NotificationAlert";
import { getLocalDateKey, getNextMidnightDelay } from "./utils/date.ts";
import { insertAtRandomPosition } from "./utils/arrays.ts";

// Applies one daily repeat to todos marked for end-of-day auto-add.
function getTodosWithEndOfDayRepeats(currentTodos: Todo[]) {
  const today = getLocalDateKey();
  let hasChanges = false;

  const nextTodos = currentTodos.map((todo) => {
    if (!todo.repeatAtEndOfDay) return todo;

    if (!todo.lastAutoAddedDate) {
      hasChanges = true;
      return { ...todo, lastAutoAddedDate: today };
    }

    if (todo.lastAutoAddedDate >= today) return todo;

    hasChanges = true;
    return {
      ...todo,
      done: false,
      doneAt: null,
      notNow: false,
      notToday: false,
      notTodayDate: null,
      count: todo.count + 1,
      lastAddedDate: today,
      lastAutoAddedDate: today,
    };
  });

  return hasChanges ? nextTodos : null;
}

// Moves "not today" todos back into the cloud after their saved day passes.
function getTodosWithExpiredNotTodayCleared(currentTodos: Todo[]) {
  const today = getLocalDateKey();
  let hasChanges = false;

  const nextTodos = currentTodos.map((todo) => {
    if (!todo.notToday || todo.notTodayDate === today) return todo;

    hasChanges = true;
    if (!todo.notTodayDate) {
      return {
        ...todo,
        notTodayDate: today,
      };
    }

    return {
      ...todo,
      notToday: false,
      notTodayDate: null,
    };
  });

  return hasChanges ? nextTodos : null;
}

// Combines all midnight-driven todo changes into one update pass.
function getTodosWithDailyUpdates(currentTodos: Todo[]) {
  const todosWithoutExpiredNotToday = getTodosWithExpiredNotTodayCleared(currentTodos) ?? currentTodos;

  return (
    getTodosWithEndOfDayRepeats(todosWithoutExpiredNotToday) ??
    (todosWithoutExpiredNotToday === currentTodos ? null : todosWithoutExpiredNotToday)
  );
}

// Reorders an existing todo into a new random cloud position.
function moveTodoToRandomPosition(todos: Todo[], id: string) {
  const todo = todos.find((currentTodo) => currentTodo.id === id);
  if (!todo) return todos;

  return insertAtRandomPosition(
    todos.filter((currentTodo) => currentTodo.id !== id),
    todo,
  );
}

// Owns the authenticated todo app state and wires persistence to the UI.
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingTodos, setIsLoadingTodos] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [todoListId, setTodoListId] = useState<string | null>(null);
  const todosRef = useRef<Todo[]>([]);
  const sessionUserIdRef = useRef<string | null>(null);
  const [text, setText] = useState("");

  const {
    todos,
    setTodos,
    tags,
    setTags,
    links,
    setLinks,
    notes,
    setNotes,
    doneTodos,
    notification,
    showNotification,
    setNotification,
  } = useAppInit();

  const notTodayTodos = todos.filter((todo) => !todo.done && !todo.notNow && todo.notToday);
  const { loadTodoList, saveTodoList, saveTodos, saveTags, saveLinks, saveNotes } = useTodoListPersistence({
    session,
    todoListId,
    todos,
    tags,
    links,
    notes,
    setTodos,
    setTags,
    setLinks,
    setNotes,
    setTodoListId,
    setIsLoadingTodos,
    setSaveError,
    showNotification,
  });

  // Permanently removes a todo from the list.
  function deleteTodo(id: string) {
    const nextTodos = todos.filter((todo) => todo.id !== id);
    setTodos(nextTodos);
    saveTodos(nextTodos);
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
      setTodos([]);
      setTags([]);
      setLinks([]);
      setNotes("");
      setTodoListId(null);
      setIsLoadingTodos(false);
      return;
    }

    loadTodoList(session.user.id);
  }, [session?.user.id]);

  // Automatically hides transient notifications after a short delay.
  useEffect(() => {
    if (!notification) return;

    const timeoutId = window.setTimeout(() => {
      setNotification(null);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notification?.id]);

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

  // Starts the Google OAuth flow through Supabase.
  async function signInWithGoogle() {
    if (!supabase) return;

    setAuthError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: new URL(import.meta.env.BASE_URL, window.location.origin).toString() },
    });

    if (error) {
      setAuthError(error.message);
    }
  }

  // Signs the current user out through Supabase auth.
  async function signOut() {
    if (!supabase) return;

    await supabase.auth.signOut();
  }

  // Adds a task by text, reviving duplicates from done/hidden states when needed.
  function addTodoText(todoText: string) {
    const trimmedText = todoText.trim().replace(/\s+/g, " ");
    if (!trimmedText || isLoadingTodos) return;

    const today = getLocalDateKey();
    const normalizedText = normalizeTodoText(trimmedText);
    const existingTodo = todos.find((todo) => normalizeTodoText(todo.text) === normalizedText);

    if (existingTodo && !existingTodo.done) {
      showNotification(`"${existingTodo.text}" is already there.`);
      setText("");
      return;
    }

    const nextTodos = existingTodo
      ? moveTodoToRandomPosition(
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
          existingTodo.id,
        )
      : insertAtRandomPosition(todos, {
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
        });

    setTodos(nextTodos);
    setText("");
    showNotification(`"${trimmedText}" added.`);
    saveTodos(nextTodos);
  }

  // Handles the add-task form submit and delegates to text-based creation.
  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addTodoText(text);
  }

  // Toggles a task between active and done while clearing temporary hiding flags.
  function toggleTodo(id: string) {
    const now = new Date().toISOString();
    const nextTodos = todos.map((todo) =>
      todo.id === id
        ? {
            ...todo,
            done: !todo.done,
            doneAt: todo.done ? null : now,
            notNow: todo.done ? todo.notNow : false,
            notToday: todo.done ? todo.notToday : false,
            notTodayDate: todo.done ? todo.notTodayDate : null,
          }
        : todo,
    );

    setTodos(nextTodos);
    saveTodos(nextTodos);
  }

  // Enables or disables midnight repeat for a single todo.
  function toggleEndOfDayRepeat(id: string) {
    const today = getLocalDateKey();
    const nextTodos = todos.map((todo) =>
      todo.id === id
        ? {
            ...todo,
            repeatAtEndOfDay: !todo.repeatAtEndOfDay,
            lastAutoAddedDate: todo.repeatAtEndOfDay ? null : today,
          }
        : todo,
    );

    setTodos(nextTodos);
    saveTodos(nextTodos);
  }

  // Resets a todo's recurrence/count badge back to zero.
  function resetTodoCount(id: string) {
    const nextTodos = todos.map((todo) => (todo.id === id ? { ...todo, count: 0 } : todo));

    setTodos(nextTodos);
    saveTodos(nextTodos);
  }

  // Assigns or clears a tag on a specific todo.
  function assignTodoTag(id: string, tagId: string | null) {
    const nextTodos = todos.map((todo) => (todo.id === id ? { ...todo, tagId } : todo));

    setTodos(nextTodos);
    saveTodos(nextTodos);
  }

  // Sets or clears a task's due date. Date-only picks are stored as local-midnight timestamps.
  function setTodoDueDate(id: string, dueDate: number | null) {
    const nextTodos = todos.map((todo) => (todo.id === id ? { ...todo, dueDate } : todo));

    setTodos(nextTodos);
    saveTodos(nextTodos);
  }

  // Hides a todo from the cloud until the next local day.
  function markTodoNotToday(id: string) {
    const today = getLocalDateKey();
    const nextTodos = todos.map((todo) => (todo.id === id ? { ...todo, notToday: true, notTodayDate: today } : todo));

    setTodos(nextTodos);
    saveTodos(nextTodos);
  }

  // Removes a custom link from the saved list.
  function deleteLink(id: string) {
    const nextLinks = links.filter((link) => link.id !== id);

    setLinks(nextLinks);
    saveTodoList(todos, tags, nextLinks);
  }

  // Manually reloads the current user's todo list from Supabase.
  function refreshTodoList() {
    if (!session) return;

    loadTodoList(session.user.id);
  }

  // Edits a todo's text while preserving uniqueness by normalized text.
  function editTodoText(id: string, nextText: string) {
    const trimmedText = nextText.trim().replace(/\s+/g, " ");
    if (!trimmedText || isLoadingTodos) return false;

    const normalizedText = normalizeTodoText(trimmedText);
    const existingTodo = todos.find((todo) => todo.id !== id && normalizeTodoText(todo.text) === normalizedText);

    if (existingTodo) {
      showNotification(`"${existingTodo.text}" is already there.`);
      return false;
    }

    const nextTodos = todos.map((todo) => (todo.id === id ? { ...todo, text: trimmedText } : todo));

    setTodos(nextTodos);
    saveTodos(nextTodos);
    return true;
  }

  const updateTodo = useCallback(
    async (newTodo: Todo) => {
      const newTodos = todos.map((todo) => (todo.id === newTodo.id ? newTodo : todo));
      setTodos(newTodos);
      await saveTodos(newTodos);
    },
    [todos, setTodos, saveTodos],
  );

  // Deletes a tag and removes that tag assignment from all todos.
  function deleteTag(id: string) {
    const nextTags = tags.filter((tag) => tag.id !== id);
    const nextTodos = todos.map((todo) => (todo.tagId === id ? { ...todo, tagId: null } : todo));

    setTags(nextTags);
    setTodos(nextTodos);
    saveTodoList(nextTodos, nextTags, links);
  }

  const updateTags = useCallback(
    async (tags: TodoTag[]) => {
      setTags(tags);
      await saveTags(tags);
    },
    [saveTags, setTags],
  );

  const updateLinks = useCallback(
    async (links: CustomLink[]) => {
      setLinks(links);
      await saveLinks(links);
    },
    [saveLinks, setLinks],
  );

  const updateNotes = useCallback(
    async (notes: string) => {
      setNotes(notes);
      await saveNotes(notes);
    },
    [saveNotes, setNotes],
  );

  if (!isSupabaseConfigured) return <SetupRequired />;
  if (!session) return <AuthCard authError={authError} onSignIn={signInWithGoogle} />;
  if (isLoadingSession) return <LoadingComponent loading />;

  return (
    <Box sx={{ bgcolor: "background.body", color: "text.primary" }}>
      {saveError ? <p className="error">{saveError}</p> : null}

      <NotificationsToast notification={notification} />

      <AddTask
        isLoadingTodos={isLoadingTodos}
        suggestedTodos={doneTodos}
        text={text}
        onAddTodo={addTodo}
        onAddTodoText={addTodoText}
        onTextChange={setText}
      />

      <Box
        sx={{
          paddingTop: 2,
          minHeight: "100vh",
          width: "min(1300px, calc(100% - 32px))",
          display: "flex",
          gap: 2,
          margin: "0 auto",
        }}
      >
        <Box sx={{ gap: 2, display: "flex", flexDirection: "column", width: 230, minWidth: 230 }}>
          <TagsCard tags={tags} updateTags={updateTags} showNotification={showNotification} onDeleteTag={deleteTag} />
          <LinksCard
            links={links}
            updateLinks={updateLinks}
            onDeleteLink={deleteLink}
            showNotification={showNotification}
          />
          <NotNowList todos={todos} updateTodo={updateTodo} />
          <NotesCard notes={notes} setNotes={updateNotes} />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          <Header
            isLoadingTodos={isLoadingTodos}
            onRefresh={refreshTodoList}
            email={session.user.email}
            onSignOut={signOut}
          />
          <TodoCloud
            todos={todos}
            isLoadingTodos={isLoadingTodos}
            notTodayTodos={notTodayTodos}
            tags={tags}
            onAssignTodoTag={assignTodoTag}
            onSetTodoDueDate={setTodoDueDate}
            onEditTodoText={editTodoText}
            onMarkTodoNotToday={markTodoNotToday}
            onResetTodoCount={resetTodoCount}
            onToggleEndOfDayRepeat={toggleEndOfDayRepeat}
            onToggleTodo={toggleTodo}
            updateTodo={updateTodo}
          />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: 250, minWidth: 250 }}>
          <DoneCard
            todos={doneTodos}
            saveTodos={saveTodos}
            tags={tags}
            onAddTodoText={addTodoText}
            onAssignTodoTag={assignTodoTag}
            onDeleteTodo={deleteTodo}
            onResetTodoCount={resetTodoCount}
            onToggleEndOfDayRepeat={toggleEndOfDayRepeat}
          />
        </Box>
      </Box>
    </Box>
  );
}
