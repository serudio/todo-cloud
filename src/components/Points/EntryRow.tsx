import { Box, IconButton, InputBase } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import type { PointEntry } from "../../types/points";
import { PointsInput } from "./PointsInput";

type Props = {
  entry: PointEntry;
  onChange: (entry: PointEntry) => void;
  onCommit: (entry: PointEntry) => void;
  onRemove: () => void;
};

export const EntryRow: React.FC<Props> = ({ entry, onChange, onCommit, onRemove }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, py: 0.25, borderBottom: 1, borderColor: "divider" }}>
      {/* A date input only ever emits a whole date, so this commits as it changes. */}
      <InputBase
        type="date"
        value={entry.date}
        onChange={(event) => event.target.value && onCommit({ ...entry, date: event.target.value })}
        slotProps={{ input: { "aria-label": "Date" } }}
        sx={{
          width: 122,
          flexShrink: 0,
          fontSize: "0.75rem",
          color: "text.secondary",
          "& input": { padding: 0 },
        }}
      />

      <InputBase
        value={entry.task}
        placeholder="what was done"
        onChange={(event) => onChange({ ...entry, task: event.target.value })}
        onBlur={() => onCommit(entry)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;

          event.preventDefault();
          (event.target as HTMLInputElement).blur();
        }}
        sx={{ flex: 1, minWidth: 60, fontSize: "0.875rem", "& input": { padding: 0 } }}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          color: entry.points < 0 ? "error.main" : "success.main",
          fontWeight: 500,
        }}
      >
        <PointsInput points={entry.points} onCommit={(points) => onCommit({ ...entry, points })} />
      </Box>

      <IconButton size="small" onClick={onRemove} aria-label="Remove entry" sx={{ padding: 0, flexShrink: 0 }}>
        <ClearIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};
