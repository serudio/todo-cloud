import { SectionCard } from "./Shared/SectionCard";
import { TextField } from "@mui/material";

type NotesPanelProps = {
  notes: string;
  setNotes: (notes: string) => void;
};

export function NotesCard({ notes, setNotes }: NotesPanelProps) {
  return (
    <SectionCard title="Notes">
      <TextField
        fullWidth
        multiline
        minRows={2}
        maxRows={10}
        size="small"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
    </SectionCard>
  );
}
