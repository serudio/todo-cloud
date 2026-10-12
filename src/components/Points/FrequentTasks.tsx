import { Avatar, Box, Chip, Tooltip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import InfoIcon from "@mui/icons-material/Info";
import type { PointEntry } from "../../types/points";
import { getFrequentTasks, getTasksUsedOn } from "../../utils/points";

type Props = {
  entries: PointEntry[];
  onPick: (task: string, points: number) => void;
};

// One tap logs the task again for today, at whatever it was worth last time.
export const FrequentTasks: React.FC<Props> = ({ entries, onPick }) => {
  const frequentTasks = getFrequentTasks(entries);
  const tasksUsedToday = getTasksUsedOn(entries);

  if (!frequentTasks.length) return null;

  return (
    <Box sx={{ position: "relative", pr: 2 }}>
      <Tooltip title="most used — adds today">
        <InfoIcon sx={{ fontSize: "1rem", position: "absolute", right: 0 }} />
      </Tooltip>
      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
        {frequentTasks.map((task) => {
          const isUsedToday = tasksUsedToday.has(task.task);

          return (
            <Tooltip key={task.task} title={isUsedToday ? "Already added today" : ""}>
              <Chip
                // A Chip drops `icon` when it already has an `avatar`, and the avatar
                // is carrying the points, so the tick goes in the label instead.
                label={
                  <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.25 }}>
                    {task.task}
                    {isUsedToday && <CheckIcon sx={{ fontSize: "0.9rem" }} />}
                  </Box>
                }
                size="small"
                color={isUsedToday ? "info" : "default"}
                variant={isUsedToday ? "filled" : "outlined"}
                onClick={() => onPick(task.task, task.lastPoints)}
                avatar={<Avatar>{task.lastPoints}</Avatar>}
              />
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};
