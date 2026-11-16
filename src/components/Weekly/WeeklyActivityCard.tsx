import { Box, Button, Card, Chip, IconButton, InputBase, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
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
  isNotToday: boolean;
  onToggleNotToday: () => void;
};

export const WeeklyActivityCard: React.FC<Props> = ({
  todo,
  onChange,
  onCommit,
  onCountOne,
  onUndoOne,
  onDelete,
  isNotToday,
  onToggleNotToday,
}) => {
  const done = getDoneThisWeek(todo);
  const target = getWeeklyTarget(todo);
  const left = Math.max(0, target - done);
  const isDone = left === 0;
  const isDoneToday = isWeeklyDoneToday(todo);
  const name = todo.text || "this";

  // Folded to one line for the rest of the day: it is still owed this week, so
  // it stays on the page, but not today, and the targets are the part that
  // takes the room. It unfolds at midnight on its own.
  if (isNotToday) {
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
        <Typography
          sx={{ flex: 1, minWidth: 0, letterSpacing: "1.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {todo.text || "untitled"}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
          {done}/{target} · not today
        </Typography>
        <Button
          size="small"
          onClick={onToggleNotToday}
          aria-label={`Bring ${name} back for today`}
          sx={{ minWidth: 0, p: 0, px: 0.5, fontWeight: 700, textTransform: "lowercase" }}
        >
          today
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
        pt: 0.5,
        pb: 0.75,
        display: "flex",
        alignItems: "center",
        flexWrap: { xs: "wrap", sm: "nowrap" },
        columnGap: 1,
        // Counted today, but the week still wants more: marked at the edge, so
        // it reads at a glance without another colour across the whole card.
        borderLeft: 3,
        borderLeftColor: isDoneToday && !isDone ? "warning.main" : "transparent",
      }}
    >
      <InputBase
        value={todo.text}
        placeholder="what, and how often"
        onChange={(event) => onChange({ text: event.target.value })}
        onBlur={() => onCommit({ text: todo.text })}
        // On a wider screen the name and all its controls share one line,
        // which is what makes a row of these easy to scan. A phone gets two:
        // the name with the count and its buttons, then the targets with the
        // rest — set by `order` below rather than by a second layout.
        sx={{ flex: "1 1 0", minWidth: 0, fontSize: "1rem", letterSpacing: "1.3px" }}
      />

      {/* How often, as the whole range rather than a box to type in: a target
          is set once and is always a single digit. Only the chosen one is
          drawn as a chip; the rest are plain numbers until they are pointed at,
          so the row says one thing rather than seven. */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, order: { xs: 5, sm: 0 } }}>
        {WEEKLY_TARGETS.map((chipTarget) => {
          const isTarget = chipTarget === target;
          // On hover rather than as a label: seven numbers in a row say "how
          // often" well enough.
          const targetLabel = `${chipTarget} ${chipTarget === 1 ? "time" : "times"} a week`;

          return (
            <Tooltip key={chipTarget} title={targetLabel} placement="top" disableInteractive>
              <Chip
                label={chipTarget}
                size="small"
                onClick={() => onCommit({ weeklyTarget: chipTarget })}
                variant={isTarget ? "filled" : "outlined"}
                color={isTarget ? (isDone ? "success" : "warning") : "default"}
                aria-pressed={isTarget}
                aria-label={targetLabel}
                sx={{
                  minWidth: 24,
                  height: 22,
                  "& .MuiChip-label": { px: 0.6 },
                  ...(!isTarget && {
                    borderColor: "transparent",
                    color: "text.disabled",
                    "&:hover": { borderColor: "divider", color: "text.primary" },
                  }),
                }}
              />
            </Tooltip>
          );
        })}
      </Box>

      {/* The phone's line break, between the count and the targets. */}
      <Box sx={{ flexBasis: "100%", height: 0, display: { xs: "block", sm: "none" }, order: 4 }} />

      <Tooltip title={isDone ? "Done for the week" : `${left} still to go this week`}>
        <Typography variant="caption" color="text.secondary" sx={{ mx: 0.5, whiteSpace: "nowrap", order: { xs: 2, sm: 0 } }}>
          {done}/{target}
        </Typography>
      </Tooltip>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, order: { xs: 3, sm: 0 } }}>
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

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, order: { xs: 6, sm: 0 }, ml: { xs: "auto", sm: 0 } }}>
        <Tooltip title="Not today: fold it away until tomorrow">
          <Button
            size="small"
            onClick={onToggleNotToday}
            aria-label={`Not today for ${name}`}
            sx={{ minWidth: 0, p: 0, px: 0.75, fontWeight: 700, textTransform: "lowercase" }}
          >
            <s>today</s>
          </Button>
        </Tooltip>

        <Tooltip title="Remove this">
          <IconButton size="small" onClick={onDelete} aria-label={`Remove ${todo.text || "this"}`}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* The progress, as a line along the bottom: one segment per time it
          should happen, filled as they are done. Thin, so it is read rather
          than looked at. */}
      <Box
        aria-hidden
        sx={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, display: "flex", gap: "2px" }}
      >
        {Array.from({ length: target }, (_unused, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              bgcolor: (theme) =>
                index < Math.min(done, target)
                  ? theme.palette[isDone ? "success" : "warning"].main
                  : alpha(theme.palette.text.primary, 0.08),
            }}
          />
        ))}
      </Box>
    </Card>
  );
};
