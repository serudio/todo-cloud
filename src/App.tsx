import { type FormEvent, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { LoadingPage } from "./components/AppState/LoadingPage";
import { NotificationToast } from "./components/AppState/NotificationToast";
import { SetupRequired } from "./components/AppState/SetupRequired";
import { AuthCard } from "./components/AuthCard";
import { DoneList } from "./components/DoneList";
import { LinksPanel } from "./components/LinksPanel/LinksPanel";
import { NotNowList } from "./components/NotNowList.tsx";
import { TagPanel } from "./components/TagPanel.tsx";
import { TodoCloud } from "./components/TodoCloud/TodoCloud";
import { TopBar } from "./components/TopBar";
import { isSupabaseConfigured, supabase } from "./supabase";
import type { Notification } from "./types/notification";
import type { CustomLink, Todo, TodoListItems, TodoTag } from "./types/todo";
import {
  createTodoList,
  getFirstTodoList,
  updateTodoListItems,
} from "./utils/db/todoLists";
import {
  normalizeTodoText,
  parseTodoListColumns,
  parseTodoListItems,
} from "./utils/todos";

const TAG_COLORS = [
  "#8f3d36",
  "#0F5C2E",
  "#ed4b82",
  "#8c9eff",
  "#8561c5",
  "#ef5350",
  "#d7f5ef",
  "#eeff41",
  "#3f50b5",
  "#e2e2e2",
];
const TODO_LIST_BACKUP_KEY_PREFIX = "todo-cloud:list-backup:";

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getNextMidnightDelay() {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);

  return nextMidnight.getTime() - now.getTime();
}

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

function getTodosWithDailyUpdates(currentTodos: Todo[]) {
  const todosWithoutExpiredNotToday =
    getTodosWithExpiredNotTodayCleared(currentTodos) ?? currentTodos;

  return (
    getTodosWithEndOfDayRepeats(todosWithoutExpiredNotToday) ??
    (todosWithoutExpiredNotToday === currentTodos
      ? null
      : todosWithoutExpiredNotToday)
  );
}

function getRandomInsertIndex(length: number) {
  return Math.floor(Math.random() * (length + 1));
}

function insertTodoAtRandomPosition(todos: Todo[], todo: Todo) {
  const nextTodos = [...todos];
  nextTodos.splice(getRandomInsertIndex(nextTodos.length), 0, todo);

  return nextTodos;
}

function moveTodoToRandomPosition(todos: Todo[], id: string) {
  const todo = todos.find((currentTodo) => currentTodo.id === id);
  if (!todo) return todos;

  return insertTodoAtRandomPosition(
    todos.filter((currentTodo) => currentTodo.id !== id),
    todo,
  );
}

function isEmptyTodoList(todos: Todo[], tags: TodoTag[], links: CustomLink[]) {
  return todos.length === 0 && tags.length === 0 && links.length === 0;
}

function isEmptyTodoListItems(items: TodoListItems) {
  return isEmptyTodoList(items.todos, items.tags, items.links);
}

function getTodoListBackupKey(userId: string) {
  return `${TODO_LIST_BACKUP_KEY_PREFIX}${userId}`;
}

function readBackedUpTodoList(userId: string) {
  const backedUpItems = window.localStorage.getItem(
    getTodoListBackupKey(userId),
  );
  if (!backedUpItems) return null;

  try {
    const parsedItems = parseTodoListItems(JSON.parse(backedUpItems));

    return isEmptyTodoListItems(parsedItems) ? null : parsedItems;
  } catch {
    return null;
  }
}

function backupTodoList(userId: string, items: TodoListItems) {
  if (isEmptyTodoListItems(items)) return;

  window.localStorage.setItem(
    getTodoListBackupKey(userId),
    JSON.stringify(items),
  );
}

function canSaveEmptyOverExistingItems(
  items: unknown,
  tags: unknown,
  links: unknown,
) {
  const parsedItems = parseTodoListColumns(items, tags, links);

  return isEmptyTodoListItems(parsedItems);
}

