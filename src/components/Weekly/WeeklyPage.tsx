import { useState } from "react";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import type { Todo } from "../../types/todo";
import { navigate, todosPath } from "../../hooks/route";
import {
  DEFAULT_WEEKLY_TARGET,
  formatWeekRange,
  getDaysLeftInWeek,
  getNewWeeklyTodo,
  getWeeklyTodos,
  getWeekStart,
  markWeeklyDone,
  sortWeeklyByRemaining,
  undoWeeklyDone,
} from "../../utils/weekly";
import { LoadingComponent } from "../Layout/LoadingComponent";
import { ConfirmDialog } from "../Shared/ConfirmDialog";
import { WeeklyActivityCard } from "./WeeklyActivityCard";
import { WeeklyTotalsCard } from "./WeeklyTotalsCard";

type Props = {
  // The whole list, because a weekly task is a task: it is in there with the
  // rest of them, and the cloud is counting against the same rows.
  todos: Todo[];
  isLoadingTodos: boolean;
  applyToTodo: (todoId: string, change: (todo: Todo) => Todo) => void;
  addTodo: (todo: Todo) => void;
  deleteTodo: (todoId: string) => void;
  onSettingsClick: () => void;
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
}) => {
  const [todoPendingDelete, setTodoPendingDelete] = useState<Todo | null>(null);
  // Typing is local until it is committed, so every keystroke is not a write of
  // the whole list; the text in hand wins over the one that came back.
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const daysLeft = getDaysLeftInWeek();
  const weeklyTodos = getWeeklyTodos(todos).map((todo) =>
    drafts[todo.id] === undefined ? todo : { ...todo, text: drafts[todo.id] },
  );
  const shownTodos = sortWeeklyByRemaining(weeklyTodos);

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
        <Button size="small" onClick={() => addTodo(getNewWeeklyTodo(DEFAULT_WEEKLY_TARGET))} startIcon={<AddIcon />}>
          add
        </Button>
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

      {/* A column each on a wide screen rather than one card per band: a line
          of five cells and a name does not need 1100px, and stacked full-width
          rows push the week off the bottom of the screen. */}
      <Box
        sx={{
          display: "grid",
          // minmax(0, …) rather than 1fr: a column floored at its content's
          // width would be pushed wider than a phone by the row of targets.
          gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" },
          alignItems: "start",
          gap: 1,
        }}
      >
        {shownTodos.map((todo) => (
          <WeeklyActivityCard
            key={todo.id}
            todo={todo}
            onChange={(input) => handleChange(todo.id, input)}
            onCommit={(input) => handleCommit(todo.id, input)}
            onCountOne={() => applyToTodo(todo.id, (current) => markWeeklyDone(current))}
            onUndoOne={() => applyToTodo(todo.id, (current) => undoWeeklyDone(current))}
            onDelete={() => setTodoPendingDelete(todo)}
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
