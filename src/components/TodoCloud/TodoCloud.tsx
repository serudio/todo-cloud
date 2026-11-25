import { useEffect, useState, type DragEvent } from "react";
import type { Todo, TodoTag } from "../../types/todo";
import { NotTodayList } from "./NotTodayList";
import { TodoItem } from "./TodoItem";
import { Box, Card, Typography } from "@mui/material";
import {
  getNotTodayTodos,
  getTodosSortedByName,
  isTodoNotNow,
  isTodoSnoozed,
  markTodoAwake,
  markTodoDone,
  markTodoNotToday,
  markTodoNow,
  markTodoSnoozed,
} from "../../utils/todos";
import { isSearching, matchesSearch } from "../../utils/search";
import { Snoozed } from "./Snoozed";
import { SwipeableTodoRow } from "./SwipeableTodoRow";
import { TodoActionSheet } from "./TodoActionSheet";
import { useIsMobile } from "../../hooks/mobile";
import { useToday } from "../../hooks/day";
import { isWeeklyDone, isWeeklyDoneToday, isWeeklyTodo } from "../../utils/weekly";
import { WeeklyCloudItem } from "./WeeklyCloudItem";
import cloudBackground from "../../assets/cloud-background.webp";

type Props = {
  todos: Todo[];
  isLoadingTodos: boolean;
  isSortedByName: boolean;
  search: string;
  tags: TodoTag[];
  onToggleWeek: (todoId: string) => void;
  /** Counting one off a weekly task: the only thing it does that a task does not. */
  onCountWeekly: (todoId: string) => void;
  updateTodo: (todo: Todo) => void;
  updateTodos: (todos: Todo[]) => void;
  deleteTodo: (todoId: string) => void;
};

