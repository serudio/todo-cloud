import { useState } from "react";
import { Alert, Box, Button, Card, Chip, IconButton, LinearProgress, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import type { PointGoal, PointGoalMode } from "../../types/points";
import { usePointGoals } from "../../hooks/points";
import { getGoalPath, navigate, todosPath } from "../../hooks/route";
import { getGoalEntries, getGoalModeLabel, getProgress } from "../../utils/points";
import { LoadingComponent } from "../Layout/LoadingComponent";
import { ConfirmDialog } from "../Shared/ConfirmDialog";

type Props = {
  userId: string;
};

export const PointsPage: React.FC<Props> = ({ userId }) => {
  const { goals, isLoading, error, createGoal, removeGoal } = usePointGoals(userId);
  const [goalPendingDelete, setGoalPendingDelete] = useState<PointGoal | null>(null);

  const handleCreate = async (mode: PointGoalMode) => {
    const newGoalId = await createGoal(mode, "");
    if (newGoalId) navigate(getGoalPath(newGoalId));
  };

  const handleDeleteConfirm = () => {
    if (goalPendingDelete) removeGoal(goalPendingDelete.id);
    setGoalPendingDelete(null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Button onClick={() => navigate(todosPath)} color="secondary" sx={{ minWidth: 0 }} aria-label="Back to tasks">
          <ArrowBackIcon />
        </Button>
        <Typography variant="subtitle2" sx={{ textTransform: "uppercase", letterSpacing: 2, mr: "auto" }}>
          Rewards
        </Typography>
        <Button size="small" onClick={() => handleCreate("log")}>
          new points log
        </Button>
        <Button size="small" onClick={() => handleCreate("checklist")}>
          new checklist
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {isLoading && <LoadingComponent loading />}

      {!isLoading && !goals.length && (
        <Typography>Pick something to work towards, then collect points for it.</Typography>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {goals.map((goal) => {
          const progress = getProgress(getGoalEntries(goal), goal.targetPoints);

          return (
            <Card key={goal.id} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1 }}>
              <Box
                onClick={() => navigate(getGoalPath(goal.id))}
                sx={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                role="button"
              >
                <Typography noWrap>{goal.name || "Untitled reward"}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress.ratio * 100}
                  color={progress.isReached ? "success" : "warning"}
                  sx={{ my: 0.5, height: 6, borderRadius: 3 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {progress.total} of {goal.targetPoints} points
                </Typography>
              </Box>
              <Chip label={getGoalModeLabel(goal.mode)} size="small" variant="outlined" />
              <IconButton size="small" onClick={() => setGoalPendingDelete(goal)} aria-label="Delete this reward">
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Card>
          );
        })}
      </Box>

      <ConfirmDialog
        open={Boolean(goalPendingDelete)}
        title="Delete reward?"
        message={`"${goalPendingDelete?.name || "Untitled reward"}" and everything collected towards it will be gone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setGoalPendingDelete(null)}
      />
    </Box>
  );
};
