import type { Todo } from "../types/todo";

const DELETED_TODOS_KEY_PREFIX = "todo-cloud:deleted-todos:";

export type DeletedTodo = Todo & {
  deletedAt: string;
};

export function readDeletedTodos(userId: string) {
  const savedItems = window.localStorage.getItem(getDeletedTodosKey(userId));
  if (!savedItems) return [];

  return parseDeletedTodos(savedItems);
}

export function saveDeletedTodos(userId: string, deletedTodos: DeletedTodo[]) {
  window.localStorage.setItem(getDeletedTodosKey(userId), JSON.stringify(deletedTodos));
}

export function clearDeletedTodos(userId: string) {
  window.localStorage.removeItem(getDeletedTodosKey(userId));
}

export function createDeletedTodo(todo: Todo): DeletedTodo {
  return {
    ...todo,
    deletedAt: new Date().toISOString(),
  };
}

export function restoreDeletedTodo(deletedTodo: DeletedTodo): Todo {
  const { deletedAt: _deletedAt, ...todo } = deletedTodo;

  return todo;
}

function getDeletedTodosKey(userId: string) {
  return `${DELETED_TODOS_KEY_PREFIX}${userId}`;
}

function parseDeletedTodos(savedItems: string) {
  try {
    const items = JSON.parse(savedItems);
    if (!Array.isArray(items)) return [];

    return items.flatMap((item): DeletedTodo[] => {
      if (!item || typeof item !== "object") return [];

      const deletedTodo = item as Record<string, unknown>;
      if (
        typeof deletedTodo.id !== "string" ||
        typeof deletedTodo.text !== "string" ||
        typeof deletedTodo.done !== "boolean" ||
        typeof deletedTodo.count !== "number" ||
        typeof deletedTodo.repeatAtEndOfDay !== "boolean" ||
        typeof deletedTodo.notNow !== "boolean" ||
        typeof deletedTodo.notToday !== "boolean"
      ) {
        return [];
      }

      return [
        {
          id: deletedTodo.id,
          text: deletedTodo.text,
          done: deletedTodo.done,
          doneAt: typeof deletedTodo.doneAt === "string" ? deletedTodo.doneAt : null,
          count: deletedTodo.count,
          lastAddedDate: typeof deletedTodo.lastAddedDate === "string" ? deletedTodo.lastAddedDate : null,
          repeatAtEndOfDay: deletedTodo.repeatAtEndOfDay,
          lastAutoAddedDate: typeof deletedTodo.lastAutoAddedDate === "string" ? deletedTodo.lastAutoAddedDate : null,
          tagId: typeof deletedTodo.tagId === "string" ? deletedTodo.tagId : null,
          dueDate: typeof deletedTodo.dueDate === "number" ? deletedTodo.dueDate : null,
          notNow: deletedTodo.notNow,
          notToday: deletedTodo.notToday,
          notTodayDate: typeof deletedTodo.notTodayDate === "string" ? deletedTodo.notTodayDate : null,
          deletedAt: typeof deletedTodo.deletedAt === "string" ? deletedTodo.deletedAt : "",
        },
      ];
    });
  } catch {
    return [];
  }
}
