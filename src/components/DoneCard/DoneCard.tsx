import type { Todo, TodoTag } from "../../types/todo";
import { SectionCard } from "../Shared/SectionCard";
import { Box } from "@mui/material";
import { DoneItem } from "./DoneItem";

type DoneListProps = {
  todos: Todo[];
  tags: TodoTag[];
  onAddTodoText: (text: string) => void;
  onAssignTodoTag: (id: string, tagId: string | null) => void;
  onDeleteTodo: (id: string) => void;
  onResetTodoCount: (id: string) => void;
  onToggleEndOfDayRepeat: (id: string) => void;
};

export const DoneCard: React.FC<DoneListProps> = ({
  todos,
  tags,
  onAddTodoText,
  onAssignTodoTag,
  onDeleteTodo,
  onResetTodoCount,
  onToggleEndOfDayRepeat,
}) => {
  function assignTodoTag(todoId: string, tagId: string | null) {
    onAssignTodoTag(todoId, tagId);
  }

  return (
    <SectionCard title="Done">
      {todos.length === 0 && <p className="status">Done items will show up here.</p>}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {todos.map((todo) => (
          <DoneItem
            key={todo.id}
            item={todo}
            tags={tags}
            onAddTodoText={onAddTodoText}
            assignTodoTag={assignTodoTag}
            onToggleEndOfDayRepeat={onToggleEndOfDayRepeat}
            onDeleteTodo={onDeleteTodo}
            onResetTodoCount={onResetTodoCount}
          />
        ))}
      </Box>
    </SectionCard>
  );
};
