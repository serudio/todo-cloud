import type { CustomLink, Todo, TodoListItems, TodoTag } from "../types/todo";
import dayjs from "dayjs";
import { getDateInputValue, getLocalDateKey } from "./date";

export const markTodoNow = (todo: Todo) => ({ ...todo, notNow: false, notToday: false, notTodayDate: null });
export const markTodoNotNow = (todo: Todo) => ({ ...todo, notNow: true, notToday: false, notTodayDate: null });
export const markTodoNotToday = (todo: Todo) => ({ ...todo, notToday: true, notTodayDate: getLocalDateKey() });
export const markTodoDone = (todo: Todo) => {
  const now = new Date().toISOString();
  const newDone = !todo.done;
  return {
    ...todo,
    done: !todo.done,
    doneAt: newDone ? now : null,
    notNow: newDone ? todo.notNow : false,
    notToday: newDone ? todo.notToday : false,
    notTodayDate: newDone ? todo.notTodayDate : null,
  };
};
export const restoreTodoFromDone = (todo: Todo): Todo => {
  const today = getLocalDateKey();
  return {
    ...todo,
    count: todo.count + 1,
    done: false,
    doneAt: null,
    notNow: false,
    notToday: false,
    notTodayDate: null,
    lastAddedDate: today,
  };
};
export const getNewTodo = (todoText: string): Todo => {
  const today = getLocalDateKey();
  return {
    id: crypto.randomUUID(),
    text: todoText,
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
  };
};

export const getDoneTodos = (todos: Todo[]) => {
  return [...todos]
    .filter((todo) => todo.done)
    .sort((a, b) => {
      if (a.doneAt && b.doneAt) return b.doneAt.localeCompare(a.doneAt);
      if (a.doneAt) return -1;
      if (b.doneAt) return 1;

      return b.count - a.count;
    });
};
export const getNotTodayTodos = (todos: Todo[]) => todos.filter((todo) => !todo.done && !todo.notNow && todo.notToday);

// Normalizes a custom link URL and adds https:// when the scheme is missing.
export function normalizeCustomLinkUrl(url: string) {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return "";

  return /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
}

export function parseTodoListItems(items: unknown): TodoListItems {
  if (Array.isArray(items)) {
    return {
      todos: parseTodos(items),
      tags: [],
      links: [],
      notes: "",
    };
  }

  if (!items || typeof items !== "object") {
    return {
      todos: [],
      tags: [],
      links: [],
      notes: "",
    };
  }

  const listItems = items as Record<string, unknown>;
  const todosSource = Array.isArray(listItems.todos)
    ? listItems.todos
    : Array.isArray(listItems.items)
      ? listItems.items
      : Array.isArray(listItems.todosList)
        ? listItems.todosList
        : [];

  return {
    todos: parseTodos(todosSource),
    tags: parseTags(listItems.tags),
    links: parseCustomLinks(listItems.links),
    notes: parseNotes(listItems.notes),
  };
}

export function parseTodoListColumns(items: unknown, tags: unknown, links: unknown, notes: unknown): TodoListItems {
  return {
    todos: parseTodos(items),
    tags: parseTags(tags),
    links: parseCustomLinks(links),
    notes: parseNotes(notes),
  };
}

export function parseTodos(items: unknown): Todo[] {
  if (!Array.isArray(items)) return [];

  const todos = items.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const todo = item as Record<string, unknown>;

    if (typeof todo.id === "string" && typeof todo.text === "string" && typeof todo.done === "boolean") {
      return [
        {
          id: todo.id,
          text: todo.text,
          done: todo.done,
          doneAt: typeof todo.doneAt === "string" ? todo.doneAt : null,
          count: typeof todo.count === "number" && todo.count >= 0 ? todo.count : 1,
          lastAddedDate: typeof todo.lastAddedDate === "string" ? todo.lastAddedDate : null,
          repeatAtEndOfDay: todo.repeatAtEndOfDay === true,
          lastAutoAddedDate: typeof todo.lastAutoAddedDate === "string" ? todo.lastAutoAddedDate : null,
          tagId: typeof todo.tagId === "string" ? todo.tagId : null,
          dueDate: parseDueDate(todo.dueDate),
          notNow: todo.notNow === true,
          notToday: todo.notToday === true,
          notTodayDate: typeof todo.notTodayDate === "string" ? todo.notTodayDate : null,
        },
      ];
    }

    return [];
  });

  return mergeDuplicateTodos(todos);
}

function parseTags(items: unknown): TodoTag[] {
  if (!Array.isArray(items)) return [];

  return items.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const tag = item as Record<string, unknown>;

    if (typeof tag.id === "string" && typeof tag.name === "string" && typeof tag.color === "string") {
      return [
        {
          id: tag.id,
          name: tag.name.trim().replace(/\s+/g, " "),
          color: tag.color,
        },
      ];
    }

    return [];
  });
}

