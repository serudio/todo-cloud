import type { CustomLink, Todo, TodoListItems, TodoTag } from '../types/todo';

export function parseTodoListItems(items: unknown): TodoListItems {
  if (Array.isArray(items)) {
    return {
      todos: parseTodos(items),
      tags: [],
      links: [],
    };
  }

  if (!items || typeof items !== 'object') {
    return {
      todos: [],
      tags: [],
      links: [],
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
  };
}

export function parseTodoListColumns(
  items: unknown,
  tags: unknown,
  links: unknown,
): TodoListItems {
  return {
    todos: parseTodos(items),
    tags: parseTags(tags),
    links: parseCustomLinks(links),
  };
}

export function parseTodos(items: unknown): Todo[] {
  if (!Array.isArray(items)) return [];

  const todos = items.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];

    const todo = item as Record<string, unknown>;

    if (
      typeof todo.id === 'string' &&
      typeof todo.text === 'string' &&
      typeof todo.done === 'boolean'
    ) {
      return [
        {
          id: todo.id,
          text: todo.text,
          done: todo.done,
          doneAt: typeof todo.doneAt === 'string' ? todo.doneAt : null,
          count: typeof todo.count === 'number' && todo.count >= 0 ? todo.count : 1,
          lastAddedDate:
            typeof todo.lastAddedDate === 'string' ? todo.lastAddedDate : null,
          repeatAtEndOfDay: todo.repeatAtEndOfDay === true,
          lastAutoAddedDate:
            typeof todo.lastAutoAddedDate === 'string'
              ? todo.lastAutoAddedDate
              : null,
          tagId: typeof todo.tagId === 'string' ? todo.tagId : null,
          notNow: todo.notNow === true,
          notToday: todo.notToday === true,
          notTodayDate:
            typeof todo.notTodayDate === 'string' ? todo.notTodayDate : null,
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
    if (!item || typeof item !== 'object') return [];

    const tag = item as Record<string, unknown>;

    if (
      typeof tag.id === 'string' &&
      typeof tag.name === 'string' &&
      typeof tag.color === 'string'
    ) {
      return [
        {
          id: tag.id,
          name: tag.name.trim().replace(/\s+/g, ' '),
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
    if (!item || typeof item !== 'object') return [];

    const link = item as Record<string, unknown>;

    if (
      typeof link.id === 'string' &&
      typeof link.name === 'string' &&
      typeof link.url === 'string'
    ) {
      return [
        {
          id: link.id,
          name: link.name.trim().replace(/\s+/g, ' '),
          url: link.url.trim(),
        },
      ];
    }

    return [];
  });
}

export function normalizeTodoText(text: string) {
  return text.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

export function formatDateKey(dateKey: string | null) {
  if (!dateKey) return 'not saved yet';

  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function isStaleTodo(lastAddedDate: string | null, date = new Date()) {
  if (!lastAddedDate) return false;

  const [year, month, day] = lastAddedDate.split('-').map(Number);
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
        text: todo.text.trim().replace(/\s+/g, ' '),
      });
      continue;
    }

    todosByText.set(normalizedText, {
      ...existingTodo,
      done: existingTodo.done && todo.done,
      doneAt: getLatestDate(existingTodo.doneAt, todo.doneAt),
      count: existingTodo.count + todo.count,
      lastAddedDate: getLatestDate(
        existingTodo.lastAddedDate,
        todo.lastAddedDate,
      ),
      repeatAtEndOfDay:
        existingTodo.repeatAtEndOfDay || todo.repeatAtEndOfDay,
      lastAutoAddedDate: getLatestDate(
        existingTodo.lastAutoAddedDate,
        todo.lastAutoAddedDate,
      ),
      tagId: existingTodo.tagId ?? todo.tagId,
      notNow: existingTodo.notNow && todo.notNow,
      notToday: existingTodo.notToday && todo.notToday,
      notTodayDate:
        existingTodo.notToday && todo.notToday
          ? getLatestDate(existingTodo.notTodayDate, todo.notTodayDate)
          : null,
    });
  }

  return [...todosByText.values()];
}

function getLatestDate(firstDate: string | null, secondDate: string | null) {
  if (!firstDate) return secondDate;
  if (!secondDate) return firstDate;

  return firstDate > secondDate ? firstDate : secondDate;
}

export function getTodoSize(count: number) {
  return Math.min(5, Math.max(1, count));
}
