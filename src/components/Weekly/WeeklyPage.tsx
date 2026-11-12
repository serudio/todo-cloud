import { useState } from "react";
import { Alert, Box, Button, Card, IconButton, Tooltip, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import type { WeeklyActivity } from "../../types/weekly";
import { useWeeklyActivities } from "../../hooks/weekly";
import { navigate, todosPath } from "../../hooks/route";
import {
  formatWeekRange,
  getDaysLeftInWeek,
  getWeekStart,
  getWeekTotals,
  sortWeeklyByRemaining,
} from "../../utils/weekly";
import { LoadingComponent } from "../Layout/LoadingComponent";
import { ConfirmDialog } from "../Shared/ConfirmDialog";
import { WeeklyActivityCard } from "./WeeklyActivityCard";
import { WeeklyProgressCells } from "./WeeklyProgressCells";

type Props = {
  userId: string;
  onSettingsClick: () => void;
};

/**
 * What is owed to the week.
 *
 * Counts come back every Monday and nothing carries over: a week that went
 * badly is over, not a debt. The point is to pace the week, and a running
 * total of everything missed since March would only make it a worse place to
 * look.
 */
export const WeeklyPage: React.FC<Props> = ({ userId, onSettingsClick }) => {
  const { activities, isLoading, error, addActivity, changeActivity, commitActivity, countOne, undoOne, removeActivity } =
    useWeeklyActivities(userId);
  const [activityPendingDelete, setActivityPendingDelete] = useState<WeeklyActivity | null>(null);

  const daysLeft = getDaysLeftInWeek();
  const totals = getWeekTotals(activities);
  const shownActivities = sortWeeklyByRemaining(activities);

  const handleDeleteConfirm = () => {
    if (activityPendingDelete) removeActivity(activityPendingDelete.id);
    setActivityPendingDelete(null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Button onClick={() => navigate(todosPath)} color="secondary" sx={{ minWidth: 0 }} aria-label="Back to tasks">
          <ArrowBackIcon />
        </Button>
        <Typography variant="subtitle2" sx={{ textTransform: "uppercase", letterSpacing: 2 }}>
          Weekly
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mr: "auto" }}>
          {formatWeekRange(getWeekStart())} · {daysLeft} {daysLeft === 1 ? "day" : "days"} left
        </Typography>
        <Button size="small" onClick={addActivity} startIcon={<AddIcon />}>
          add
        </Button>
        {/* The theme lives in settings now, and this page is somewhere you can
            end up and stay — so it needs the same way in as the cloud has. */}
        <Tooltip title="Settings">
          <IconButton size="small" color="secondary" onClick={onSettingsClick} aria-label="Open settings">
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {isLoading && <LoadingComponent loading />}

      {!isLoading && !activities.length && (
        <Typography>
          Things you owe the week rather than a day — read five times, yoga twice. Counts start again every Monday.
        </Typography>
      )}

      {/* The week as one line, before the things it is made of: whether this
          week is on track is the question the page is opened to answer. */}
      {activities.length > 0 && (
        <Card sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
          <WeeklyProgressCells done={totals.done} target={totals.target} height={14} />
          <Typography variant="caption" color="text.secondary">
            {totals.done} of {totals.target} this week
            {totals.isDone
              ? " — the whole week is done"
              : ` · ${totals.target - totals.done} to go, ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`}
          </Typography>
        </Card>
      )}

      {/* A column each on a wide screen rather than one card per band: a line
          of five cells and a name does not need 1100px, and stacked full-width
          rows push the week off the bottom of the screen. */}
      <Box
        sx={{
          display: "grid",
          // minmax(0, …) rather than 1fr: a column floored at its content's
          // width would be pushed wider than a phone by the row of targets.
          gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" },
          alignItems: "start",
          gap: 1,
        }}
      >
        {shownActivities.map((activity) => (
          <WeeklyActivityCard
            key={activity.id}
            activity={activity}
            daysLeft={daysLeft}
            onChange={(input) => changeActivity(activity.id, input)}
            onCommit={(input) => commitActivity(activity.id, input)}
            onCountOne={() => countOne(activity.id)}
            onUndoOne={() => undoOne(activity.id)}
            onDelete={() => setActivityPendingDelete(activity)}
          />
        ))}
      </Box>

      <ConfirmDialog
        open={Boolean(activityPendingDelete)}
        title="Remove this?"
        message={`"${activityPendingDelete?.name || "Untitled"}" and everything counted against it will be gone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setActivityPendingDelete(null)}
      />
    </Box>
  );
};
