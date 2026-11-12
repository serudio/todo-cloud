import { Box, Card, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import dayjs from "dayjs";
import type { WeeklyActivity } from "../../types/weekly";
import { getWeekDays, getWeekTotals } from "../../utils/weekly";
import { WeeklyProgressCells } from "./WeeklyProgressCells";

type Props = {
  activities: WeeklyActivity[];
  daysLeft: number;
};

// Monday first, to match the week the counts run on.
const DAY_INITIALS = ["M", "T", "W", "T", "F", "S", "S"];

/**
 * Where the week stands, before the things it is made of.
 *
 * Two readings of the same week, one on top of the other: the card itself is
 * the seven days, tinted where something was counted, and the cells across it
 * are how much of what was asked for is done. The first says how the week has
 * been spread — five things on Sunday is not the same week as one a day — and
 * the second says how much is left.
 */
export const WeeklyTotalsCard: React.FC<Props> = ({ activities, daysLeft }) => {
  const totals = getWeekTotals(activities);
  const weekDays = getWeekDays(activities);

  return (
    <Card
      sx={{ position: "relative", overflow: "hidden", p: 1.5, display: "flex", flexDirection: "column", gap: 0.5 }}
    >
      <Box aria-hidden sx={{ position: "absolute", inset: 0, display: "flex", pointerEvents: "none" }}>
        {weekDays.map((day, index) => (
          <Box
            key={day.dayStart}
            sx={{
              flex: 1,
              borderRight: index === weekDays.length - 1 ? 0 : 1,
              borderColor: "divider",
              bgcolor: (theme) =>
                day.done > 0
                  ? alpha(theme.palette[totals.isDone ? "success" : "warning"].main, 0.16)
                  : "transparent",
              // Today is where the week actually is, so it is marked whether or
              // not anything has happened on it yet.
              boxShadow: (theme) => (day.isToday ? `inset 0 -2px 0 ${theme.palette.warning.main}` : "none"),
            }}
          />
        ))}
      </Box>

      <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
        {weekDays.map((day, index) => (
          <Tooltip
            key={day.dayStart}
            title={`${dayjs(day.dayStart).format("ddd D MMM")} — ${day.done || "nothing"}${day.done ? " counted" : ""}`}
          >
            <Typography
              variant="caption"
              color={day.isToday ? "warning.main" : "text.secondary"}
              sx={{ flex: 1, minWidth: 0, textAlign: "center", opacity: day.done > 0 ? 1 : 0.5 }}
            >
              {DAY_INITIALS[index]}
            </Typography>
          </Tooltip>
        ))}
      </Box>

      <Box sx={{ position: "relative" }}>
        <WeeklyProgressCells done={totals.done} target={totals.target} height={14} />
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ position: "relative" }}>
        {totals.done} of {totals.target} this week
        {totals.isDone
          ? " — the whole week is done"
          : ` · ${totals.target - totals.done} to go, ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`}
      </Typography>
    </Card>
  );
};
