import { Box, Tooltip, Typography, useTheme } from "@mui/material";
import type { DayTotal } from "../../../types/points";
import { formatDayLabel } from "../../../utils/points";

type Props = {
  days: DayTotal[];
};

// How much was earned on each day: the "how are we doing lately" view.
export const DailyBarsChart: React.FC<Props> = ({ days }) => {
  const theme = useTheme();

  if (!days.length) return null;

  const maxPoints = Math.max(...days.map((day) => day.points), 1);
  const recentDays = days.slice(-14);

  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        points per day
      </Typography>
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5, height: 120, mt: 0.5 }}>
        {recentDays.map((day) => (
          <Tooltip key={day.date} title={`${formatDayLabel(day.date)}: ${day.points}`} enterTouchDelay={0}>
            <Box
              sx={{
                flex: 1,
                minWidth: 6,
                height: `${Math.max((day.points / maxPoints) * 100, 3)}%`,
                borderRadius: "2px 2px 0 0",
                backgroundColor: day.points < 0 ? theme.palette.error.main : theme.palette.warning.main,
              }}
            />
          </Tooltip>
        ))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {formatDayLabel(recentDays[0].date)}
        </Typography>
        {recentDays.length > 1 && (
          <Typography variant="caption" color="text.secondary">
            {formatDayLabel(recentDays[recentDays.length - 1].date)}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
