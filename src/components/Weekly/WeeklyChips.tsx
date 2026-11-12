import { Card, Chip, Tooltip, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import type { Todo } from "../../types/todo";
import { navigate, weeklyPath } from "../../hooks/route";
import {
  getDaysLeftInWeek,
  getDoneThisWeek,
  getWeeklyTarget,
  getWeeklyTodos,
  isWeeklyDoneToday,
  sortWeeklyByRemaining,
} from "../../utils/weekly";
import { matchesSearch } from "../../utils/search";

type Props = {
  todos: Todo[];
  search: string;
  onCountOne: (todoId: string) => void;
};

/**
 * The week's quotas, one line, above the cloud.
 *
 * A page you have to go to is a page you stop opening, so the counts live
 * where the day is actually spent and a tap counts one off without leaving.
 * Everything else about them is on the page behind the label.
 */
export const WeeklyChips: React.FC<Props> = ({ todos, search, onCountOne }) => {
  const daysLeft = getDaysLeftInWeek();
  const shownTodos = sortWeeklyByRemaining(getWeeklyTodos(todos)).filter((todo) => matchesSearch(search, todo.text));

  // Nothing set up, or nothing matching what is being searched for: the strip
  // is a reminder, and an empty reminder is just a bar taking up room.
  if (!shownTodos.length) return null;

  return (
    <Card sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap", px: 1, py: 0.5 }}>
      <Tooltip title="Open the week">
        <Typography
          variant="caption"
          color="text.secondary"
          onClick={() => navigate(weeklyPath)}
          role="button"
          sx={{ mr: 0.5, cursor: "pointer", textTransform: "uppercase", letterSpacing: 1.5 }}
        >
          weekly
        </Typography>
      </Tooltip>

      {shownTodos.map((todo) => {
        const done = getDoneThisWeek(todo);
        const target = getWeeklyTarget(todo);
        const isDone = done >= target;
        // Counted today: still owed this week, but already dealt with once
        // since this morning, which is the thing being asked at a glance.
        const isDoneToday = isWeeklyDoneToday(todo);

        return (
          <Tooltip
            key={todo.id}
            title={
              isDone
                ? "Done for the week — tap to count another"
                : `${isDoneToday ? "Counted today · " : ""}Tap to count one · ${daysLeft} days left`
            }
          >
            <Chip
              onClick={() => onCountOne(todo.id)}
              size="small"
              variant={isDone ? "filled" : "outlined"}
              color={isDone ? "success" : isDoneToday ? "warning" : "default"}
              icon={isDone ? <CheckIcon /> : undefined}
              label={`${todo.text || "untitled"} ${done}/${target}`}
              sx={{ height: 22, fontSize: 12, letterSpacing: 1.2 }}
            />
          </Tooltip>
        );
      })}
    </Card>
  );
};
