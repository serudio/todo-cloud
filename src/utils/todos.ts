import type { Todo } from '../types/todo';

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
          count: typeof todo.count === 'number' && todo.count > 0 ? todo.count : 1,
        },
      ];
    }

    return [];
  });

  return mergeDuplicateTodos(todos);
}

export function normalizeTodoText(text: string) {
  return text.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
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
      count: existingTodo.count + todo.count,
    });
  }

  return [...todosByText.values()];
}

export function getTagSize(count: number) {
  return Math.min(5, Math.max(1, count));
}
