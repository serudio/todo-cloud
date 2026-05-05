import { SectionCard } from "./Shared/SectionCard";
import { Textarea } from "@mui/joy";

type NotesPanelProps = {
  notes: string;
  onNotesChange: (notes: string) => void;
};

export function NotesPanel({ notes, onNotesChange }: NotesPanelProps) {
  return (
    <SectionCard title="Notes">
      <Textarea size="sm" minRows={2} maxRows={10} value={notes} onChange={(event) => onNotesChange(event.target.value)} />
    </SectionCard>
  );
}
