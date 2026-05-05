export type Todo = {
  id: string;
  text: string;
  done: boolean;
  doneAt: string | null;
  count: number;
  lastAddedDate: string | null;
  repeatAtEndOfDay: boolean;
  lastAutoAddedDate: string | null;
  tagId: string | null;
  dueDate: number | null;
  notNow: boolean;
  notToday: boolean;
  notTodayDate: string | null;
};

export type TodoTag = {
  id: string;
  name: string;
  color: string;
};

export type CustomLink = {
  id: string;
  name: string;
  url: string;
};

export type TodoListItems = {
  todos: Todo[];
  tags: TodoTag[];
  links: CustomLink[];
  notes: string;
};

export type TodoListRow = {
  id: string;
  name: string;
  items: unknown;
  tags: unknown;
  links: unknown;
  notes: unknown;
};
