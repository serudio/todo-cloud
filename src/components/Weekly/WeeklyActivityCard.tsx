import { Box, Card, IconButton, InputBase, LinearProgress, TextField, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import type { WeeklyActivity } from "../../types/weekly";
import {
  clampTarget,
  formatWeekRange,
  getDoneThisWeek,
  getRecentWeeks,
  hasWeeklyHistory,
  MAX_WEEKLY_TARGET,
} from "../../utils/weekly";

type Props = {
  activity: WeeklyActivity;
  daysLeft: number;
  onChange: (input: { name?: string; target?: number }) => void;
  onCommit: (input: { name?: string; target?: number }) => void;
  onCountOne: () => void;
  onUndoOne: () => void;
  onDelete: () => void;
};

export const WeeklyActivityCard: React.FC<Props> = ({
  activity,
  daysLeft,
  onChange,
  onCommit,
  onCountOne,
  onUndoOne,
  onDelete,
}) => {
  const done = getDoneThisWeek(activity);
  const left = Math.max(0, activity.target - done);
  const isDone = left === 0;
  const weeks = getRecentWeeks(activity);

  return (
    <Card sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <InputBase
          value={activity.name}
          placeholder="what, and how often"
          onChange={(event) => onChange({ name: event.target.value })}
          onBlur={() => onCommit({ name: activity.name })}
          sx={{ flex: 1, minWidth: 0, fontSize: "1.05rem" }}
        />

        <Tooltip title="Times a week">
          <TextField
            type="number"
            size="small"
            label="a week"
            value={activity.target}
            onChange={(event) => onChange({ target: clampTarget(Number(event.target.value)) })}
            onBlur={() => onCommit({ target: activity.target })}
            slotProps={{ htmlInput: { min: 1, max: MAX_WEEKLY_TARGET, "aria-label": "Times a week" } }}
            sx={{ width: 92 }}
          />
        </Tooltip>

        <Tooltip title="Remove this">
          <IconButton size="small" onClick={onDelete} aria-label={`Remove ${activity.name || "this"}`}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <LinearProgress
            variant="determinate"
            // Past the target the bar is simply full: extra reading is not a
            // reason to show a broken-looking bar.
            value={Math.min(100, (done / activity.target) * 100)}
            color={isDone ? "success" : "warning"}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary">
            {done} of {activity.target}
            {isDone ? " — done for the week" : ` · ${left} to go, ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`}
          </Typography>
        </Box>

        <Tooltip title="Take the last one back">
          <span>
            <IconButton
              size="small"
              onClick={onUndoOne}
              disabled={done === 0}
              aria-label={`Take one back from ${activity.name || "this"}`}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Did it once">
          <IconButton
            onClick={onCountOne}
            color={isDone ? "success" : "warning"}
            aria-label={`Count one for ${activity.name || "this"}`}
            sx={{ border: 1, borderColor: "divider" }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Only once there is a past to show: a row of empty weeks on something
          started yesterday reads as failure rather than as no data. */}
      {hasWeeklyHistory(activity) && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
            before
          </Typography>
          {weeks.map((week) => (
            <Tooltip key={week.weekStart} title={formatWeekRange(week.weekStart)}>
              <Box
                sx={{
                  px: 0.75,
                  borderRadius: 1,
                  fontSize: 11,
                  lineHeight: "18px",
                  border: 1,
                  borderColor: "divider",
                  color: week.done >= week.target ? "success.main" : "text.secondary",
                }}
              >
                {week.done}/{week.target}
              </Box>
            </Tooltip>
          ))}
        </Box>
      )}
    </Card>
  );
};
