import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import type { CustomLink, Todo, TodoListItems, TodoTag } from "../types/todo";
import { createTodoList, getFirstTodoList, updateTodoListItems } from "../utils/db/todoLists";
import { parseTodoListColumns } from "../utils/todos";
import {
  backupTodoList,
  canSaveEmptyOverExistingItems,
  isEmptyTodoList,
  isEmptyTodoListItems,
  readBackedUpTodoList,
} from "../utils/todoListBackup";

type UseTodoListPersistenceParams = {
  session: Session | null;
  todoListId: string | null;
  tags: TodoTag[];
  links: CustomLink[];
  notes: string;
  setTodos: Dispatch<SetStateAction<Todo[]>>;
  setTags: Dispatch<SetStateAction<TodoTag[]>>;
  setLinks: Dispatch<SetStateAction<CustomLink[]>>;
  setNotes: Dispatch<SetStateAction<string>>;
  setTodoListId: Dispatch<SetStateAction<string | null>>;
  setIsLoadingTodos: Dispatch<SetStateAction<boolean>>;
  setSaveError: Dispatch<SetStateAction<string | null>>;
  showNotification: (message: string) => void;
};

export function useTodoListPersistence({
  session,
  todoListId,
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
}: UseTodoListPersistenceParams) {
  const loadTodoList = useCallback(
    async (userId: string) => {
      if (!supabase) return;

      setIsLoadingTodos(true);
      setSaveError(null);

      const { data, error } = await getFirstTodoList(userId);

      if (error) {
        setSaveError(error.message);
        clearTodoListState();
        setIsLoadingTodos(false);
        return;
      }

      if (data) {
        const parsedItems = parseTodoListColumns(data.items, data.tags, data.links, data.notes);
        const backedUpItems = isEmptyTodoListItems(parsedItems) ? readBackedUpTodoList(userId) : null;
        const nextItems = backedUpItems ?? parsedItems;

        setTodoListId(data.id);
        applyTodoListItems(nextItems);
        setIsLoadingTodos(false);
        backupTodoList(userId, nextItems);

        if (backedUpItems) {
          showNotification("Restored your todo list from the local backup.");
          await updateTodoListItems(data.id, backedUpItems);
        }

        return;
      }

      const { data: createdTodoList, error: createError } = await createTodoList(userId);

      if (createError || !createdTodoList) {
        setSaveError(createError?.message ?? "Todo list could not be created.");
        clearTodoListState();
        setIsLoadingTodos(false);
        return;
      }

      const createdItems = parseTodoListColumns(createdTodoList.items, createdTodoList.tags, createdTodoList.links, createdTodoList.notes);

      setTodoListId(createdTodoList.id);
      applyTodoListItems(createdItems);
      setIsLoadingTodos(false);
    },
    [setIsLoadingTodos, setLinks, setNotes, setSaveError, setTags, setTodoListId, setTodos, showNotification],
  );

  const saveTodoList = useCallback(
    async (nextTodos: Todo[], nextTags: TodoTag[], nextLinks: CustomLink[], nextNotes = notes) => {
      if (!supabase || !todoListId) return;

      setSaveError(null);

      if (isEmptyTodoList(nextTodos, nextTags, nextLinks, nextNotes)) {
        const { data, error } = await supabase.from("todo_lists").select("items, tags, links, notes").eq("id", todoListId).maybeSingle<{
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
          showNotification(message);
          return;
        }
      }

      const nextItems = {
        todos: nextTodos,
        tags: nextTags,
        links: nextLinks,
        notes: nextNotes,
      };
      const { error } = await updateTodoListItems(todoListId, nextItems);

      if (!error && session) {
        backupTodoList(session.user.id, nextItems);
      }

      if (error) {
        setSaveError(error.message);
      }
    },
    [notes, todoListId, session, setSaveError, showNotification],
  );

  const saveTodos = useCallback(
    async (nextTodos: Todo[]) => {
      saveTodoList(nextTodos, tags, links);
    },
    [links, saveTodoList, tags],
  );

  return { loadTodoList, saveTodoList, saveTodos };

  function applyTodoListItems(items: TodoListItems) {
    setTodos(items.todos);
    setTags(items.tags);
    setLinks(items.links);
    setNotes(items.notes);
  }

  function clearTodoListState() {
    setTodos([]);
    setTags([]);
    setLinks([]);
    setNotes("");
    setTodoListId(null);
  }
}
