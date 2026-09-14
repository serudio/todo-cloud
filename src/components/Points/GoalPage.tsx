import { Alert, Box, Button, Card, InputBase, TextField, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { PointEntry, PointTask } from "../../types/points";
import { usePointGoal, usePointGoals } from "../../hooks/points";
import { navigate, pointsPath } from "../../hooks/route";
import { getLocalDateKey } from "../../utils/date";
import {
  getDayTotals,
  getGoalEntries,
  getNewEntry,
  getProgress,
  getTaskTotals,
  getTasksTotalPoints,
} from "../../utils/points";
import { LoadingComponent } from "../Layout/LoadingComponent";
import { EntryForm } from "./EntryForm";
import { EntryList } from "./EntryList";
import { FrequentTasks } from "./FrequentTasks";
import { TaskChecklist } from "./TaskChecklist";
import { CumulativeChart } from "./charts/CumulativeChart";
import { DailyBarsChart } from "./charts/DailyBarsChart";
import { ProgressRing } from "./charts/ProgressRing";
import { TaskBreakdownChart } from "./charts/TaskBreakdownChart";

type Props = {
  userId: string;
  goalId: string;
};

export const GoalPage: React.FC<Props> = ({ userId, goalId }) => {
  const { goal, isLoading, isSaving, error, changeGoal, commitGoal } = usePointGoal(goalId);
  const { allTaskNames } = usePointGoals(userId);

  if (isLoading) return <LoadingComponent loading />;
  if (error && !goal) return <Alert severity="error">{error}</Alert>;
  if (!goal) return null;

  const isChecklist = goal.mode === "checklist";
  const earnedEntries = getGoalEntries(goal);
  const progress = getProgress(earnedEntries, goal.targetPoints);
  const dayTotals = getDayTotals(earnedEntries);
  const taskTotals = getTaskTotals(earnedEntries);
  const checklistTotal = getTasksTotalPoints(goal.tasks);

  const commitEntries = (entries: PointEntry[]) => commitGoal(goal.name, goal.targetPoints, entries, goal.tasks);
  const commitTasks = (tasks: PointTask[]) => commitGoal(goal.name, goal.targetPoints, goal.entries, tasks);

  const addEntry = (task: string, points: number, date: string) =>
    commitEntries([...goal.entries, getNewEntry(task, points, date)]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Button
          onClick={() => navigate(pointsPath)}
          color="secondary"
          sx={{ minWidth: 0 }}
          aria-label="Back to rewards"
        >
          <ArrowBackIcon />
        </Button>
        <InputBase
          value={goal.name}
          placeholder="what are we working towards?"
          onChange={(event) => changeGoal(event.target.value, goal.targetPoints, goal.entries, goal.tasks)}
          onBlur={() => commitGoal(goal.name, goal.targetPoints, goal.entries, goal.tasks)}
          sx={{ flex: 1, minWidth: 160, fontSize: "1.2rem", fontWeight: 500 }}
        />
        <TextField
          type="number"
          size="small"
          label="target"
          value={goal.targetPoints}
          onChange={(event) => changeGoal(goal.name, Number(event.target.value) || 1, goal.entries, goal.tasks)}
          onBlur={() => commitGoal(goal.name, goal.targetPoints, goal.entries, goal.tasks)}
          sx={{ width: 110 }}
        />
        {isChecklist && checklistTotal > 0 && checklistTotal !== goal.targetPoints && (
          <Button size="small" onClick={() => commitGoal(goal.name, checklistTotal, goal.entries, goal.tasks)}>
            use all {checklistTotal}
          </Button>
        )}
        {isSaving && (
          <Typography variant="caption" color="text.secondary">
            saving…
          </Typography>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexWrap: "wrap" }}>
        <Card sx={{ flex: "1 1 380px", minWidth: 300, p: 1.5 }}>
          {isChecklist ? (
            <TaskChecklist tasks={goal.tasks} onChange={commitTasks} />
          ) : (
            <>
              <FrequentTasks
                entries={goal.entries}
                onPick={(task, points) => addEntry(task, points, getLocalDateKey())}
              />
              <EntryForm taskNames={allTaskNames} onAdd={addEntry} />
              <EntryList
                entries={goal.entries}
                onRemove={(id) => commitEntries(goal.entries.filter((entry) => entry.id !== id))}
              />
            </>
          )}
        </Card>

        <Card sx={{ flex: "1 1 380px", minWidth: 300, p: 1.5, display: "flex", flexDirection: "column", gap: 2 }}>
          <ProgressRing total={progress.total} target={goal.targetPoints} ratio={progress.ratio} />
          <CumulativeChart days={dayTotals} target={goal.targetPoints} />
          <DailyBarsChart days={dayTotals} />
          <TaskBreakdownChart taskTotals={taskTotals} />
          {!dayTotals.length && (
            <Typography variant="body2" color="text.secondary">
              Charts appear once points start coming in.
            </Typography>
          )}
        </Card>
      </Box>
    </Box>
  );
};