export const TodoCloud: React.FC<Props> = ({
  todos,
  isLoadingTodos,
  isSortedByName,
  search,
  tags,
  onToggleWeek,
  onCountWeekly,
  updateTodo,
  updateTodos,
  deleteTodo,
}) => {
  const isMobile = useIsMobile();
  const [actionsTodoId, setActionsTodoId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const today = useToday();
  // The search narrows every strip on this card, not just the cloud, so a hit is
  // never hidden behind a heading that still shows everything.
  const matchesTodo = (todo: Todo) => matchesSearch(search, todo.text, todo.link);

  const activeTodos = todos.filter(
    (todo) => !todo.done && !isTodoNotNow(todo) && !todo.notToday && !todo.productiveWeek && matchesTodo(todo),
  );
  // The cloud is what is still owed today, so a weekly task leaves it the
  // moment it has been counted once — for the rest of the day if the week
  // still wants more, and until Monday if that was the last one. Both come
  // back on their own, from the day and week the counts fall in, as long as
  // this is asked again: hence the midnight tick below.
  const owedTodos = activeTodos.filter(
    (todo) => !isWeeklyTodo(todo) || (!isWeeklyDone(todo, currentTime) && !isWeeklyDoneToday(todo, currentTime)),
  );
  const notTodayTodos = getNotTodayTodos(todos).filter(matchesTodo);
  const unsortedCloudTodos = owedTodos.filter((todo) => !isTodoSnoozed(todo, currentTime));
  const cloudTodos = isSortedByName ? getTodosSortedByName(unsortedCloudTodos) : unsortedCloudTodos;
  const snoozedTodos = owedTodos.filter((todo) => isTodoSnoozed(todo, currentTime));
  // Midnight makes every "today" in here wrong at once: a weekly task counted
  // yesterday is owed again this morning, and would otherwise stay out of the
  // cloud all day in a tab that was left open overnight.
  useEffect(() => {
    setCurrentTime(Date.now());
  }, [today]);

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
  // The loader itself is the page's; here the first load only holds back the
  // empty-list message and the strips, so they do not flash in before the list.
  const isFirstLoad = isLoadingTodos && todos.length === 0;

  if (isMobile) {
    const listTodos = cloudTodos;

    return (
      <Card sx={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", p: 1, gap: 0.5 }}>
        {!isFirstLoad && notTodayTodos.length > 0 && (
          <NotTodayList todos={notTodayTodos} allTodos={todos} updateTodo={updateTodo} updateTodos={updateTodos} />
        )}

        {!isFirstLoad && listTodos.length === 0 && (
          <p>{isSearching(search) ? `Nothing matches "${search.trim()}".` : "No todos yet. Add the first one."}</p>
        )}

        {listTodos.map((todo) =>
          isWeeklyTodo(todo) ? (
            <WeeklyCloudItem
              key={todo.id}
              todo={todo}
              isRow
              isSnoozed={false}
              onCount={() => onCountWeekly(todo.id)}
              onSnooze={() => handleToggleSnooze(todo.id)}
              onNotToday={() => updateTodo(markTodoNotToday(todo))}
            />
          ) : (
            <SwipeableTodoRow
              key={todo.id}
              todo={todo}
              tags={tags}
              isSnoozed={false}
              onDone={() => updateTodo(markTodoDone(todo))}
              onSnooze={() => handleToggleSnooze(todo.id)}
              onOpenActions={() => setActionsTodoId(todo.id)}
            />
          ),
        )}

        {snoozedTodos.length > 0 && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              snoozed
            </Typography>
            {snoozedTodos.map((todo) =>
              isWeeklyTodo(todo) ? (
                <WeeklyCloudItem
                  key={todo.id}
                  todo={todo}
                  isRow
                  isSnoozed
                  onCount={() => onCountWeekly(todo.id)}
                  onSnooze={() => handleRemoveSnooze(todo.id)}
                  onNotToday={() => updateTodo(markTodoNotToday(todo))}
                />
              ) : (
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
              ),
            )}
          </>
        )}

        <TodoActionSheet
          todo={actionsTodo}
          tags={tags}
          isSnoozed={Boolean(actionsTodo && isTodoSnoozed(actionsTodo, currentTime))}
          updateTodo={updateTodo}
          onToggleWeek={onToggleWeek}
          onToggleSnooze={handleToggleSnooze}
          onDelete={deleteTodo}
          onClose={() => setActionsTodoId(null)}
        />
      </Card>
    );
  }

  return (
    // The bounds a tile's hover card keeps inside, so it is never cut off at the edge.
    <Card
      data-cloud-bounds
      sx={{
        flex: 1,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        // "Do one until done" behind the tiles: contained rather than cropped,
        // so the line reads whole at any width, on the image's own black, and
        // a little dimmed so the tiles crossing it still read first.
        backgroundColor: "#0e0e0e",
        // No dark-mode paper sheen: the card is the picture's own black.
        backgroundImage: "none",
        isolation: "isolate",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
          backgroundImage: `url(${cloudBackground})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          opacity: 0.7,
        },
      }}
    >
      {!isFirstLoad && notTodayTodos.length > 0 && (
        <NotTodayList todos={notTodayTodos} allTodos={todos} updateTodo={updateTodo} updateTodos={updateTodos} />
      )}
      {!isFirstLoad && snoozedTodos.length > 0 && <Snoozed todos={snoozedTodos} updateTodo={handleRemoveSnooze} />}
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
          paddingTop: 4,
          // Room under the last row for its hover card, which hangs below the tile.
          paddingBottom: 6,
        }}
        onDragOver={handleCloudDragOver}
        onDrop={handleCloudDrop}
      >
        {!isFirstLoad && activeTodos.length === 0 && (
          <p>{isSearching(search) ? `Nothing matches "${search.trim()}".` : "No todos yet. Add the first one."}</p>
        )}
        {cloudTodos.map((todo) => (
          <Box key={todo.id} sx={{ display: "inline-flex", overflow: "visible" }}>
            {isWeeklyTodo(todo) ? (
              <WeeklyCloudItem
                todo={todo}
                isSnoozed={false}
                onCount={() => onCountWeekly(todo.id)}
                onSnooze={() => handleToggleSnooze(todo.id)}
                onNotToday={() => updateTodo(markTodoNotToday(todo))}
              />
            ) : (
              <TodoItem
                todo={todo}
                updateTodo={updateTodo}
                isSnoozed={false}
                onToggleSnooze={() => handleToggleSnooze(todo.id)}
                onToggleWeek={onToggleWeek}
                handleTodoDragStart={handleTodoDragStart}
                tags={tags}
              />
            )}
          </Box>
        ))}
      </Box>
    </Card>
  );
};
