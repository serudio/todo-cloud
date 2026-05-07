import { useEffect, useState } from "react";
import { SectionCard } from "./Shared/SectionCard";
import { TextField } from "@mui/material";

type NotesPanelProps = {
  notes: string;
  setNotes: (notes: string) => void;
};

function formatNotes(notes: string) {
  // Replace ";" with ";\n", but avoid duplicating newlines.
  return notes.replace(/;\s*(?!\n)/g, ";\n");
}

export function NotesCard({ notes, setNotes }: NotesPanelProps) {
  const [value, setValue] = useState(formatNotes(notes));

  useEffect(() => {
    setValue(formatNotes(notes));
  }, [notes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setNotes(raw);
    setValue(formatNotes(raw));
  };
  return (
    <SectionCard title="Notes">
      <TextField
        fullWidth
        multiline
        minRows={2}
        maxRows={10}
        size="small"
        value={value}
        onChange={handleChange}
        sx={{ textarea: { fontSize: "0.85rem", lineHeight: "1.1rem", letterSpacing: 1.2 } }}
      />
    </SectionCard>
  );
}
