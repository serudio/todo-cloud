import { useState } from "react";
import { Box, Button, Card, Tooltip, Typography } from "@mui/material";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import type { Todo } from "../../types/todo";
import { getDoneThisWeek, getWeeklyTarget } from "../../utils/weekly";
import { NotTodayButton } from "../Shared/NotTodayButton";
import {
  CLOUD_ACCENT,
  CLOUD_INK,
  CLOUD_TILE_BG,
  TASK_ACTIONS_Z,
  TASK_ACTION_HOVER_Z,
  TASK_Z,
} from "../../constants/ui";

type Props = {
  todo: Todo;
  isSnoozed: boolean;
  onCount: () => void;
  onSnooze: () => void;
  onNotToday: () => void;
  isRow?: boolean;
};

/**
 * A week's quota, laid out in the cloud with the tasks.
 *
 * It belongs there and is placed as one of them — the same run of tilts, the
 * same order, the same click to deal with it — but it is drawn as a chip
 * rather than a tile, because it has something a tile has no room for: how
 * many of this week's times are left. A click counts one off rather than
 * finishing it, which is enough to clear it for the day.
 */
export const WeeklyCloudItem: React.FC<Props> = ({
  todo,
  isSnoozed,
  onCount,
  onSnooze,
  onNotToday,
  isRow = false,
}) => {
  const [hovered, setHovered] = useState(false);
  const done = getDoneThisWeek(todo);
  const target = getWeeklyTarget(todo);
  const name = todo.text || "untitled";

  const actions = (
    <>
      <NotTodayButton onClick={onNotToday} />
      <Button
        onClick={onSnooze}
        size="small"
        variant={isSnoozed ? "contained" : "text"}
        sx={{ p: 0, minHeight: 22, minWidth: 0, fontWeight: 700, textTransform: "lowercase" }}
      >
        snooze
      </Button>
    </>
  );

  // The phone's list has rows, not tiles, so it borrows that shape instead:
  // the same card, the same coloured edge, with the week's mark on it.
  if (isRow) {
    return (
      <Box
        onClick={onCount}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          minHeight: 52,
          px: 1.5,
          py: 1,
          borderRadius: 1,
          cursor: "pointer",
          userSelect: "none",
          backgroundColor: "background.paper",
          borderLeft: 4,
          borderColor: "warning.main",
          opacity: isSnoozed ? 0.55 : 1,
        }}
      >
        <EventRepeatIcon fontSize="small" color="warning" />
        <Typography sx={{ flex: 1, minWidth: 0, wordBreak: "break-word" }}>{name}</Typography>
        <Typography variant="caption" color="text.secondary">
          {done}/{target}
        </Typography>
        <Box onClick={(event) => event.stopPropagation()} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {actions}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{ position: "relative", display: "inline-flex", zIndex: hovered ? TASK_ACTION_HOVER_Z : TASK_Z }}
    >
      {/* Above the tile and not interactive: MUI's tooltips take the pointer by
          default, and this one would otherwise sit exactly on top of the
          actions below and swallow the clicks meant for them. */}
      <Tooltip
        title={`Weekly · ${done} of ${target} this week · click to count one`}
        placement="top"
        disableInteractive
      >
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.75,
            // The same frosted pill as the tasks around it, with a dashed
            // outline in the accent: it is counted, not finished.
            transform: hovered ? "translateY(-2px)" : "none",
            transition: "transform 150ms ease, border-color 150ms ease",
            maxWidth: 300,
            px: 1.75,
            py: 0.9,
            borderRadius: 999,
            border: 1,
            borderStyle: "dashed",
            borderColor: CLOUD_ACCENT,
            background: CLOUD_TILE_BG,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            color: CLOUD_INK,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontSize: 13,
            lineHeight: 1,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <EventRepeatIcon sx={{ fontSize: 15, color: CLOUD_ACCENT }} />
          <Box component="span">{name}</Box>
          <Box component="span" sx={{ fontSize: 11, opacity: 0.6, letterSpacing: "0.05em" }}>
            {done}/{target}
          </Box>
        </Box>
      </Tooltip>

      {/* The same card a task gets, in the same place under the tile. */}
      {hovered && (
        <Card
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            position: "absolute",
            top: "90%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: TASK_ACTIONS_Z,
            padding: "2px 6px",
            opacity: 0.9,
          }}
        >
          {actions}
        </Card>
      )}
    </Box>
  );
};
