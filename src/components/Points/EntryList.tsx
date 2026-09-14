import { Box, Typography } from "@mui/material";
import type { PointEntry } from "../../types/points";
import { getSortedEntries } from "../../utils/points";
import { EntryRow } from "./EntryRow";

type Props = {
  entries: PointEntry[];
  onChange: (entries: PointEntry[]) => void;
  onCommit: (entries: PointEntry[]) => void;
};

export const EntryList: React.FC<Props> = ({ entries, onChange, onCommit }) => {
  if (!entries.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Nothing logged yet. Add the first finished task above.
      </Typography>
    );
  }

  // Both take the new entry rather than reading it back from state, so an edit that
  // changes and commits in one go is not overwritten by this render's stale copy.
  const withEntry = (newEntry: PointEntry) => entries.map((entry) => (entry.id === newEntry.id ? newEntry : entry));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
      {getSortedEntries(entries).map((entry) => (
        <EntryRow
          key={entry.id}
          entry={entry}
          onChange={(newEntry) => onChange(withEntry(newEntry))}
          onCommit={(newEntry) => onCommit(withEntry(newEntry))}
          onRemove={() => onCommit(entries.filter((currentEntry) => currentEntry.id !== entry.id))}
        />
      ))}
    </Box>
  );
};
