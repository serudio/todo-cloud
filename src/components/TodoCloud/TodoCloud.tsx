import { useEffect, useState, type DragEvent } from "react";
import type { Todo, TodoTag } from "../../types/todo";
import type { WeeklyActivity } from "../../types/weekly";
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
import {
  isWeeklyDone,
  isWeeklyDoneToday,
  isWeeklyNotToday,
  isWeeklySnoozed,
  sortWeeklyActivities,
} from "../../utils/weekly";
import { WeeklyCloudItem } from "./WeeklyCloudItem";

type Props = {
  todos: Todo[];
  isLoadingTodos: boolean;
  isSortedByName: boolean;
  search: string;
  tags: TodoTag[];
  onToggleWeek: (todoId: string) => void;
  /** The week's quotas, which share the cloud with the tasks until they are met. */
  weeklyActivities: WeeklyActivity[];
  onCountWeekly: (activityId: string) => void;
  onSnoozeWeekly: (activityId: string) => void;
  onWakeWeekly: (activityId: string) => void;
  onNotTodayWeekly: (activityId: string) => void;
  onBringWeeklyBack: (activityId: string) => void;
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
  weeklyActivities,
  onCountWeekly,
  onSnoozeWeekly,
  onWakeWeekly,
  onNotTodayWeekly,
  onBringWeeklyBack,
  updateTodo,
  updateTodos,
  deleteTodo,
}) => {
  const isMobile = useIsMobile();
  const [actionsTodoId, setActionsTodoId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  // The search narrows every strip on this card, not just the cloud, so a hit is
  // never hidden behind a heading that still shows everything.
  const matchesTodo = (todo: Todo) => matchesSearch(search, todo.text, todo.link);

  const activeTodos = todos.filter(
    (todo) => !todo.done && !isTodoNotNow(todo) && !todo.notToday && !todo.productiveWeek && matchesTodo(todo),
  );
  const notTodayTodos = getNotTodayTodos(todos).filter(matchesTodo);
  const unsortedCloudTodos = activeTodos.filter((todo) => !isTodoSnoozed(todo, currentTime));
  const cloudTodos = isSortedByName ? getTodosSortedByName(unsortedCloudTodos) : unsortedCloudTodos;
  const snoozedTodos = activeTodos.filter((todo) => isTodoSnoozed(todo, currentTime));
  // Left in the order they were set up rather than sorted by what is left:
  // counting one off would otherwise slide the next quota under the pointer,
  // and the click after it would land on something else. The only move here is
  // the one that means something — a quota the week is done with drops out,
  // and comes back on Monday, because the counts are read from the week they
  // fall in: nothing has to run at midnight on Sunday for it to reappear.
  // The cloud is what is still owed today, so a quota leaves it the moment it
  // has been counted once — for the rest of the day if the week still wants
  // more, and until Monday if that was the last one. Both come back on their
  // own: the counts are read from the day and week they fall in.
  const owedWeekly = sortWeeklyActivities(weeklyActivities).filter(
    (activity) =>
      !isWeeklyDone(activity, currentTime) &&
      !isWeeklyDoneToday(activity, currentTime) &&
      matchesSearch(search, activity.name),
  );
  const notTodayWeekly = owedWeekly.filter((activity) => isWeeklyNotToday(activity));
  const snoozedWeekly = owedWeekly.filter(
    (activity) => !isWeeklyNotToday(activity) && isWeeklySnoozed(activity, currentTime),
  );
  const cloudWeekly = owedWeekly.filter(
    (activity) => !isWeeklyNotToday(activity) && !isWeeklySnoozed(activity, currentTime),
  );

  // Re-render when the earliest snooze runs out, so a task reappears on its own.
  useEffect(() => {
    const nextExpiry = [
      ...todos.map((todo) => todo.snoozedUntil),
      ...weeklyActivities.map((activity) => activity.snoozedUntil),
    ]
      .filter((expiresAt): expiresAt is number => typeof expiresAt === "number" && expiresAt > currentTime)
      .sort((first, second) => first - second)[0];

    if (!nextExpiry) return;

    const timeoutId = window.setTimeout(() => setCurrentTime(Date.now()), Math.max(0, nextExpiry - currentTime));

    return () => window.clearTimeout(timeoutId);
  }, [currentTime, todos, weeklyActivities]);

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
        {!isLoadingTodos && (notTodayTodos.length > 0 || notTodayWeekly.length > 0) && (
          <NotTodayList
            todos={notTodayTodos}
            allTodos={todos}
            updateTodo={updateTodo}
            updateTodos={updateTodos}
            weeklyActivities={notTodayWeekly}
            onBringWeeklyBack={onBringWeeklyBack}
          />
        )}

        {!isLoadingTodos && listTodos.length === 0 && cloudWeekly.length === 0 && snoozedWeekly.length === 0 && (
          <p>{isSearching(search) ? `Nothing matches "${search.trim()}".` : "No todos yet. Add the first one."}</p>
        )}

        {cloudWeekly.map((activity, index) => (
          <WeeklyCloudItem
            key={activity.id}
            activity={activity}
            index={index}
            isRow
            isSnoozed={false}
            onCount={() => onCountWeekly(activity.id)}
            onSnooze={() => onSnoozeWeekly(activity.id)}
            onNotToday={() => onNotTodayWeekly(activity.id)}
          />
        ))}

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

        {(snoozedTodos.length > 0 || snoozedWeekly.length > 0) && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              snoozed
            </Typography>
            {snoozedWeekly.map((activity, index) => (
              <WeeklyCloudItem
                key={activity.id}
                activity={activity}
                index={index}
                isRow
                isSnoozed
                onCount={() => onCountWeekly(activity.id)}
                onSnooze={() => onWakeWeekly(activity.id)}
                onNotToday={() => onNotTodayWeekly(activity.id)}
              />
            ))}
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
          onToggleWeek={onToggleWeek}
          onToggleSnooze={handleToggleSnooze}
          onDelete={deleteTodo}
          onClose={() => setActionsTodoId(null)}
        />
      </Card>
    );
  }

  return (
    <Card sx={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
      <LoadingComponent loading={isLoadingTodos} />
      {!isLoadingTodos && (notTodayTodos.length > 0 || notTodayWeekly.length > 0) && (
        <NotTodayList
          todos={notTodayTodos}
          allTodos={todos}
          updateTodo={updateTodo}
          updateTodos={updateTodos}
          weeklyActivities={notTodayWeekly}
          onBringWeeklyBack={onBringWeeklyBack}
        />
      )}
      {!isLoadingTodos && (snoozedTodos.length > 0 || snoozedWeekly.length > 0) && (
        <Snoozed
          todos={snoozedTodos}
          updateTodo={handleRemoveSnooze}
          weeklyActivities={snoozedWeekly}
          onWakeWeekly={onWakeWeekly}
        />
      )}
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
        }}
        onDragOver={handleCloudDragOver}
        onDrop={handleCloudDrop}
      >
        {!isLoadingTodos && activeTodos.length === 0 && cloudWeekly.length === 0 && (
          <p>{isSearching(search) ? `Nothing matches "${search.trim()}".` : "No todos yet. Add the first one."}</p>
        )}
        {cloudWeekly.map((activity, index) => (
          <Box key={activity.id} sx={{ display: "inline-flex", overflow: "visible" }}>
            <WeeklyCloudItem
              activity={activity}
              index={index}
              isSnoozed={false}
              onCount={() => onCountWeekly(activity.id)}
              onSnooze={() => onSnoozeWeekly(activity.id)}
              onNotToday={() => onNotTodayWeekly(activity.id)}
            />
          </Box>
        ))}

        {cloudTodos.map((todo, index) => (
          <Box key={todo.id} sx={{ display: "inline-flex", overflow: "visible" }}>
            <TodoItem
              todo={todo}
              updateTodo={updateTodo}
              index={index}
              isSnoozed={false}
              onToggleSnooze={() => handleToggleSnooze(todo.id)}
              onToggleWeek={onToggleWeek}
              handleTodoDragStart={handleTodoDragStart}
              tags={tags}
            />
          </Box>
        ))}
      </Box>
    </Card>
  );
};
