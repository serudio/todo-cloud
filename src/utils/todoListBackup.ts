import type { CustomLink, Todo, TodoListItems, TodoTag } from "../types/todo";
import { parseTodoListColumns, parseTodoListItems } from "./todos";

const TODO_LIST_BACKUP_KEY_PREFIX = "todo-cloud:list-backup:";

// Checks whether there is no user data worth persisting.
export function isEmptyTodoList(todos: Todo[], tags: TodoTag[], links: CustomLink[], notes: string) {
  return todos.length === 0 && tags.length === 0 && links.length === 0 && notes.trim() === "";
}

// Checks the full persisted todo-list shape for meaningful content.
export function isEmptyTodoListItems(items: TodoListItems) {
  return isEmptyTodoList(items.todos, items.tags, items.links, items.notes);
}

// Allows empty saves only when the latest remote row is already empty too.
export function canSaveEmptyOverExistingItems(items: unknown, tags: unknown, links: unknown, notes: unknown) {
  const parsedItems = parseTodoListColumns(items, tags, links, notes);

  return isEmptyTodoListItems(parsedItems);
}

// Reads and validates the local backup used to recover from empty remote data.
export function readBackedUpTodoList(userId: string) {
  const backedUpItems = window.localStorage.getItem(getTodoListBackupKey(userId));
  if (!backedUpItems) return null;

  try {
    const parsedItems = parseTodoListItems(JSON.parse(backedUpItems));

    return isEmptyTodoListItems(parsedItems) ? null : parsedItems;
  } catch {
    return null;
  }
}

// Saves a non-empty snapshot locally so accidental remote wipes can be restored.
export function backupTodoList(userId: string, items: TodoListItems) {
  if (isEmptyTodoListItems(items)) return;

  window.localStorage.setItem(getTodoListBackupKey(userId), JSON.stringify(items));
}

// Builds the localStorage key used for the user's emergency backup.
function getTodoListBackupKey(userId: string) {
  return `${TODO_LIST_BACKUP_KEY_PREFIX}${userId}`;
}
