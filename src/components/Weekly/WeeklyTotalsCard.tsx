import { Box, Card, LinearProgress, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import dayjs from "dayjs";
import type { Todo } from "../../types/todo";
import { getWeekDays, getWeekTotals } from "../../utils/weekly";

type Props = {
  todos: Todo[];
  daysLeft: number;
};

// Monday first, to match the week the counts run on.
const DAY_INITIALS = ["M", "T", "W", "T", "F", "S", "S"];

/**
 * Where the week stands, before the things it is made of.
 *
 * Two readings of the same week, one on top of the other: the card itself is
 * the seven days, tinted where something was counted, and the bar across it
 * is how much of what was asked for is done. The first says how the week has
 * been spread — five things on Sunday is not the same week as one a day — and
 * the second says how much is left.
 */
export const WeeklyTotalsCard: React.FC<Props> = ({ todos, daysLeft }) => {
  const totals = getWeekTotals(todos);
  const weekDays = getWeekDays(todos);
  const color = totals.isDone ? "success" : "warning";

  return (
    <Card
      sx={{ position: "relative", overflow: "hidden", p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}
    >
      <Box aria-hidden sx={{ position: "absolute", inset: 0, display: "flex", pointerEvents: "none" }}>
        {weekDays.map((day, index) => (
          <Box
            key={day.dayStart}
            sx={{
              flex: 1,
              borderRight: index === weekDays.length - 1 ? 0 : 1,
              borderColor: "divider",
              // A light wash, so a column of it does not shout.
              bgcolor: (theme) => (day.done > 0 ? alpha(theme.palette[color].main, 0.14) : "transparent"),
              // Today is where the week actually is, so it is marked whether or
              // not anything has happened on it yet.
              boxShadow: (theme) => (day.isToday ? `inset 0 -2px 0 ${theme.palette.warning.main}` : "none"),
            }}
          />
        ))}
      </Box>

      <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
        {weekDays.map((day, index) => (
          <Box key={day.dayStart} sx={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "center" }}>
            <Tooltip
              title={`${dayjs(day.dayStart).format("ddd D MMM")} — ${day.done || "nothing"}${day.done ? " counted" : ""}`}
            >
              <Typography
                variant="caption"
                color={day.isToday ? "warning.main" : day.done > 0 ? "text.primary" : "text.disabled"}
                sx={{ fontWeight: day.isToday ? 700 : undefined }}
              >
                {DAY_INITIALS[index]}
              </Typography>
            </Tooltip>
          </Box>
        ))}
      </Box>

      <LinearProgress
        variant="determinate"
        color={color}
        aria-label="This week"
        value={Math.min(100, (totals.done / Math.max(totals.target, 1)) * 100)}
        sx={{ position: "relative", height: 6, borderRadius: 999 }}
      />

      <Typography variant="caption" color="text.secondary" sx={{ position: "relative" }}>
        {totals.done} of {totals.target} this week
        {totals.isDone
          ? " — the whole week is done"
          : ` · ${totals.target - totals.done} to go, ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`}
      </Typography>
    </Card>
  );
};
