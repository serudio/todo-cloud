import { useCallback, useEffect, useRef, useState } from "react";
import type { CustomLink, Todo, TodoListItems, TodoTag } from "../types/todo";
import { getTodosWithDailyUpdates, parseTodoListColumns } from "../utils/todos";
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

export function useAppInit() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tags, setTags] = useState<TodoTag[]>([]);
  const [links, setLinks] = useState<CustomLink[]>([]);
  const [notes, setNotes] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingTodos, setIsLoadingTodos] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [todoListId, setTodoListId] = useState<string | null>(null);
  const todosRef = useRef<Todo[]>([]);
  const sessionUserIdRef = useRef<string | null>(null);
  const [text, setText] = useState("");
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

  // Manually reloads the current user's todo list from Supabase.
  function refreshTodoList() {
    if (!session) return;

    loadTodoList(session.user.id);
  }

  const closeNotification = () => setNotification(null);

  const loadTodoList = useCallback(
    async (userId: string) => {
      if (!supabase) return;

      setIsLoadingTodos(true);
      setSaveError(null);

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
        const nextItems = backedUpItems ?? parsedItems;

        setTodoListId(data.id);
        setTodoListItems(nextItems);
        setIsLoadingTodos(false);
        backupTodoList(userId, nextItems);

        if (backedUpItems) {
          setNotification("Restored your todo list from the local backup.");
          await updateTodoListItems(data.id, backedUpItems);
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
      setTodoListItems(createdItems);
      setIsLoadingTodos(false);
    },
    [setIsLoadingTodos, setLinks, setNotes, setSaveError, setTags, setTodoListId, setTodos, setNotification],
  );

  const saveTodoList = useCallback(
    async (newTodos: Todo[], newTags: TodoTag[], newLinks: CustomLink[], newNotes: string) => {
      if (!supabase || !todoListId) return;

      setSaveError(null);

      if (isEmptyTodoList(newTodos, newTags, newLinks, newNotes)) {
        const { data, error } = await supabase
          .from("todo_lists")
          .select("items, tags, links, notes")
          .eq("id", todoListId)
          .maybeSingle<{
            items: unknown;
            tags: unknown;
            links: unknown;
            notes: unknown;
          }>();

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

      const nextItems = {
        todos: newTodos,
        tags: newTags,
        links: newLinks,
        notes: newNotes,
      };
      const { error } = await updateTodoListItems(todoListId, nextItems);

      if (!error && session) {
        backupTodoList(session.user.id, nextItems);
      }

      if (error) {
        setSaveError(error.message);
      }
    },
    [notes, todoListId, session, setSaveError, setNotification],
  );

  function setTodoListItems(items: TodoListItems) {
    setTodos(items.todos);
    setTags(items.tags);
    setLinks(items.links);
    setNotes(items.notes);
  }

  function resetTodoList() {
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
    async (newTags: TodoTag[]) => await saveTodoList(todos, newTags, links, notes),
    [links, notes, saveTodoList, todos],
  );

  const saveLinks = useCallback(
    async (newLinks: CustomLink[]) => await saveTodoList(todos, tags, newLinks, notes),
    [tags, notes, saveTodoList, todos],
  );

  const saveNotes = useCallback(
    async (newNotes: string) => await saveTodoList(todos, tags, links, newNotes),
    [tags, links, saveTodoList, todos],
  );

  const updateTodos = useCallback(
    async (newTodos: Todo[]) => {
      setTodos(newTodos);
      await saveTodos(newTodos);
    },
    [todos, setTodos, saveTodos],
  );

  const updateTodo = useCallback(
    async (newTodo: Todo) => {
      const newTodos = todos.map((todo) => (todo.id === newTodo.id ? newTodo : todo));
      setTodos(newTodos);
      await saveTodos(newTodos);
    },
    [todos, setTodos, saveTodos],
  );

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

  const updateTags = useCallback(
    async (tags: TodoTag[]) => {
      setTags(tags);
      await saveTags(tags);
    },
    [saveTags, setTags],
  );

  // Deletes a tag and removes that tag assignment from all todos.
  function deleteTag(id: string) {
    const nextTags = tags.filter((tag) => tag.id !== id);
    const nextTodos = todos.map((todo) => (todo.tagId === id ? { ...todo, tagId: null } : todo));

    setTags(nextTags);
    setTodos(nextTodos);
    saveTodoList(nextTodos, nextTags, links, notes);
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

    loadTodoList,
    refreshTodoList,

    todos,
    setTodos,
    deletedTodos,
    setDeletedTodos,
    deleteTodo,
    updateTodo,
    clearDeletedItems,
    removeDeletedItem,
    restoreDeletedItem,
    isLoadingTodos,
    text,
    setText,

    saveTodos,

    tags,
    deleteTag,
    links,
    notes,

    updateTags,
    updateLinks,
    updateNotes,

    notification,
    setNotification,
    closeNotification,
  };
}
