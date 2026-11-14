import { useCallback, useEffect, useRef, useState } from "react";
import type { CustomLink, Todo, TodoListItems, TodoTag } from "../types/todo";
import {
  getReleasedFromNotNow,
  getTodosWithDailyUpdates,
  getTodosWithWeekReleased,
  markTodoForWeek,
  markTodoOutOfWeek,
  parseTodoListColumns,
} from "../utils/todos";
import type { Session } from "@supabase/supabase-js";
import {
  clearDeletedTodos,
  createDeletedTodo,
  readDeletedTodos,
  restoreDeletedTodo,
  saveDeletedTodos,
  type DeletedTodo,
} from "../utils/deletedTodos";
import { supabase } from "../supabase";
import { createTodoList, getFirstTodoList, updateTodoListItems } from "../utils/db/todoLists";
import {
  backupTodoList,
  canSaveEmptyOverExistingItems,
  isEmptyTodoList,
  isEmptyTodoListItems,
  readBackedUpTodoList,
} from "../utils/todoListBackup";
import { getNextMidnightDelay } from "../utils/date";
import { createSaveQueue } from "../utils/saveQueue";
import { CLOUD_SORT_STORAGE_KEY, FULL_WIDTH_STORAGE_KEY } from "../constants/ui";

export function useAppInit() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tags, setTags] = useState<TodoTag[]>([]);
  const [links, setLinks] = useState<CustomLink[]>([]);
  const [notes, setNotes] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  // The side panels are overlays on a phone, so they must not start on top of the list.
  const isWideScreen = typeof window !== "undefined" && window.matchMedia("(min-width: 900px)").matches;
  const [showLeftMenu, setShowLeftMenu] = useState(isWideScreen);
  const [showRightMenu, setShowRightMenu] = useState(isWideScreen);
  // Search is a transient filter, so unlike the sort it is not remembered.
  const [search, setSearch] = useState("");
  // A view preference, so it lives in localStorage rather than the saved todo list.
  const [isCloudSortedByName, setIsCloudSortedByName] = useState(
    () => window.localStorage.getItem(CLOUD_SORT_STORAGE_KEY) === "name",
  );
  // Also a view preference: the side panels stay as they were underneath, they are
  // just not shown while the cloud has the whole window.
  const [isFullWidth, setIsFullWidth] = useState(() => window.localStorage.getItem(FULL_WIDTH_STORAGE_KEY) === "on");

  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingTodos, setIsLoadingTodos] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [todoListId, setTodoListId] = useState<string | null>(null);
  const todosRef = useRef<Todo[]>([]);
  // The version of the list on the server that this tab last read or wrote.
  // Every save names it, so a save from a copy that has gone stale is refused
  // rather than written over whatever has happened since.
  const listVersionRef = useRef<number | null>(null);
  // One save at a time, each naming the version the last came back with, and
  // anything queued against a copy that has since been reloaded is dropped.
  const saveQueueRef = useRef(createSaveQueue());
  const sessionUserIdRef = useRef<string | null>(null);
  const [deletedTodos, setDeletedTodos] = useState<DeletedTodo[]>([]);

  // Keeps a ref copy of todos so scheduled midnight callbacks see fresh state.
  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

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

  // Runs daily todo updates now and schedules them to repeat after each midnight.
  useEffect(() => {
    if (!session || !todoListId || isLoadingTodos) return;

    // Applies daily changes and persists them only when something changed.
    function applyDailyTodoUpdates() {
      const previousTodos = todosRef.current;
      const newTodos = getTodosWithDailyUpdates(previousTodos);
      if (!newTodos) return;

      todosRef.current = newTodos;
      setTodos(newTodos);
      saveTodos(newTodos);

      // Tasks reappearing on their own is surprising without a word about it.
      const releasedTodos = getReleasedFromNotNow(previousTodos, newTodos);

      if (releasedTodos.length === 1) {
        setNotification(`"${releasedTodos[0].text}" came back from Not Now.`);
      } else if (releasedTodos.length > 1) {
        setNotification(`${releasedTodos.length} tasks came back from Not Now.`);
      }
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

  // Manually reloads the current user's todo list from Supabase.
  function refreshTodoList() {
    if (!session) return;

    loadTodoList(session.user.id);
  }

  const handleLeftMenuClick = () => setShowLeftMenu((prev) => !prev);
  const handleRightMenuClick = () => setShowRightMenu((prev) => !prev);

  const handleFullWidthClick = () =>
    setIsFullWidth((prev) => {
      window.localStorage.setItem(FULL_WIDTH_STORAGE_KEY, prev ? "off" : "on");

      return !prev;
    });

  const handleCloudSortClick = () =>
    setIsCloudSortedByName((prev) => {
      window.localStorage.setItem(CLOUD_SORT_STORAGE_KEY, prev ? "stored" : "name");

      return !prev;
    });

  const closeNotification = () => setNotification(null);

  const loadTodoList = useCallback(
    async (userId: string) => {
      if (!supabase) return;

      setIsLoadingTodos(true);
      setSaveError(null);
      saveQueueRef.current.startNewCopy();

      const { data, error } = await getFirstTodoList(userId);

      if (error) {
        setSaveError(error.message);
        resetTodoList();
        setIsLoadingTodos(false);
        return;
      }

      if (data) {
        const parsedItems = parseTodoListColumns(data.items, data.tags, data.links, data.notes);
        const backedUpItems = isEmptyTodoListItems(parsedItems) ? readBackedUpTodoList(userId) : null;
        const newItems = backedUpItems ?? parsedItems;

        setTodoListId(data.id);
        listVersionRef.current = data.version;
        setTodoListItems(newItems);
        setIsLoadingTodos(false);
        backupTodoList(userId, newItems);

        if (backedUpItems) {
          setNotification("Restored your todo list from the local backup.");
          const { data: saved } = await updateTodoListItems(data.id, backedUpItems, data.version);
          if (saved) listVersionRef.current = saved.version;
        }

        return;
      }

      const { data: createdTodoList, error: createError } = await createTodoList(userId);

      if (createError || !createdTodoList) {
        setSaveError(createError?.message ?? "Todo list could not be created.");
        resetTodoList();
        setIsLoadingTodos(false);
        return;
      }

      const createdItems = parseTodoListColumns(
        createdTodoList.items,
        createdTodoList.tags,
        createdTodoList.links,
        createdTodoList.notes,
      );

      setTodoListId(createdTodoList.id);
      listVersionRef.current = createdTodoList.version;
      setTodoListItems(createdItems);
      setIsLoadingTodos(false);
    },
    [setIsLoadingTodos, setLinks, setNotes, setSaveError, setTags, setTodoListId, setTodos, setNotification],
  );

  const writeTodoList = useCallback(
    async (newTodos: Todo[], newTags: TodoTag[], newLinks: CustomLink[], newNotes: string) => {
      if (!supabase || !todoListId || listVersionRef.current === null) return;

      setSaveError(null);

      if (isEmptyTodoList(newTodos, newTags, newLinks, newNotes)) {
        const { data, error } = await supabase
          .from("todo_lists")
          .select("items, tags, links, notes")
          .eq("id", todoListId)
          .maybeSingle<{ items: unknown; tags: unknown; links: unknown; notes: unknown }>();

        if (error) {
          setSaveError(error.message);
          return;
        }

        if (data && !canSaveEmptyOverExistingItems(data.items, data.tags, data.links, data.notes)) {
          const message = "Refused to save an empty list over existing todo data. Refresh before making more changes.";
          setSaveError(message);
          setNotification(message);
          return;
        }
      }

      const newItems = { todos: newTodos, tags: newTags, links: newLinks, notes: newNotes };
      const { data, error } = await updateTodoListItems(todoListId, newItems, listVersionRef.current);

      if (error) {
        setSaveError(error.message);
        return;
      }

      // Nothing matched: the list on the server has moved on since this tab
      // last saw it — another tab, another device, a migration. Writing this
      // copy over it is how a whole list goes missing, so take the server's
      // version instead and say what happened. The change just made is the
      // price, and it is one change rather than everything since.
      if (!data) {
        if (session) await loadTodoList(session.user.id);
        setNotification("Your list changed somewhere else, so it was reloaded. Your last change wasn't saved.");
        return;
      }

      listVersionRef.current = data.version;

      if (session) backupTodoList(session.user.id, newItems);
    },
    [todoListId, session, setSaveError, setNotification, loadTodoList],
  );

  const saveTodoList = useCallback(
    (newTodos: Todo[], newTags: TodoTag[], newLinks: CustomLink[], newNotes: string) =>
      saveQueueRef.current.enqueue(() => writeTodoList(newTodos, newTags, newLinks, newNotes)),
    [writeTodoList],
  );

  function setTodoListItems(items: TodoListItems) {
    setTodos(items.todos);
    setTags(items.tags);
    setLinks(items.links);
    setNotes(items.notes);
  }

  function resetTodoList() {
    // No list, no version: a save with nothing to name is refused outright.
    listVersionRef.current = null;
    setTodos([]);
    setTags([]);
    setLinks([]);
    setNotes("");
    setTodoListId(null);
    setIsLoadingTodos(false);
  }

  const saveTodos = useCallback(
    async (newTodos: Todo[]) => saveTodoList(newTodos, tags, links, notes),
    [links, saveTodoList, tags, notes],
  );

  const saveTags = useCallback(
    async (newTags: TodoTag[]) => await saveTodoList(todosRef.current, newTags, links, notes),
    [links, notes, saveTodoList],
  );

  const saveLinks = useCallback(
    async (newLinks: CustomLink[]) => await saveTodoList(todosRef.current, tags, newLinks, notes),
    [tags, notes, saveTodoList],
  );

  const saveNotes = useCallback(
    async (newNotes: string) => await saveTodoList(todosRef.current, tags, links, newNotes),
    [tags, links, saveTodoList],
  );

  const updateTodos = useCallback(
    async (newTodos: Todo[]) => {
      // Assigned here rather than waiting for the effect after the render: two
      // taps inside one frame both read this, and the second has to see what
      // the first did or it writes the list back without it.
      todosRef.current = newTodos;
      setTodos(newTodos);
      await saveTodos(newTodos);
    },
    [setTodos, saveTodos],
  );

  const updateTodo = useCallback(
    async (newTodo: Todo) => {
      await updateTodos(todosRef.current.map((todo) => (todo.id === newTodo.id ? newTodo : todo)));
    },
    [updateTodos],
  );

  /**
   * Changes one task from what it is now rather than from what a render is
   * holding.
   *
   * Counting a weekly task off is the reason this exists: it happens fast,
   * often twice in a row, and each tap has to start from the result of the one
   * before it.
   */
  const applyToTodo = useCallback(
    async (todoId: string, change: (todo: Todo) => Todo) => {
      const currentTodo = todosRef.current.find((todo) => todo.id === todoId);

      if (!currentTodo) return;

      const newTodo = change(currentTodo);

      if (newTodo === currentTodo) return;

      await updateTodos(todosRef.current.map((todo) => (todo.id === todoId ? newTodo : todo)));
    },
    [updateTodos],
  );

  const addTodo = useCallback(
    async (newTodo: Todo) => updateTodos([...todosRef.current, newTodo]),
    [updateTodos],
  );

  // Moves a todo out of the saved list and into the local deleted history.
  function deleteTodo(id: string) {
    if (!session) return;

    const deletedTodo = todos.find((todo) => todo.id === id);
    if (!deletedTodo) return;

    const newTodos = todos.filter((todo) => todo.id !== id);
    const newDeletedTodos = [createDeletedTodo(deletedTodo), ...deletedTodos.filter((todo) => todo.id !== id)];

    updateTodos(newTodos);
    setDeletedTodos(newDeletedTodos);

    saveDeletedTodos(session.user.id, newDeletedTodos);
  }

  function clearDeletedItems() {
    if (!session) return;

    setDeletedTodos([]);
    clearDeletedTodos(session.user.id);
  }

  function removeDeletedItem(id: string) {
    if (!session) return;

    const newDeletedTodos = deletedTodos.filter((todo) => todo.id !== id);

    setDeletedTodos(newDeletedTodos);
    saveDeletedTodos(session.user.id, newDeletedTodos);
  }

  function restoreDeletedItem(id: string) {
    if (!session) return;

    const deletedTodo = deletedTodos.find((todo) => todo.id === id);
    if (!deletedTodo) return;

    const restoredTodo = restoreDeletedTodo(deletedTodo);
    const newTodos = [restoredTodo, ...todos.filter((todo) => todo.id !== id)];
    const newDeletedTodos = deletedTodos.filter((todo) => todo.id !== id);

    updateTodos(newTodos);
    setDeletedTodos(newDeletedTodos);
    saveDeletedTodos(session.user.id, newDeletedTodos);
  }

  // Gathering and releasing a single task is an ordinary todo update.
  const toggleTodoInWeek = useCallback(
    async (todoId: string) => {
      const todo = todosRef.current.find((currentTodo) => currentTodo.id === todoId);
      if (!todo) return;

      await updateTodo(todo.productiveWeek ? markTodoOutOfWeek(todo) : markTodoForWeek(todo));
    },
    [updateTodo],
  );

  // The whole point of the pile: when there is energy for it, it all comes back.
  const moveWeekToMain = useCallback(async () => {
    const newTodos = getTodosWithWeekReleased(todosRef.current);

    todosRef.current = newTodos;
    setTodos(newTodos);
    await saveTodos(newTodos);
  }, [saveTodos]);

  const updateTags = useCallback(
    async (tags: TodoTag[]) => {
      setTags(tags);
      await saveTags(tags);
    },
    [saveTags, setTags],
  );

  // Deletes a tag and removes that tag assignment from all todos.
  async function deleteTag(id: string) {
    const newTags = tags.filter((tag) => tag.id !== id);
    const newTodos = todos.map((todo) => (todo.tagId === id ? { ...todo, tagId: null } : todo));

    setTags(newTags);
    setTodos(newTodos);
    await saveTodoList(newTodos, newTags, links, notes);
  }

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

  return {
    session,
    isLoadingSession,

    saveError,

    refreshTodoList,

    showLeftMenu,
    handleLeftMenuClick,
    showRightMenu,
    handleRightMenuClick,
    isCloudSortedByName,
    handleCloudSortClick,
    isFullWidth,
    handleFullWidthClick,
    toggleTodoInWeek,
    moveWeekToMain,
    search,
    setSearch,

    todos,
    deletedTodos,
    deleteTodo,
    updateTodo,
    updateTodos,
    applyToTodo,
    addTodo,
    clearDeletedItems,
    removeDeletedItem,
    restoreDeletedItem,
    isLoadingTodos,

    tags,
    deleteTag,
    updateTags,

    links,
    notes,

    updateLinks,
    updateNotes,

    notification,
    setNotification,
    closeNotification,
  };
}
