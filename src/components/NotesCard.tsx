import { SectionCard } from "./Shared/SectionCard";
import { Textarea } from "@mui/joy";

type NotesPanelProps = {
  notes: string;
  setNotes: (notes: string) => void;
};

export function NotesCard({ notes, setNotes }: NotesPanelProps) {
  return (
    <SectionCard title="Notes">
      <Textarea size="sm" minRows={2} maxRows={10} value={notes} onChange={(event) => setNotes(event.target.value)} />
    </SectionCard>
  );
}
