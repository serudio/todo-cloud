import { useState } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import type { WeeklyActivity } from "../../types/weekly";
import { useWeeklyActivities } from "../../hooks/weekly";
import { navigate, todosPath } from "../../hooks/route";
import { formatWeekRange, getDaysLeftInWeek, getWeekStart } from "../../utils/weekly";
import { LoadingComponent } from "../Layout/LoadingComponent";
import { ConfirmDialog } from "../Shared/ConfirmDialog";
import { WeeklyActivityCard } from "./WeeklyActivityCard";

type Props = {
  userId: string;
};

/**
 * What is owed to the week.
 *
 * Counts come back every Monday and nothing carries over: a week that went
 * badly is over, not a debt. The point is to pace the week, and a running
 * total of everything missed since March would only make it a worse place to
 * look.
 */
export const WeeklyPage: React.FC<Props> = ({ userId }) => {
  const { activities, isLoading, error, addActivity, changeActivity, commitActivity, countOne, undoOne, removeActivity } =
    useWeeklyActivities(userId);
  const [activityPendingDelete, setActivityPendingDelete] = useState<WeeklyActivity | null>(null);

  const daysLeft = getDaysLeftInWeek();

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
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {isLoading && <LoadingComponent loading />}

      {!isLoading && !activities.length && (
        <Typography>
          Things you owe the week rather than a day — read five times, yoga twice. Counts start again every Monday.
        </Typography>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {activities.map((activity) => (
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
