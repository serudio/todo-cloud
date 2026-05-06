import { useState } from "react";
import type { CustomLink, Todo, TodoTag } from "../types/todo";
import { getDoneTodos } from "../utils/todos";

export function useAppInit() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tags, setTags] = useState<TodoTag[]>([]);
  const [links, setLinks] = useState<CustomLink[]>([]);
  const [notes, setNotes] = useState("");

  const [notification, setNotification] = useState<string | null>(null);

  const doneTodos = getDoneTodos(todos);

  const closeNotification = () => setNotification(null);

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
    closeNotification,
  };
}
