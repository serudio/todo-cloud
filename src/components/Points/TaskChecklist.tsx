import { type FormEvent, useState } from "react";
import { Box, Button, Checkbox, IconButton, InputBase, TextField, Typography } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import type { PointTask } from "../../types/points";
import { getLocalDateKey } from "../../utils/date";
import { formatDayLabel, getNewTask, getSortedTasks, QUICK_POINTS } from "../../utils/points";
import { PointsInput } from "./PointsInput";

type Props = {
  tasks: PointTask[];
  // Typing a task name only changes; everything else commits straight away.
  onChange: (tasks: PointTask[]) => void;
  onCommit: (tasks: PointTask[]) => void;
};

export const TaskChecklist: React.FC<Props> = ({ tasks, onChange, onCommit }) => {
  const [name, setName] = useState("");
  const [points, setPoints] = useState("5");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim().replace(/\s+/g, " ");
    const parsedPoints = Number(points);

    if (!trimmedName || !Number.isFinite(parsedPoints) || parsedPoints === 0) return;

    onCommit([...tasks, getNewTask(trimmedName, Math.round(parsedPoints))]);
    setName("");
  };

  const withTask = (newTask: PointTask) => tasks.map((task) => (task.id === newTask.id ? newTask : task));

  // Crossing a task off stamps the day, which is what the charts plot.
  const toggleTask = (task: PointTask) =>
    onCommit(withTask({ ...task, doneDate: task.doneDate ? null : getLocalDateKey() }));

  const removeTask = (taskId: string) => onCommit(tasks.filter((task) => task.id !== taskId));

  return (
    <Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="a task to do"
            value={name}
            onChange={(event) => setName(event.target.value)}
            sx={{ flex: 1, minWidth: 160 }}
          />
          <TextField
            type="number"
            size="small"
            value={points}
            onChange={(event) => setPoints(event.target.value)}
            sx={{ width: 90 }}
            slotProps={{ htmlInput: { "aria-label": "Points" } }}
          />
          <Button type="submit" variant="outlined" size="small" disabled={!name.trim()}>
            add
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {QUICK_POINTS.map((quickPoints) => (
            <Button
              key={quickPoints}
              size="small"
              variant={Number(points) === quickPoints ? "contained" : "outlined"}
              onClick={() => setPoints(String(quickPoints))}
              sx={{ minWidth: 38, px: 0 }}
            >
              {quickPoints}
            </Button>
          ))}
        </Box>
      </Box>

      {!tasks.length && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Add the tasks that need doing, each worth some points.
        </Typography>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
        {getSortedTasks(tasks).map((task) => {
          const isDone = Boolean(task.doneDate);

          return (
            <Box
              key={task.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                py: 0.25,
                borderBottom: 1,
                borderColor: "divider",
                opacity: isDone ? 0.5 : 1,
              }}
            >
              <Checkbox
                size="small"
                checked={isDone}
                onChange={() => toggleTask(task)}
                sx={{ padding: 0.5 }}
                slotProps={{ input: { "aria-label": `Mark ${task.name} done` } }}
              />
              <InputBase
                value={task.name}
                onChange={(event) => onChange(withTask({ ...task, name: event.target.value }))}
                onBlur={() => onCommit(withTask(task))}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;

                  event.preventDefault();
                  (event.target as HTMLInputElement).blur();
                }}
                sx={{
                  flex: 1,
                  minWidth: 60,
                  fontSize: "0.875rem",
                  "& input": { padding: 0, textDecoration: isDone ? "line-through" : "none" },
                }}
              />
              {task.doneDate && (
                <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                  {formatDayLabel(task.doneDate)}
                </Typography>
              )}
              <Box sx={{ display: "flex", color: isDone ? "success.main" : "text.secondary", fontWeight: 500 }}>
                <PointsInput points={task.points} onCommit={(points) => onCommit(withTask({ ...task, points }))} />
              </Box>
              <IconButton size="small" onClick={() => removeTask(task.id)} aria-label="Remove task" sx={{ padding: 0 }}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
