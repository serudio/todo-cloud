import { Box, Button, Card, Chip, IconButton, InputBase, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SnoozeIcon from "@mui/icons-material/Snooze";
import type { Todo } from "../../types/todo";
import {
  getDoneThisWeek,
  getWeeklyTarget,
  isWeeklyDoneToday,
  WEEKLY_TARGETS,
} from "../../utils/weekly";

type Props = {
  todo: Todo;
  onChange: (input: { text?: string; weeklyTarget?: number }) => void;
  onCommit: (input: { text?: string; weeklyTarget?: number }) => void;
  onCountOne: () => void;
  onUndoOne: () => void;
  onDelete: () => void;
  isSnoozed: boolean;
  onToggleSnooze: () => void;
};

export const WeeklyActivityCard: React.FC<Props> = ({
  todo,
  onChange,
  onCommit,
  onCountOne,
  onUndoOne,
  onDelete,
  isSnoozed,
  onToggleSnooze,
}) => {
  const done = getDoneThisWeek(todo);
  const target = getWeeklyTarget(todo);
  const left = Math.max(0, target - done);
  const isDone = left === 0;
  const isDoneToday = isWeeklyDoneToday(todo);
  const name = todo.text || "this";

  // Folded to one line while snoozed: it is still owed, so it stays on the
  // page, but it has asked not to be looked at for now, and the targets and
  // history are the part that takes the room.
  if (isSnoozed) {
    return (
      <Card
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1,
          py: 0.25,
          opacity: 0.7,
          bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
        }}
      >
        <SnoozeIcon fontSize="small" color="disabled" />
        <Typography
          sx={{ flex: 1, minWidth: 0, letterSpacing: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {todo.text || "untitled"}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
          {done}/{target} · until {dayjs(todo.snoozedUntil).format("HH:mm")}
        </Typography>
        <Button
          size="small"
          onClick={onToggleSnooze}
          aria-label={`Wake ${name}`}
          sx={{ minWidth: 0, p: 0, px: 0.5, fontWeight: 700, textTransform: "lowercase" }}
        >
          wake
        </Button>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        position: "relative",
        overflow: "hidden",
        px: 1.25,
        py: 0.75,
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
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
        {Array.from({ length: target }, (_unused, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              borderRight: index === target - 1 ? 0 : 1,
              borderColor: "divider",
              bgcolor: (theme) =>
                index < Math.min(done, target)
                  ? alpha(theme.palette[isDone ? "success" : "warning"].main, 0.16)
                  : "transparent",
            }}
          />
        ))}
      </Box>

      <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: 1 }}>
        <InputBase
          value={todo.text}
          placeholder="what, and how often"
          onChange={(event) => onChange({ text: event.target.value })}
          onBlur={() => onCommit({ text: todo.text })}
          // The name is what the card is; everything else on it is a number or
          // a control, so it can carry the size and the spacing on its own.
          sx={{ flex: 1, minWidth: 0, fontSize: "1.1rem", letterSpacing: 1.2 }}
        />

        <Tooltip title="Snooze for an hour">
          <IconButton size="small" onClick={onToggleSnooze} aria-label={`Snooze ${name}`}>
            <SnoozeIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Remove this">
          <IconButton size="small" onClick={onDelete} aria-label={`Remove ${todo.text || "this"}`}>
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
        {/* Not on a phone: there it would push the buttons onto a line of
            their own, and seven numbers in a row say "how often" well enough. */}
        <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5, display: { xs: "none", sm: "block" } }}>
          times a week
        </Typography>
        {WEEKLY_TARGETS.map((chipTarget) => {
          const isTarget = chipTarget === target;
          // The numbers already counted off, marked where they are read: the
          // fourth of five is the fourth chip, not a bar somewhere else.
          // Dimmer than the target, which still has to be the loudest thing in
          // the row — it is the one a click changes.
          const isCounted = !isTarget && chipTarget <= Math.min(done, target);

          return (
            <Chip
              key={chipTarget}
              label={chipTarget}
              size="small"
              onClick={() => onCommit({ weeklyTarget: chipTarget })}
              variant={isTarget || isCounted ? "filled" : "outlined"}
              color={isTarget ? (isDone ? "success" : "warning") : "default"}
              aria-pressed={isTarget}
              aria-label={`${chipTarget} times a week`}
              // Narrow enough that all seven and the label hold one line on a phone.
              sx={{
                minWidth: 26,
                height: 22,
                "& .MuiChip-label": { px: 0.6 },
                ...(isCounted && {
                  bgcolor: (theme) => alpha(theme.palette[isDone ? "success" : "warning"].main, 0.35),
                  color: "text.primary",
                  opacity: 0.8,
                }),
              }}
            />
          );
        })}

        {/* Pushes the count and the buttons to the far end of the same row, and
            lets them drop to a line of their own when there is no room. */}
        <Box sx={{ flex: 1, minWidth: 8 }} />

        {/* Short enough that the row still holds the buttons: the sentence it
            is short for is a hover away, and the cells behind the card have
            already said it without words. */}
        <Tooltip title={isDone ? "Done for the week" : `${left} still to go this week`}>
          <Typography variant="caption" color="text.secondary" sx={{ mx: 0.5 }}>
            {done}/{target}
          </Typography>
        </Tooltip>

        <Tooltip title="Take the last one back">
          <span>
            <IconButton
              size="small"
              onClick={onUndoOne}
              disabled={done === 0}
              aria-label={`Take one back from ${todo.text || "this"}`}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Did it once">
          <IconButton
            size="small"
            onClick={onCountOne}
            color={isDone ? "success" : "warning"}
            aria-label={`Count one for ${todo.text || "this"}`}
            sx={{ border: 1, borderColor: "divider" }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

    </Card>
  );
};
