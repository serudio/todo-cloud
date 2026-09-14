import ClearIcon from "@mui/icons-material/Clear";
import { Box, Button, Chip } from "@mui/material";
import { SectionCard } from "../Shared/SectionCard";
import type { DeletedTodo } from "../../utils/deletedTodos";
import { isSearching, matchesSearch } from "../../utils/search";

type DeletedCardProps = {
  deletedTodos: DeletedTodo[];
  search: string;
  onClear: () => void;
  onRemoveDeletedTodo: (id: string) => void;
  onRestoreDeletedTodo: (id: string) => void;
};

export function DeletedCard({
  deletedTodos: allDeletedTodos,
  search,
  onClear,
  onRemoveDeletedTodo,
  onRestoreDeletedTodo,
}: DeletedCardProps) {
  const deletedTodos = allDeletedTodos.filter((todo) => matchesSearch(search, todo.text));

  return (
    <SectionCard title="Deleted" collapsed expanded={isSearching(search)} sx={{ maxHeight: 200, overflow: "auto" }}>
      {deletedTodos.length === 0 && !isSearching(search) ? <p>Deleted items will show up here.</p> : null}

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {deletedTodos.map((todo) => (
          <Chip
            key={todo.id}
            deleteIcon={<ClearIcon fontSize="small" />}
            label={todo.text}
            onDoubleClick={() => onRestoreDeletedTodo(todo.id)}
            onDelete={() => onRemoveDeletedTodo(todo.id)}
            size="small"
            variant="outlined"
          />
        ))}
      </Box>

      {deletedTodos.length > 0 ? (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
          <Button onClick={onClear} size="small" variant="outlined">
            Clear
          </Button>
        </Box>
      ) : null}
    </SectionCard>
  );
}