function normalizeCustomLinkUrl(url: string) {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return "";

  return /^https?:\/\//i.test(trimmedUrl)
    ? trimmedUrl
    : `https://${trimmedUrl}`;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingTodos, setIsLoadingTodos] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [todoListId, setTodoListId] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tags, setTags] = useState<TodoTag[]>([]);
  const [links, setLinks] = useState<CustomLink[]>([]);
  const todosRef = useRef<Todo[]>([]);
  const [text, setText] = useState("");
  const [notification, setNotification] = useState<Notification | null>(null);

  const suggestedTodos = [...todos]
    .filter((todo) => todo.done)
    .sort((firstTodo, secondTodo) => {
      if (firstTodo.doneAt && secondTodo.doneAt) {
        return secondTodo.doneAt.localeCompare(firstTodo.doneAt);
      }

      if (firstTodo.doneAt) return -1;
      if (secondTodo.doneAt) return 1;

      return secondTodo.count - firstTodo.count;
    });
  const activeTodos = todos.filter(
    (todo) => !todo.done && !todo.notNow && !todo.notToday,
  );
  const notNowTodos = todos.filter((todo) => !todo.done && todo.notNow);
  const notTodayTodos = todos.filter(
    (todo) => !todo.done && !todo.notNow && todo.notToday,
  );

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
      setTags([]);
      setLinks([]);
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

  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

  useEffect(() => {
    if (!session || !todoListId || isLoadingTodos) return;

    function applyDailyTodoUpdates() {
      const nextTodos = getTodosWithDailyUpdates(todosRef.current);
      if (!nextTodos) return;

      todosRef.current = nextTodos;
      setTodos(nextTodos);
      saveTodos(nextTodos);
    }

    applyDailyTodoUpdates();

    let timeoutId: number;

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
  }, [session, todoListId, isLoadingTodos, tags, links]);

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
      const parsedItems = parseTodoListColumns(
        data.items,
        data.tags,
        data.links,
      );
      const backedUpItems = isEmptyTodoListItems(parsedItems)
        ? readBackedUpTodoList(userId)
        : null;
      const nextItems = backedUpItems ?? parsedItems;

      setTodoListId(data.id);
      setTodos(nextItems.todos);
      setTags(nextItems.tags);
      setLinks(nextItems.links);
      setIsLoadingTodos(false);
      backupTodoList(userId, nextItems);

      if (backedUpItems) {
        showNotification("Restored your todo list from the local backup.");
        await updateTodoListItems(data.id, backedUpItems);
      }

      return;
    }

    const { data: createdTodoList, error: createError } =
      await createTodoList(userId);

    if (createError || !createdTodoList) {
      setSaveError(createError?.message ?? "Todo list could not be created.");
      setTodos([]);
      setTags([]);
      setLinks([]);
      setTodoListId(null);
      setIsLoadingTodos(false);
      return;
    }

    const createdItems = parseTodoListColumns(
      createdTodoList.items,
      createdTodoList.tags,
      createdTodoList.links,
    );

    setTodoListId(createdTodoList.id);
    setTodos(createdItems.todos);
    setTags(createdItems.tags);
    setLinks(createdItems.links);
    setIsLoadingTodos(false);
  }

  async function saveTodos(nextTodos: Todo[]) {
    saveTodoList(nextTodos, tags, links);
  }

  async function saveTodoList(
    nextTodos: Todo[],
    nextTags: TodoTag[],
    nextLinks: CustomLink[],
  ) {
    if (!supabase || !todoListId) return;

    setSaveError(null);

    if (isEmptyTodoList(nextTodos, nextTags, nextLinks)) {
      const { data, error } = await supabase
        .from("todo_lists")
        .select("items, tags, links")
        .eq("id", todoListId)
        .maybeSingle<{ items: unknown; tags: unknown; links: unknown }>();

      if (error) {
        setSaveError(error.message);
        return;
      }

      if (
        data &&
        !canSaveEmptyOverExistingItems(data.items, data.tags, data.links)
      ) {
        const message =
          "Refused to save an empty list over existing todo data. Refresh before making more changes.";
        setSaveError(message);
        showNotification(message);
        return;
      }
    }

    const nextItems = {
      todos: nextTodos,
      tags: nextTags,
      links: nextLinks,
    };
    const { error } = await updateTodoListItems(todoListId, nextItems);

    if (!error && session) {
      backupTodoList(session.user.id, nextItems);
    }

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

    const today = getLocalDateKey();
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
      : insertTodoAtRandomPosition(todos, {
          id: crypto.randomUUID(),
          text: trimmedText,
          done: false,
          doneAt: null,
          count: 1,
          lastAddedDate: today,
          repeatAtEndOfDay: false,
          lastAutoAddedDate: null,
          tagId: null,
          notNow: false,
          notToday: false,
          notTodayDate: null,
        });

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

  function resetTodoCount(id: string) {
    const nextTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, count: 0 } : todo,
    );

    setTodos(nextTodos);
    saveTodos(nextTodos);
  }

  function createTag(name: string, color: string) {
    const trimmedName = name.trim().replace(/\s+/g, " ");
    if (!trimmedName) return false;

    const existingTag = tags.find(
      (tag) => tag.name.toLocaleLowerCase() === trimmedName.toLocaleLowerCase(),
    );

    if (existingTag) {
      showNotification(`"${existingTag.name}" tag already exists.`);
      return false;
    }

    if (tags.some((tag) => tag.color === color)) {
      showNotification("That tag color is already used.");
      return false;
    }

    const nextTags = [
      ...tags,
      {
        id: crypto.randomUUID(),
        name: trimmedName,
        color,
      },
    ];

    setTags(nextTags);
    saveTodoList(todos, nextTags, links);
    return true;
  }

  function renameTag(id: string, name: string) {
    const trimmedName = name.trim().replace(/\s+/g, " ");
    if (!trimmedName) return false;

    const existingTag = tags.find(
      (tag) =>
        tag.id !== id &&
        tag.name.toLocaleLowerCase() === trimmedName.toLocaleLowerCase(),
    );

    if (existingTag) {
      showNotification(`"${existingTag.name}" tag already exists.`);
      return false;
    }

    const nextTags = tags.map((tag) =>
      tag.id === id ? { ...tag, name: trimmedName } : tag,
    );

    setTags(nextTags);
    saveTodoList(todos, nextTags, links);
    return true;
  }

  function updateTagColor(id: string, color: string) {
    if (tags.some((tag) => tag.id !== id && tag.color === color)) {
      showNotification("That tag color is already used.");
      return;
    }

    const nextTags = tags.map((tag) =>
      tag.id === id ? { ...tag, color } : tag,
    );

    setTags(nextTags);
    saveTodoList(todos, nextTags, links);
  }

  function deleteTag(id: string) {
    const nextTags = tags.filter((tag) => tag.id !== id);
    const nextTodos = todos.map((todo) =>
      todo.tagId === id ? { ...todo, tagId: null } : todo,
    );

    setTags(nextTags);
    setTodos(nextTodos);
    saveTodoList(nextTodos, nextTags, links);
  }

  function assignTodoTag(id: string, tagId: string | null) {
    const nextTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, tagId } : todo,
    );

    setTodos(nextTodos);
    saveTodos(nextTodos);
  }

  function markTodoNotNow(id: string) {
    const nextTodos = todos.map((todo) =>
      todo.id === id
        ? { ...todo, notNow: true, notToday: false, notTodayDate: null }
        : todo,
    );

    setTodos(nextTodos);
    saveTodos(nextTodos);
  }

  function restoreTodoFromNotNow(id: string) {
    const nextTodos = todos.map((todo) =>
      todo.id === id
        ? { ...todo, notNow: false, notToday: false, notTodayDate: null }
        : todo,
    );

    setTodos(nextTodos);
    saveTodos(nextTodos);
  }

  function markTodoNotToday(id: string) {
    const today = getLocalDateKey();
    const nextTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, notToday: true, notTodayDate: today } : todo,
    );

    setTodos(nextTodos);
    saveTodos(nextTodos);
  }

  function createLink(name: string, url: string) {
    const trimmedName = name.trim().replace(/\s+/g, " ");
    const normalizedUrl = normalizeCustomLinkUrl(url);
    if (!trimmedName || !normalizedUrl) return false;

    const existingLink = links.find(
      (link) =>
        link.name.toLocaleLowerCase() === trimmedName.toLocaleLowerCase(),
    );

    if (existingLink) {
      showNotification(`"${existingLink.name}" link already exists.`);
      return false;
    }

    const nextLinks = [
      ...links,
      {
        id: crypto.randomUUID(),
        name: trimmedName,
        url: normalizedUrl,
      },
    ];

    setLinks(nextLinks);
    saveTodoList(todos, tags, nextLinks);
    return true;
  }

  function updateLink(id: string, name: string, url: string) {
    const trimmedName = name.trim().replace(/\s+/g, " ");
    const normalizedUrl = normalizeCustomLinkUrl(url);
    if (!trimmedName || !normalizedUrl) return false;

    const existingLink = links.find(
      (link) =>
        link.id !== id &&
        link.name.toLocaleLowerCase() === trimmedName.toLocaleLowerCase(),
    );

    if (existingLink) {
      showNotification(`"${existingLink.name}" link already exists.`);
      return false;
    }

    const nextLinks = links.map((link) =>
      link.id === id
        ? { ...link, name: trimmedName, url: normalizedUrl }
        : link,
    );

    setLinks(nextLinks);
    saveTodoList(todos, tags, nextLinks);
    return true;
  }

  function deleteLink(id: string) {
    const nextLinks = links.filter((link) => link.id !== id);

    setLinks(nextLinks);
    saveTodoList(todos, tags, nextLinks);
  }

  function editTodoText(id: string, nextText: string) {
    const trimmedText = nextText.trim().replace(/\s+/g, " ");
    if (!trimmedText || isLoadingTodos) return false;

    const normalizedText = normalizeTodoText(trimmedText);
    const existingTodo = todos.find(
      (todo) =>
        todo.id !== id && normalizeTodoText(todo.text) === normalizedText,
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
        suggestedTodos={suggestedTodos}
        text={text}
        onAddTodo={addTodo}
        onAddTodoText={addTodoText}
        onSignOut={signOut}
        onTextChange={setText}
      />

      <div className="workspace">
        <div className="left-column">
          <TagPanel
            colors={TAG_COLORS}
            tags={tags}
            onCreateTag={createTag}
            onDeleteTag={deleteTag}
            onRenameTag={renameTag}
            onUpdateTagColor={updateTagColor}
          />

          <LinksPanel
            links={links}
            onCreateLink={createLink}
            onDeleteLink={deleteLink}
            onUpdateLink={updateLink}
          />

          <NotNowList
            todos={notNowTodos}
            onDropTodo={markTodoNotNow}
            onRestoreTodo={restoreTodoFromNotNow}
          />
        </div>

        <TodoCloud
          activeTodos={activeTodos}
          isLoadingTodos={isLoadingTodos}
          notTodayTodos={notTodayTodos}
          tags={tags}
          onAssignTodoTag={assignTodoTag}
          onEditTodoText={editTodoText}
          onMarkTodoNotToday={markTodoNotToday}
          onResetTodoCount={resetTodoCount}
          onRestoreTodo={restoreTodoFromNotNow}
          onToggleEndOfDayRepeat={toggleEndOfDayRepeat}
          onMarkTodoNotNow={markTodoNotNow}
          onToggleTodo={toggleTodo}
        />

        <DoneList
          todos={suggestedTodos}
          tags={tags}
          onAddTodoText={addTodoText}
          onAssignTodoTag={assignTodoTag}
          onDeleteTodo={deleteTodo}
          onResetTodoCount={resetTodoCount}
          onToggleEndOfDayRepeat={toggleEndOfDayRepeat}
        />
      </div>
      {saveError ? <p className="error">{saveError}</p> : null}
    </main>
  );
}
