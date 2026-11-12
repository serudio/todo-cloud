import { Box, Card, Chip, IconButton, InputBase, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import type { WeeklyActivity } from "../../types/weekly";
import {
  formatWeekRange,
  getDoneThisWeek,
  getRecentWeeks,
  hasWeeklyHistory,
  isWeeklyDoneToday,
  WEEKLY_TARGETS,
} from "../../utils/weekly";

type Props = {
  activity: WeeklyActivity;
  onChange: (input: { name?: string; target?: number }) => void;
  onCommit: (input: { name?: string; target?: number }) => void;
  onCountOne: () => void;
  onUndoOne: () => void;
  onDelete: () => void;
};

export const WeeklyActivityCard: React.FC<Props> = ({
  activity,
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
  const isDoneToday = isWeeklyDoneToday(activity);

  return (
    <Card
      sx={{
        position: "relative",
        overflow: "hidden",
        p: 1.5,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        // Something counted today is marked, not just moved: the order says
        // where it stands in the week, the outline says it has been touched
        // since this morning.
        border: 1,
        borderColor: isDoneToday && !isDone ? "warning.main" : "transparent",
      }}
    >
      {/* The card itself is the progress: one column per time it should happen,
          filled as they are done. Behind everything and at a low alpha, so it
          reads as how far along this is without competing with the text on top
          of it. */}
      <Box
        aria-hidden
        sx={{ position: "absolute", inset: 0, display: "flex", pointerEvents: "none" }}
      >
        {Array.from({ length: activity.target }, (_unused, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              borderRight: index === activity.target - 1 ? 0 : 1,
              borderColor: "divider",
              bgcolor: (theme) =>
                index < Math.min(done, activity.target)
                  ? alpha(theme.palette[isDone ? "success" : "warning"].main, 0.16)
                  : "transparent",
            }}
          />
        ))}
      </Box>

      <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: 1 }}>
        <InputBase
          value={activity.name}
          placeholder="what, and how often"
          onChange={(event) => onChange({ name: event.target.value })}
          onBlur={() => onCommit({ name: activity.name })}
          // The name is what the card is; everything else on it is a number or
          // a control, so it can carry the size and the spacing on its own.
          sx={{ flex: 1, minWidth: 0, fontSize: "1.25rem", letterSpacing: 1.2 }}
        />

        <Tooltip title="Remove this">
          <IconButton size="small" onClick={onDelete} aria-label={`Remove ${activity.name || "this"}`}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* One row: how often, how far along, and the two buttons that change it.
          The whole range rather than a box to type in — a target is set once, it
          is always a single digit, and seven is every day. */}
      <Box
        sx={{ position: "relative", display: "flex", alignItems: "center", gap: 0.25, flexWrap: "wrap", rowGap: 0.5 }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
          times a week
        </Typography>
        {WEEKLY_TARGETS.map((target) => (
          <Chip
            key={target}
            label={target}
            size="small"
            onClick={() => onCommit({ target })}
            variant={target === activity.target ? "filled" : "outlined"}
            color={target === activity.target ? "warning" : "default"}
            aria-pressed={target === activity.target}
            // Narrow enough that all seven and the label hold one line on a phone.
            sx={{ minWidth: 30, "& .MuiChip-label": { px: 0.75 } }}
          />
        ))}

        {/* Pushes the count and the buttons to the far end of the same row, and
            lets them drop to a line of their own when there is no room. */}
        <Box sx={{ flex: 1, minWidth: 8 }} />

        {/* Short enough that the row still holds the buttons: the sentence it
            is short for is a hover away, and the cells behind the card have
            already said it without words. */}
        <Tooltip title={isDone ? "Done for the week" : `${left} still to go this week`}>
          <Typography variant="caption" color="text.secondary" sx={{ mx: 0.5 }}>
            {done}/{activity.target}
          </Typography>
        </Tooltip>

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
        <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
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
