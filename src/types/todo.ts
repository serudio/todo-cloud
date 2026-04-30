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
  notNow: boolean;
  notToday: boolean;
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
};

export type TodoListRow = {
  id: string;
  name: string;
  items: unknown;
  tags: unknown;
  links: unknown;
};
