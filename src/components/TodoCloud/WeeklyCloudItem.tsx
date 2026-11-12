import { Box, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import type { WeeklyActivity } from "../../types/weekly";
import { getDoneThisWeek, isWeeklyDoneToday } from "../../utils/weekly";

type Props = {
  activity: WeeklyActivity;
  /** Positions it in the cloud's run of tilts, the same way a task is. */
  index: number;
  onCount: () => void;
  isRow?: boolean;
};

/**
 * A week's quota, sitting in the cloud with the tasks.
 *
 * It belongs there — it is work owed this week like anything else — but it is
 * not a task: a click counts one off instead of finishing it, and it stays put
 * until the week's count is full. So it keeps the shape of a task and gives up
 * its colour: outlined rather than filled, with how many are left on it.
 */
export const WeeklyCloudItem: React.FC<Props> = ({ activity, index, onCount, isRow = false }) => {
  const done = getDoneThisWeek(activity);
  const isDoneToday = isWeeklyDoneToday(activity);

  return (
    <Tooltip title={`Weekly · ${done} of ${activity.target} this week · click to count one`}>
      <Box
        role="button"
        tabIndex={0}
        onClick={onCount}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;

          event.preventDefault();
          onCount();
        }}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          // In the cloud it tilts with everything else; in the phone's list it
          // is a row, and a tilted row is just a crooked row.
          transform: isRow ? "none" : `rotate(calc((${index % 5} - 2) * 2deg))`,
          width: isRow ? "100%" : "auto",
          maxWidth: isRow ? "none" : 300,
          px: 1.5,
          py: isRow ? 1 : 0.75,
          borderRadius: isRow ? 1 : 999,
          border: 1,
          borderStyle: "dashed",
          borderColor: "warning.main",
          // Already counted today: still owed, but not owed right now.
          bgcolor: (theme) => alpha(theme.palette.warning.main, isDoneToday ? 0.18 : 0.06),
          color: "text.primary",
          letterSpacing: 1.5,
          fontSize: 14,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <EventRepeatIcon fontSize="small" color="warning" />
        <Box component="span" sx={{ flex: isRow ? 1 : "none", minWidth: 0 }}>
          {activity.name || "untitled"}
        </Box>
        <Box component="span" sx={{ fontSize: 12, opacity: 0.75 }}>
          {done}/{activity.target}
        </Box>
      </Box>
    </Tooltip>
  );
};
