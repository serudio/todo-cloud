import type { Todo, TodoTag } from "../types/todo";
import { TagPicker } from "../Shared/TagPicker";
import { useMobileCollapsedState } from "../Shared/useMobileCollapsedState";
import { TodoDetails } from "../Shared/TodoDetails";
import { SectionCard } from "../Shared/SectionCard";
import { Box, Chip, Badge } from "@mui/joy";
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
  const [isCollapsed, setIsCollapsed] = useMobileCollapsedState();

  function assignTodoTag(todoId: string, tagId: string | null) {
    onAssignTodoTag(todoId, tagId);
  }

  return (
    <SectionCard title="Done">
      {todos.length === 0 && <p className="status">Done items will show up here.</p>}
      <Box display="flex" flexDirection="column" gap={1}>
        {todos.map((todo) => (
          <DoneItem item={todo} tags={tags} onAddTodoText={onAddTodoText} assignTodoTag={assignTodoTag} />
        ))}
      </Box>
    </SectionCard>
  );
};
