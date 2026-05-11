import { useEffect, useState, type DragEvent } from "react";
import type { Todo, TodoTag } from "../../types/todo";
import { NotTodayList } from "./NotTodayList";
import { TodoItem } from "./TodoItem";
import { Box, Card } from "@mui/material";
import { LoadingComponent } from "../Layout/LoadingComponent";
import { getNotTodayTodos, markTodoNow } from "../../utils/todos";
import { Snoozed } from "./Snoozed";

const SNOOZE_DURATION_MS = 60 * 60 * 1000;
const SNOOZED_TODOS_STORAGE_KEY = "todo-cloud:snoozed-todos";

function getStoredSnoozedTodoExpirations() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const storedSnoozedTodos = window.localStorage.getItem(SNOOZED_TODOS_STORAGE_KEY);
    if (!storedSnoozedTodos) return {};

    const parsedSnoozedTodos = JSON.parse(storedSnoozedTodos) as unknown;
    if (!parsedSnoozedTodos || typeof parsedSnoozedTodos !== "object" || Array.isArray(parsedSnoozedTodos)) {
      return {};
    }

    const now = Date.now();
    return Object.fromEntries(
      Object.entries(parsedSnoozedTodos).filter(
        (entry): entry is [string, number] =>
          typeof entry[1] === "number" && Number.isFinite(entry[1]) && entry[1] > now,
      ),
    );
  } catch {
    return {};
  }
}
type Props = {
  todos: Todo[];
  isLoadingTodos: boolean;
  tags: TodoTag[];
  updateTodo: (todo: Todo) => void;
};

export const TodoCloud: React.FC<Props> = ({ todos, isLoadingTodos, tags, updateTodo }) => {
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [snoozedTodoExpirations, setSnoozedTodoExpirations] = useState<Record<string, number>>(
    getStoredSnoozedTodoExpirations,
  );
  const activeTodos = todos.filter((todo) => !todo.done && !todo.notNow && !todo.notToday);
  const notTodayTodos = getNotTodayTodos(todos);
  const cloudTodos = activeTodos.filter((todo) => !isTodoSnoozed(todo.id));
  const snoozedTodos = activeTodos.filter((todo) => isTodoSnoozed(todo.id));

  useEffect(() => {
    const nextSnoozeExpiry = Object.values(snoozedTodoExpirations)
      .filter((expiresAt) => expiresAt > currentTime)
      .sort((firstExpiry, secondExpiry) => firstExpiry - secondExpiry)[0];

    if (!nextSnoozeExpiry) {
      return;
    }

    const timeoutId = window.setTimeout(() => setCurrentTime(Date.now()), Math.max(0, nextSnoozeExpiry - currentTime));

    return () => window.clearTimeout(timeoutId);
  }, [currentTime, snoozedTodoExpirations]);

  useEffect(() => {
    const activeExpirations = Object.fromEntries(
      Object.entries(snoozedTodoExpirations).filter(([, expiresAt]) => expiresAt > currentTime),
    );

    window.localStorage.setItem(SNOOZED_TODOS_STORAGE_KEY, JSON.stringify(activeExpirations));
  }, [currentTime, snoozedTodoExpirations]);

  function isTodoSnoozed(todoId: string) {
    return (snoozedTodoExpirations[todoId] ?? 0) > currentTime;
  }

  function handleToggleSnooze(todoId: string) {
    const now = Date.now();
    setCurrentTime(now);
    setSnoozedTodoExpirations((currentExpirations) => {
      if ((currentExpirations[todoId] ?? 0) > now) {
        const nextExpirations = { ...currentExpirations };
        delete nextExpirations[todoId];
        return nextExpirations;
      }

      return { ...currentExpirations, [todoId]: now + SNOOZE_DURATION_MS };
    });
  }

  function handleRemoveSnooze(todoId: string) {
    setSnoozedTodoExpirations((currentExpirations) => {
      const nextExpirations = { ...currentExpirations };
      delete nextExpirations[todoId];
      return nextExpirations;
    });
  }

  function handleTodoDragStart(event: DragEvent<HTMLElement>, todoId: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", todoId);
  }

  function handleCloudDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleCloudDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();

    const todoId = event.dataTransfer.getData("text/plain");
    if (todoId) {
      const newTodo = todos.find((x) => x.id === todoId);
      if (!newTodo) return;
      setSnoozedTodoExpirations((currentExpirations) => {
        if (!(todoId in currentExpirations)) return currentExpirations;

        const nextExpirations = { ...currentExpirations };
        delete nextExpirations[todoId];
        return nextExpirations;
      });
      updateTodo(markTodoNow(newTodo));
    }
  }

  return (
    <Card sx={{ flex: 1, position: "relative", display: "flex" }}>
      <LoadingComponent loading={isLoadingTodos} />
      {!isLoadingTodos && notTodayTodos.length > 0 && <NotTodayList todos={notTodayTodos} updateTodo={updateTodo} />}
      {!isLoadingTodos && snoozedTodos.length > 0 && <Snoozed todos={snoozedTodos} updateTodo={handleRemoveSnooze} />}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          alignContent: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          position: "relative",
          minHeight: 300,
          gap: "18px 14px",
          flex: 1,
        }}
        onDragOver={handleCloudDragOver}
        onDrop={handleCloudDrop}
      >
        {!isLoadingTodos && activeTodos.length === 0 && <p>No todos yet. Add the first one.</p>}
        {cloudTodos.map((todo, index) => (
          <Box key={todo.id} sx={{ display: "inline-flex", overflow: "visible" }}>
            <TodoItem
              todo={todo}
              updateTodo={updateTodo}
              index={index}
              isSnoozed={false}
              onToggleSnooze={() => handleToggleSnooze(todo.id)}
              handleTodoDragStart={handleTodoDragStart}
              tags={tags}
            />
          </Box>
        ))}
      </Box>
    </Card>
  );
};