function parseCustomLinks(items: unknown): CustomLink[] {
  if (!Array.isArray(items)) return [];

  return items.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const link = item as Record<string, unknown>;

    if (typeof link.id === "string" && typeof link.name === "string" && typeof link.url === "string") {
      return [
        {
          id: link.id,
          name: link.name.trim().replace(/\s+/g, " "),
          url: link.url.trim(),
        },
      ];
    }

    return [];
  });
}

function parseNotes(notes: unknown) {
  return typeof notes === "string" ? notes : "";
}

export function normalizeTodoText(text: string) {
  return text.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function formatDateKey(dateValue: string | number | null) {
  if (!dateValue) return "not saved yet";

  const dateInputValue = getDateInputValue(dateValue);
  if (!dateInputValue) return "not saved yet";

  return dayjs(dateInputValue).format("MMM D, YYYY");
}

export function shouldHighlightDueDate(dueDate: string | number | null) {
  const dueDateInputValue = getDateInputValue(dueDate);
  if (!dueDateInputValue) return false;

  const today = dayjs().startOf("day");
  const highlightFrom = dayjs(dueDateInputValue).subtract(1, "day").startOf("day");

  return !today.isBefore(highlightFrom, "day");
}

export function getStartOfDayTimestamp(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0).getTime();
}

export function isStaleTodo(lastAddedDate: string | null, date = new Date()) {
  if (!lastAddedDate) return false;

  const [year, month, day] = lastAddedDate.split("-").map(Number);
  const addedDate = new Date(year, month - 1, day);
  const staleBefore = new Date(date);
  staleBefore.setMonth(staleBefore.getMonth() - 1);
  staleBefore.setHours(0, 0, 0, 0);

  return addedDate <= staleBefore;
}

function mergeDuplicateTodos(todos: Todo[]) {
  const todosByText = new Map<string, Todo>();

  for (const todo of todos) {
    const normalizedText = normalizeTodoText(todo.text);
    const existingTodo = todosByText.get(normalizedText);

    if (!existingTodo) {
      todosByText.set(normalizedText, {
        ...todo,
        text: todo.text.trim().replace(/\s+/g, " "),
      });
      continue;
    }

    todosByText.set(normalizedText, {
      ...existingTodo,
      done: existingTodo.done && todo.done,
      doneAt: getLatestDate(existingTodo.doneAt, todo.doneAt),
      count: existingTodo.count + todo.count,
      lastAddedDate: getLatestDate(existingTodo.lastAddedDate, todo.lastAddedDate),
      repeatAtEndOfDay: existingTodo.repeatAtEndOfDay || todo.repeatAtEndOfDay,
      lastAutoAddedDate: getLatestDate(existingTodo.lastAutoAddedDate, todo.lastAutoAddedDate),
      tagId: existingTodo.tagId ?? todo.tagId,
      dueDate: existingTodo.dueDate ?? todo.dueDate,
      notNow: existingTodo.notNow && todo.notNow,
      notToday: existingTodo.notToday && todo.notToday,
      notTodayDate:
        existingTodo.notToday && todo.notToday ? getLatestDate(existingTodo.notTodayDate, todo.notTodayDate) : null,
    });
  }

  return [...todosByText.values()];
}

function parseDueDate(dueDate: unknown) {
  if (typeof dueDate === "number" && Number.isFinite(dueDate)) {
    return dueDate;
  }

  if (typeof dueDate !== "string") return null;

  const dateInputValue = getDateInputValue(dueDate);
  if (dateInputValue) {
    return getStartOfDayTimestamp(dateInputValue);
  }

  const timestamp = Date.parse(dueDate);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function getLatestDate(firstDate: string | null, secondDate: string | null) {
  if (!firstDate) return secondDate;
  if (!secondDate) return firstDate;

  return firstDate > secondDate ? firstDate : secondDate;
}

export function getTodoSize(count: number) {
  return Math.min(5, Math.max(1, count));
}

// Applies one daily repeat to todos marked for end-of-day auto-add.
function getTodosWithEndOfDayRepeats(currentTodos: Todo[]) {
  const today = getLocalDateKey();
  let hasChanges = false;

  const newTodos = currentTodos.map((todo) => {
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

  return hasChanges ? newTodos : null;
}

// Moves "not today" todos back into the cloud after their saved day passes.
function getTodosWithExpiredNotTodayCleared(currentTodos: Todo[]) {
  const today = getLocalDateKey();
  let hasChanges = false;

  const newTodos = currentTodos.map((todo) => {
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

  return hasChanges ? newTodos : null;
}

// Combines all midnight-driven todo changes into one update pass.
export function getTodosWithDailyUpdates(currentTodos: Todo[]) {
  const todosWithoutExpiredNotToday = getTodosWithExpiredNotTodayCleared(currentTodos) ?? currentTodos;

  return (
    getTodosWithEndOfDayRepeats(todosWithoutExpiredNotToday) ??
    (todosWithoutExpiredNotToday === currentTodos ? null : todosWithoutExpiredNotToday)
  );
}
