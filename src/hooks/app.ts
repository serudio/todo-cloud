import { useState } from "react";
import type { CustomLink, Todo, TodoTag } from "../types/todo";
import { getDoneTodos } from "../utils/todos";
import type { Notification } from "../types/notification";

export function useAppInit() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tags, setTags] = useState<TodoTag[]>([]);
  const [links, setLinks] = useState<CustomLink[]>([]);
  const [notes, setNotes] = useState("");

  const [notification, setNotification] = useState<Notification | null>(null);

  const doneTodos = getDoneTodos(todos);

  // Shows a toast message with a fresh id so repeated text still re-renders.
  function showNotification(message: string) {
    setNotification({
      id: crypto.randomUUID(),
      message,
    });
  }

  return {
    todos,
    setTodos,
    tags,
    setTags,
    links,
    setLinks,
    notes,
    setNotes,
    doneTodos,
    notification,
    setNotification,
    showNotification,
  };
}
