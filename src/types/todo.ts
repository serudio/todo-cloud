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
  link: string | null;
  dueDate: number | null;
  notNow: boolean;
  // Waiting in the productive week pile: out of the cloud until there is the
  // energy to take the whole pile on.
  productiveWeek: boolean;
  // The day it was set aside, so the monthly release can leave alone anything put
  // aside on the release day itself.
  notNowDate: string | null;
  // When set and still in the future the task is hidden from the list for a while.
  snoozedUntil: number | null;
  notToday: boolean;
  notTodayDate: string | null;
  // A task the week wants a number of times rather than once: how many times,
  // and one timestamp per time it has been done. Null on an ordinary task.
  // The count for any week is read back out of those timestamps, so no reset
  // has to run on Monday.
  weeklyTarget: number | null;
  weeklyDoneDates: number[];
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
  // The version of the row this copy was read at. A save only lands if the row
  // is still at that version, and the database refuses any save that does not
  // move it up by exactly one, so a copy that has gone stale cannot replace it.
  version: number;
};
