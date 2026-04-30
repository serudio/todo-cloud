export type Todo = {
  id: string;
  text: string;
  done: boolean;
  count: number;
};

export type TodoListRow = {
  id: string;
  name: string;
  items: unknown;
};
