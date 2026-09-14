import { Box, IconButton, Typography } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import type { PointEntry } from "../../types/points";
import { formatDayLabel, getSortedEntries } from "../../utils/points";

type Props = {
  entries: PointEntry[];
  onRemove: (id: string) => void;
};

export const EntryList: React.FC<Props> = ({ entries, onRemove }) => {
  if (!entries.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Nothing logged yet. Add the first finished task above.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
      {getSortedEntries(entries).map((entry) => (
        <Box
          key={entry.id}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            py: 0.5,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ width: 54, flexShrink: 0 }}>
            {formatDayLabel(entry.date)}
          </Typography>
          <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
            {entry.task}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, width: 40, textAlign: "right", flexShrink: 0 }}
            color={entry.points < 0 ? "error.main" : "success.main"}
          >
            {entry.points > 0 ? `+${entry.points}` : entry.points}
          </Typography>
          <IconButton size="small" onClick={() => onRemove(entry.id)} aria-label="Remove entry" sx={{ padding: 0 }}>
            <ClearIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
};
