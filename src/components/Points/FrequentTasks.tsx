import { Box, Chip, Typography } from "@mui/material";
import type { PointEntry } from "../../types/points";
import { getFrequentTasks } from "../../utils/points";

type Props = {
  entries: PointEntry[];
  onPick: (task: string, points: number) => void;
};

// One tap logs the task again for today, at whatever it was worth last time.
export const FrequentTasks: React.FC<Props> = ({ entries, onPick }) => {
  const frequentTasks = getFrequentTasks(entries);

  if (!frequentTasks.length) return null;

  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" color="text.secondary">
        most used — adds today
      </Typography>
      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
        {frequentTasks.map((task) => (
          <Chip
            key={task.task}
            label={`${task.task} +${task.lastPoints}`}
            size="small"
            variant="outlined"
            onClick={() => onPick(task.task, task.lastPoints)}
          />
        ))}
      </Box>
    </Box>
  );
};
