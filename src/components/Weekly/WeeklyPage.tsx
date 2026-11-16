import { useState } from "react";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import type { Todo } from "../../types/todo";
import { navigate, todosPath } from "../../hooks/route";
import { markTodoBackToday, markTodoNotToday } from "../../utils/todos";
import {
  DEFAULT_WEEKLY_TARGET,
  formatWeekRange,
  getDaysLeftInWeek,
  getNewWeeklyTodo,
  getWeeklyTodos,
  getWeekStart,
  isWeeklyNotToday,
  markWeeklyDone,
  sortWeeklyByRemaining,
  undoWeeklyDone,
} from "../../utils/weekly";
import { LoadingComponent } from "../Layout/LoadingComponent";
import { ConfirmDialog } from "../Shared/ConfirmDialog";
import { WeeklyActivityCard } from "./WeeklyActivityCard";
import { WeeklyTotalsCard } from "./WeeklyTotalsCard";
import { AppLinks } from "../Layout/AppLinks";

type Props = {
  // The whole list, because a weekly task is a task: it is in there with the
  // rest of them, and the cloud is counting against the same rows.
  todos: Todo[];
  isLoadingTodos: boolean;
  applyToTodo: (todoId: string, change: (todo: Todo) => Todo) => void;
  addTodo: (todo: Todo) => void;
  deleteTodo: (todoId: string) => void;
  onSettingsClick: () => void;
  onRefresh: () => void;
};

/**
 * What is owed to the week.
 *
 * Counts come back every Monday and nothing carries over: a week that went
 * badly is over, not a debt. The point is to pace the week, and a running
 * total of everything missed since March would only make it a worse place to
 * look.
 */
export const WeeklyPage: React.FC<Props> = ({
  todos,
  isLoadingTodos,
  applyToTodo,
  addTodo,
  deleteTodo,
  onSettingsClick,
  onRefresh,
}) => {
  const [todoPendingDelete, setTodoPendingDelete] = useState<Todo | null>(null);
  // Typing is local until it is committed, so every keystroke is not a write of
  // the whole list; the text in hand wins over the one that came back.
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const daysLeft = getDaysLeftInWeek();
  const weeklyTodos = getWeeklyTodos(todos).map((todo) =>
    drafts[todo.id] === undefined ? todo : { ...todo, text: drafts[todo.id] },
  );
  // Not today ends at midnight, and the app re-renders then on its own, so
  // there is no clock to keep here.
  const shownTodos = sortWeeklyByRemaining(weeklyTodos, Date.now(), { isNotTodayAside: true });

  const handleToggleNotToday = (todoId: string) =>
    applyToTodo(todoId, (todo) => (isWeeklyNotToday(todo) ? markTodoBackToday(todo) : markTodoNotToday(todo)));

  const handleDeleteConfirm = () => {
    if (todoPendingDelete) deleteTodo(todoPendingDelete.id);
    setTodoPendingDelete(null);
  };

  const handleChange = (todoId: string, input: { text?: string; weeklyTarget?: number }) => {
    if (input.text !== undefined) setDrafts((previous) => ({ ...previous, [todoId]: input.text as string }));
  };

  const handleCommit = (todoId: string, input: { text?: string; weeklyTarget?: number }) => {
    applyToTodo(todoId, (todo) => ({
      ...todo,
      ...(input.text === undefined ? {} : { text: input.text.trim() }),
      ...(input.weeklyTarget === undefined ? {} : { weeklyTarget: input.weeklyTarget }),
    }));

    if (input.text === undefined) return;

    setDrafts((previous) => {
      const { [todoId]: _removed, ...rest } = previous;

      return rest;
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Button onClick={() => navigate(todosPath)} color="secondary" sx={{ minWidth: 0 }} aria-label="Back to tasks">
          <ArrowBackIcon />
        </Button>
        <Typography variant="subtitle2" sx={{ textTransform: "uppercase", letterSpacing: 2 }}>
          Weekly
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mr: "auto" }}>
          {formatWeekRange(getWeekStart())} · {daysLeft} {daysLeft === 1 ? "day" : "days"} left
        </Typography>
        {/* A line of their own on a phone, last, so the page's own controls
            keep the first one. */}
        <Box sx={{ order: { xs: 10, sm: 0 }, width: { xs: "100%", sm: "auto" } }}>
          <AppLinks />
        </Box>
        <Button size="small" onClick={() => addTodo(getNewWeeklyTodo(DEFAULT_WEEKLY_TARGET))} startIcon={<AddIcon />}>
          add
        </Button>
        {/* The same reload as the cloud's: this page reads the same list, and
            a count made on the phone should be one tap away on the laptop. */}
        <Tooltip title="Refresh">
          <span>
            <IconButton
              size="small"
              color="secondary"
              onClick={onRefresh}
              disabled={isLoadingTodos}
              aria-label="Refresh"
            >
              <RefreshRoundedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        {/* The theme lives in settings now, and this page is somewhere you can
            end up and stay — so it needs the same way in as the cloud has. */}
        <Tooltip title="Settings">
          <IconButton size="small" color="secondary" onClick={onSettingsClick} aria-label="Open settings">
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {isLoadingTodos && <LoadingComponent loading />}

      {!isLoadingTodos && !weeklyTodos.length && (
        <Typography>
          Things you owe the week rather than a day — read five times, yoga twice. Counts start again every Monday.
        </Typography>
      )}

      {/* The week as one line, before the things it is made of: whether this
          week is on track is the question the page is opened to answer. */}
      {weeklyTodos.length > 0 && <WeeklyTotalsCard todos={weeklyTodos} daysLeft={daysLeft} />}

      {/* One full-width row each: the name, its numbers and its buttons on
          one line read down the page as a list, which is what this is. */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {shownTodos.map((todo) => (
          <WeeklyActivityCard
            key={todo.id}
            todo={todo}
            onChange={(input) => handleChange(todo.id, input)}
            onCommit={(input) => handleCommit(todo.id, input)}
            onCountOne={() => applyToTodo(todo.id, (current) => markWeeklyDone(current))}
            onUndoOne={() => applyToTodo(todo.id, (current) => undoWeeklyDone(current))}
            onDelete={() => setTodoPendingDelete(todo)}
            isNotToday={isWeeklyNotToday(todo)}
            onToggleNotToday={() => handleToggleNotToday(todo.id)}
          />
        ))}
      </Box>

      <ConfirmDialog
        open={Boolean(todoPendingDelete)}
        title="Remove this?"
        message={`"${todoPendingDelete?.text || "Untitled"}" and everything counted against it will be gone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setTodoPendingDelete(null)}
      />
    </Box>
  );
};
