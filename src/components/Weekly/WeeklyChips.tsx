import { useState } from "react";
import { Box, Card, Chip, Tooltip, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import type { Todo } from "../../types/todo";
import { navigate, weeklyPath } from "../../hooks/route";
import {
  getDaysLeftInWeek,
  getDoneThisWeek,
  getWeeklyTarget,
  getWeeklyTodos,
  isWeeklyDone,
  isWeeklyDoneToday,
  isWeeklyNotToday,
  sortWeeklyByRemaining,
} from "../../utils/weekly";
import { matchesSearch } from "../../utils/search";
import { useHiddenPastFirstRow } from "../../hooks/firstRow";

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
  // Not remembered across reloads: the strip is for what is still owed today,
  // and showing the rest is a look, not a setting.
  const [isShowingSetAside, setIsShowingSetAside] = useState(false);
  const daysLeft = getDaysLeftInWeek();
  // Not today sorted to the end with the finished ones, so showing them adds
  // to the end of the line rather than shuffling what is already there.
  const matchingTodos = sortWeeklyByRemaining(getWeeklyTodos(todos), Date.now(), { isNotTodayAside: true }).filter(
    (todo) => matchesSearch(search, todo.text),
  );
  // Done for the week, counted already today, or put off for today: nothing
  // to do about any of them now, so they wait behind the button at the end.
  const isSetAside = (todo: Todo) => isWeeklyDone(todo) || isWeeklyDoneToday(todo) || isWeeklyNotToday(todo);
  const setAsideCount = matchingTodos.filter(isSetAside).length;
  const shownTodos = isShowingSetAside ? matchingTodos : matchingTodos.filter((todo) => !isSetAside(todo));
  // One row unless asked for the rest, so a long week does not push the
  // cloud down the page.
  const [isExpanded, setIsExpanded] = useState(false);
  const { ref: chipsRef, hiddenCount } = useHiddenPastFirstRow<HTMLDivElement>(
    shownTodos.map((todo) => todo.id).join(),
  );

  // Nothing set up, or nothing matching what is being searched for: the strip
  // is a reminder, and an empty reminder is just a bar taking up room.
  if (!matchingTodos.length) return null;

  return (
    // The label and the buttons stay on the first row; the chips wrap between
    // them when the strip is opened.
    <Card sx={{ display: "flex", alignItems: "flex-start", gap: 0.5, px: 1, py: 0.5 }}>
      <Tooltip title="Open the week">
        <Typography
          variant="caption"
          color="text.secondary"
          onClick={() => navigate(weeklyPath)}
          role="button"
          sx={{ mr: 0.5, lineHeight: "22px", cursor: "pointer", textTransform: "uppercase", letterSpacing: 1.5 }}
        >
          weekly
        </Typography>
      </Tooltip>

      <Box
        ref={chipsRef}
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexWrap: "wrap",
          gap: 0.5,
          // One chip high, the rest cut off below, until the strip is opened.
          maxHeight: isExpanded ? "none" : 22,
          overflow: "hidden",
        }}
      >
        {shownTodos.map((todo) => {
          const done = getDoneThisWeek(todo);
          const target = getWeeklyTarget(todo);
          const isDone = done >= target;
          // Counted today: still owed this week, but already dealt with once
          // since this morning, which is the thing being asked at a glance.
          const isDoneToday = isWeeklyDoneToday(todo);
          const isNotToday = isWeeklyNotToday(todo);

          return (
            <Tooltip
              key={todo.id}
              title={
                isDone
                  ? "Done for the week — tap to count another"
                  : `${isNotToday ? "Not today · " : isDoneToday ? "Counted today · " : ""}Tap to count one · ${daysLeft} days left`
              }
            >
              <Chip
                onClick={() => onCountOne(todo.id)}
                size="small"
                variant={isDone ? "filled" : "outlined"}
                color={isDone ? "success" : isDoneToday ? "warning" : "default"}
                icon={isDone ? <CheckIcon /> : undefined}
                label={`${todo.text || "untitled"} ${done}/${target}`}
                sx={{ height: 22, fontSize: 12, letterSpacing: 1.2, ...(isNotToday && !isDone && { opacity: 0.55 }) }}
              />
            </Tooltip>
          );
        })}
      </Box>

      {(hiddenCount > 0 || isExpanded) && (
        <Chip
          onClick={() => setIsExpanded((previous) => !previous)}
          size="small"
          variant="outlined"
          label={isExpanded ? "show less" : `show all · +${hiddenCount}`}
          sx={{ height: 18, fontSize: 11, mt: "2px", flexShrink: 0 }}
        />
      )}

      {setAsideCount > 0 && (
        <Chip
          onClick={() => setIsShowingSetAside((previous) => !previous)}
          size="small"
          color="warning"
          variant="filled"
          aria-pressed={isShowingSetAside}
          label={isShowingSetAside ? "hide" : `show ${setAsideCount}`}
          sx={{ height: 18, fontSize: 11, mt: "2px", flexShrink: 0 }}
        />
      )}
    </Card>
  );
};
