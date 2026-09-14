import { Box, Typography, useTheme } from "@mui/material";
import type { TaskTotal } from "../../../types/points";

type Props = {
  taskTotals: TaskTotal[];
};

// Which tasks are actually earning the points.
export const TaskBreakdownChart: React.FC<Props> = ({ taskTotals }) => {
  const theme = useTheme();

  if (!taskTotals.length) return null;

  const topTasks = taskTotals.slice(0, 8);
  const maxPoints = Math.max(...topTasks.map((task) => Math.abs(task.points)), 1);

  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        points by task
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mt: 0.5 }}>
        {topTasks.map((task) => (
          <Box key={task.task} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="caption" noWrap sx={{ width: 110, flexShrink: 0 }} title={task.task}>
              {task.task}
            </Typography>
            <Box sx={{ flex: 1, minWidth: 0, height: 14, display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: `${(Math.abs(task.points) / maxPoints) * 100}%`,
                  height: "100%",
                  borderRadius: "2px",
                  backgroundColor: task.points < 0 ? theme.palette.error.main : theme.palette.success.main,
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ width: 46, textAlign: "right", flexShrink: 0 }}>
              {task.points}{" "}
              <Box component="span" sx={{ color: "text.secondary" }}>
                ×{task.count}
              </Box>
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
