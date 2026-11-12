import { useState } from "react";
import { Box, Button, Card, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import type { WeeklyActivity } from "../../types/weekly";
import { getDoneThisWeek } from "../../utils/weekly";
import { NotTodayButton } from "../Shared/NotTodayButton";
import { TASK_ACTIONS_Z, TASK_ACTION_HOVER_Z, TASK_Z } from "../../constants/ui";

type Props = {
  activity: WeeklyActivity;
  /** Positions it in the cloud's run of tilts, the same way a task is. */
  index: number;
  isSnoozed: boolean;
  onCount: () => void;
  onSnooze: () => void;
  onNotToday: () => void;
  isRow?: boolean;
};

/**
 * A week's quota, sitting in the cloud with the tasks.
 *
 * It belongs there — it is work owed this week like anything else — but it is
 * not a task: a click counts one off instead of finishing it, and that is
 * enough to clear it for the day. So it keeps the shape of a task and gives up
 * its colour: outlined rather than filled, with how many are left on it.
 *
 * It takes the same two ways out of the way as a task, in the same place and
 * with the same controls: "not today" and an hour's snooze. The rest of a
 * task's actions have nothing to say to a quota — it has no due date, it
 * repeats by definition, and a tag would only tell you what the name already
 * does.
 */
export const WeeklyCloudItem: React.FC<Props> = ({
  activity,
  index,
  isSnoozed,
  onCount,
  onSnooze,
  onNotToday,
  isRow = false,
}) => {
  const [hovered, setHovered] = useState(false);
  const done = getDoneThisWeek(activity);
  // On a phone there is no hover to wait for, so the row carries them.
  const showActions = hovered || isRow;

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

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: "relative",
        display: "inline-flex",
        width: isRow ? "100%" : "auto",
        zIndex: hovered ? TASK_ACTION_HOVER_Z : TASK_Z,
      }}
    >
      {/* Above the pill and not interactive: MUI's tooltips take the pointer by
          default, and this one would otherwise sit exactly on top of the
          actions below and swallow the clicks meant for them. */}
      <Tooltip
        title={`Weekly · ${done} of ${activity.target} this week · click to count one`}
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
            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.06),
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

          {/* On the row the actions live inside it, past the count, so a tap on
              the name still counts one. */}
          {isRow && (
            <Box
              onClick={(event) => event.stopPropagation()}
              sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}
            >
              {actions}
            </Box>
          )}
        </Box>
      </Tooltip>

      {/* The same card a task gets, in the same place under the tile. */}
      {showActions && !isRow && (
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
