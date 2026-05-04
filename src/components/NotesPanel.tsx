import { Panel } from "./Shared/Panel";
import { PanelHeader } from "./Shared/PanelHeader";
import { useMobileCollapsedState } from "./Shared/useMobileCollapsedState";
import "./NotesPanel.css";

type NotesPanelProps = {
  notes: string;
  onNotesChange: (notes: string) => void;
};

export function NotesPanel({ notes, onNotesChange }: NotesPanelProps) {
  const [isCollapsed, setIsCollapsed] = useMobileCollapsedState();

  return (
    <Panel>
      <PanelHeader onClick={() => setIsCollapsed((current) => !current)}>
        notes
      </PanelHeader>
      {!isCollapsed ? (
        <textarea
          className="notes-textarea"
          placeholder="Write notes..."
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
        />
      ) : null}
    </Panel>
  );
}
