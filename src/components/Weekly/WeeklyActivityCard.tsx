import { Box, Button, ButtonBase, Card, IconButton, InputBase, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import type { Todo } from "../../types/todo";
import { getDoneThisWeek, getWeeklyTarget, isWeeklyDoneToday, WEEKLY_TARGETS } from "../../utils/weekly";

type Props = {
  todo: Todo;
  // Just made with Add: the name field takes the cursor.
  isJustAdded?: boolean;
  onChange: (input: { text?: string; weeklyTarget?: number }) => void;
  onCommit: (input: { text?: string; weeklyTarget?: number }) => void;
  onCountOne: () => void;
  onUndoOne: () => void;
  onDelete: () => void;
  isNotToday: boolean;
  onToggleNotToday: () => void;
};

const textButtonSx = { minWidth: 0, p: 0, px: 0.75, fontWeight: 700, textTransform: "lowercase" } as const;

export const WeeklyActivityCard: React.FC<Props> = ({
  todo,
  isJustAdded = false,
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
  // Counted today, but the week still wants more: dealt with until tomorrow,
  // so it takes less room than what is still to do.
  const isCompact = isDoneToday && !isDone;
  const name = todo.text || "this";
  const doneColor = isDone ? "success" : "warning";

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
          px: 1.5,
          py: 0.25,
          opacity: 0.75,
          bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
        }}
      >
        <Typography
          sx={{
            flex: 1,
            minWidth: 0,
            letterSpacing: "1.3px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {todo.text || "untitled"}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
          not today
        </Typography>
        <Button size="small" onClick={onToggleNotToday} aria-label={`Bring ${name} back for today`} sx={textButtonSx}>
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
        display: "flex",
        alignItems: "center",
        columnGap: 1,
        rowGap: isCompact ? 0 : 0.5,
        px: 1.5,
        py: isCompact ? "2px" : 0.5,
        // Counted today, but the week still wants more: marked at the edge.
        borderLeft: 3,
        borderLeftColor: isCompact ? "warning.main" : "transparent",
        // A narrow column (a phone, or the right-hand one) gets two lines: the
        // name with the count buttons, then the targets with the rest, set by
        // order rather than by a second layout.
        "@container (max-width: 599px)": {
          flexWrap: "wrap",
          "& [data-part='count']": { order: 3 },
          "& [data-part='break']": { display: "block", order: 4 },
          "& [data-part='targets']": { order: 5 },
          "& [data-part='more']": { order: 6, ml: "auto" },
        },
      }}
    >
      <InputBase
        value={todo.text}
        placeholder="what, and how often"
        autoFocus={isJustAdded}
        inputProps={{ "aria-label": "Name" }}
        onChange={(event) => onChange({ text: event.target.value })}
        onBlur={() => onCommit({ text: todo.text })}
        sx={{
          flex: "1 1 0",
          minWidth: 0,
          fontSize: isCompact ? "0.875rem" : "1rem",
          letterSpacing: "1.3px",
          "& input": { py: isCompact ? 0 : 0.5 },
        }}
      />

      {/* How often, as the whole range rather than a box to type in: a target
          is set once and is always a single digit. The numbers and the
          progress under them share one fixed width, so each segment of the
          line sits under its own number. */}
      <Box data-part="targets" sx={{ width: 196, display: "flex", flexDirection: "column", gap: isCompact ? "2px" : "3px" }}>
        {/* Plain numbers, with only the chosen one drawn as a filled circle,
            so the target is the one thing the row says loudly. */}
        <Box role="radiogroup" aria-label="Times a week" sx={{ display: "flex" }}>
          {WEEKLY_TARGETS.map((chipTarget) => {
            const isTarget = chipTarget === target;
            const targetLabel = `${chipTarget} ${chipTarget === 1 ? "time" : "times"} a week`;
            const radius = isCompact ? 9 : 11;

            return (
              <Tooltip
                key={chipTarget}
                // The count lives here, on hover: the line under the numbers
                // already shows how far along it is.
                title={isTarget ? `${targetLabel} · ${isDone ? "done for the week" : `${left} to go`}` : targetLabel}
                placement="top"
                disableInteractive
              >
                <ButtonBase
                  role="radio"
                  aria-checked={isTarget}
                  aria-label={targetLabel}
                  onClick={() => onCommit({ weeklyTarget: chipTarget })}
                  sx={{
                    flex: 1,
                    height: isCompact ? 20 : 24,
                    fontSize: isCompact ? 12 : 13,
                    color: "text.disabled",
                    borderRadius: "50%",
                    "&:hover": { color: "text.primary" },
                    ...(isTarget && {
                      color: `${doneColor}.contrastText`,
                      fontWeight: 700,
                      "&:hover": { color: `${doneColor}.contrastText` },
                      background: (theme) =>
                        `radial-gradient(circle closest-side, ${theme.palette[doneColor].main} ${radius}px, transparent ${radius + 0.5}px)`,
                    }),
                  }}
                >
                  {chipTarget}
                </ButtonBase>
              </Tooltip>
            );
          })}
        </Box>

        {/* The progress, right under the numbers it counts against: a segment
            under each one up to the target, filled as they are done, and
            nothing under the numbers past it. */}
        <Box aria-hidden sx={{ height: 3, display: "flex", gap: "2px", px: "2px" }}>
          {WEEKLY_TARGETS.map((chipTarget) => (
            <Box
              key={chipTarget}
              sx={{
                flex: 1,
                borderRadius: 999,
                bgcolor:
                  chipTarget <= Math.min(done, target)
                    ? `${doneColor}.main`
                    : chipTarget <= target
                      ? "divider"
                      : "transparent",
              }}
            />
          ))}
        </Box>
      </Box>

      {/* The narrow layout's line break, between the count buttons and the targets. */}
      <Box data-part="break" sx={{ display: "none", flexBasis: "100%", height: 0 }} />

      <Box data-part="count" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Tooltip title="Take the last one back">
          <span>
            <IconButton
              size="small"
              onClick={onUndoOne}
              disabled={done === 0}
              aria-label={`Take one back from ${name}`}
              sx={{ p: isCompact ? "2px" : undefined }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Did it once">
          <IconButton
            size="small"
            onClick={onCountOne}
            color={doneColor}
            aria-label={`Count one for ${name}`}
            sx={{ border: 1, borderColor: "divider", p: isCompact ? "2px" : undefined }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box data-part="more" sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
        <Tooltip title="Not today: fold it away until tomorrow">
          <Button
            size="small"
            onClick={onToggleNotToday}
            aria-label={`Not today for ${name}`}
            sx={{ ...textButtonSx, minHeight: isCompact ? 24 : undefined }}
          >
            <s>today</s>
          </Button>
        </Tooltip>

        <Tooltip title="Remove this">
          <IconButton
            size="small"
            onClick={onDelete}
            aria-label={`Remove ${name}`}
            sx={{ p: isCompact ? "2px" : undefined }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};
