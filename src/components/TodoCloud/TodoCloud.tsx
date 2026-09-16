import { useEffect, useState, type DragEvent } from "react";
import type { Todo, TodoTag } from "../../types/todo";
import { NotTodayList } from "./NotTodayList";
import { TodoItem } from "./TodoItem";
import { Box, Card, Typography } from "@mui/material";
import { LoadingComponent } from "../Layout/LoadingComponent";
import {
  getNotTodayTodos,
  getTodosSortedByName,
  isTodoNotNow,
  isTodoSnoozed,
  markTodoAwake,
  markTodoDone,
  markTodoNow,
  markTodoSnoozed,
} from "../../utils/todos";
import { isSearching, matchesSearch } from "../../utils/search";
import { Snoozed } from "./Snoozed";
import { SwipeableTodoRow } from "./SwipeableTodoRow";
import { TodoActionSheet } from "./TodoActionSheet";
import { useIsMobile } from "../../hooks/mobile";

type Props = {
  todos: Todo[];
  isLoadingTodos: boolean;
  isSortedByName: boolean;
  search: string;
  tags: TodoTag[];
  updateTodo: (todo: Todo) => void;
  deleteTodo: (todoId: string) => void;
};

export const TodoCloud: React.FC<Props> = ({
  todos,
  isLoadingTodos,
  isSortedByName,
  search,
  tags,
  updateTodo,
  deleteTodo,
}) => {
  const isMobile = useIsMobile();
  const [actionsTodoId, setActionsTodoId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  // The search narrows every strip on this card, not just the cloud, so a hit is
  // never hidden behind a heading that still shows everything.
  const matchesTodo = (todo: Todo) => matchesSearch(search, todo.text, todo.link);

  const activeTodos = todos.filter((todo) => !todo.done && !isTodoNotNow(todo) && !todo.notToday && matchesTodo(todo));
  const notTodayTodos = getNotTodayTodos(todos).filter(matchesTodo);
  const unsortedCloudTodos = activeTodos.filter((todo) => !isTodoSnoozed(todo, currentTime));
  const cloudTodos = isSortedByName ? getTodosSortedByName(unsortedCloudTodos) : unsortedCloudTodos;
  const snoozedTodos = activeTodos.filter((todo) => isTodoSnoozed(todo, currentTime));

  // Re-render when the earliest snooze runs out, so a task reappears on its own.
  useEffect(() => {
    const nextExpiry = todos
      .map((todo) => todo.snoozedUntil)
      .filter((expiresAt): expiresAt is number => typeof expiresAt === "number" && expiresAt > currentTime)
      .sort((first, second) => first - second)[0];

    if (!nextExpiry) return;

    const timeoutId = window.setTimeout(() => setCurrentTime(Date.now()), Math.max(0, nextExpiry - currentTime));

    return () => window.clearTimeout(timeoutId);
  }, [currentTime, todos]);

  function handleToggleSnooze(todoId: string) {
    const todo = todos.find((currentTodo) => currentTodo.id === todoId);
    if (!todo) return;

    setCurrentTime(Date.now());
    updateTodo(isTodoSnoozed(todo) ? markTodoAwake(todo) : markTodoSnoozed(todo));
  }

  function handleRemoveSnooze(todoId: string) {
    const todo = todos.find((currentTodo) => currentTodo.id === todoId);
    if (!todo) return;

    updateTodo(markTodoAwake(todo));
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

      // markTodoNow also clears any snooze, so a dropped task comes straight back.
      updateTodo(markTodoNow(newTodo));
    }
  }

  const actionsTodo = todos.find((todo) => todo.id === actionsTodoId) ?? null;

  if (isMobile) {
    const listTodos = cloudTodos;

    return (
      <Card sx={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", p: 1, gap: 0.5 }}>
        <LoadingComponent loading={isLoadingTodos} />
        {!isLoadingTodos && notTodayTodos.length > 0 && <NotTodayList todos={notTodayTodos} updateTodo={updateTodo} />}

        {!isLoadingTodos && listTodos.length === 0 && (
          <p>{isSearching(search) ? `Nothing matches "${search.trim()}".` : "No todos yet. Add the first one."}</p>
        )}

        {listTodos.map((todo) => (
          <SwipeableTodoRow
            key={todo.id}
            todo={todo}
            tags={tags}
            isSnoozed={false}
            onDone={() => updateTodo(markTodoDone(todo))}
            onSnooze={() => handleToggleSnooze(todo.id)}
            onOpenActions={() => setActionsTodoId(todo.id)}
          />
        ))}

        {snoozedTodos.length > 0 && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              snoozed
            </Typography>
            {snoozedTodos.map((todo) => (
              <SwipeableTodoRow
                key={todo.id}
                todo={todo}
                tags={tags}
                isSnoozed
                leftActionLabel="wake"
                onDone={() => updateTodo(markTodoDone(todo))}
                onSnooze={() => handleRemoveSnooze(todo.id)}
                onOpenActions={() => setActionsTodoId(todo.id)}
              />
            ))}
          </>
        )}

        <TodoActionSheet
          todo={actionsTodo}
          tags={tags}
          isSnoozed={Boolean(actionsTodo && isTodoSnoozed(actionsTodo, currentTime))}
          updateTodo={updateTodo}
          onToggleSnooze={handleToggleSnooze}
          onDelete={deleteTodo}
          onClose={() => setActionsTodoId(null)}
        />
      </Card>
    );
  }

  return (
    <Card sx={{ flex: 1, position: "relative", display: "flex", maxWidth: 1000 }}>
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
          padding: 1,
        }}
        onDragOver={handleCloudDragOver}
        onDrop={handleCloudDrop}
      >
        {!isLoadingTodos && activeTodos.length === 0 && (
          <p>{isSearching(search) ? `Nothing matches "${search.trim()}".` : "No todos yet. Add the first one."}</p>
        )}
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
