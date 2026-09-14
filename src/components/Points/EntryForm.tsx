import { type FormEvent, useState } from "react";
import { Autocomplete, Box, Button, TextField } from "@mui/material";
import { getLocalDateKey } from "../../utils/date";
import { QUICK_POINTS } from "../../utils/points";

type Props = {
  taskNames: string[];
  onAdd: (task: string, points: number, date: string) => void;
};

export const EntryForm: React.FC<Props> = ({ taskNames, onAdd }) => {
  const [date, setDate] = useState(getLocalDateKey);
  const [task, setTask] = useState("");
  const [points, setPoints] = useState("1");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const trimmedTask = task.trim().replace(/\s+/g, " ");
    const parsedPoints = Number(points);

    if (!trimmedTask || !Number.isFinite(parsedPoints) || parsedPoints === 0) return;

    onAdd(trimmedTask, Math.round(parsedPoints), date || getLocalDateKey());
    setTask("");
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          type="date"
          size="small"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          sx={{ width: 150 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <Autocomplete
          freeSolo
          options={taskNames}
          inputValue={task}
          onInputChange={(_event, newValue) => setTask(newValue)}
          sx={{ flex: 1, minWidth: 160 }}
          renderInput={(params) => <TextField {...params} size="small" placeholder="what was done" />}
        />

        <TextField
          type="number"
          size="small"
          value={points}
          onChange={(event) => setPoints(event.target.value)}
          sx={{ width: 90 }}
          slotProps={{ htmlInput: { "aria-label": "Points" } }}
        />

        <Button type="submit" variant="outlined" size="small" disabled={!task.trim()}>
          add
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
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
  );
};
