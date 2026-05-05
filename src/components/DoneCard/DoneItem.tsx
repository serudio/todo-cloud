import { Box, Chip, Tooltip, IconButton } from "@mui/material";
import { TagPicker } from "../Shared/TagPicker";
import type { Todo, TodoTag } from "../../types/todo";
import { AutoRepeatButton } from "../Shared/AutoRepeatButton";
import ClearIcon from "@mui/icons-material/Clear";
import { TodoDetails } from "../Shared/TodoDetails";

type Props = {
  item: Todo;
  tags: TodoTag[];
  onAddTodoText: (text: string) => void;
  assignTodoTag: (id: string, tagId: string | null) => void;
  onToggleEndOfDayRepeat: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onResetTodoCount: (id: string) => void;
};

export const DoneItem: React.FC<Props> = ({
  item,
  tags,
  onAddTodoText,
  assignTodoTag,
  onToggleEndOfDayRepeat,
  onDeleteTodo,
  onResetTodoCount,
}) => {
  const { id, text, tagId } = item;
  const tag = tags.find((t) => t.id === tagId);
  const color = tag?.color;
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 0.5 }}>
      <TagPicker selectedTagId={tagId} tags={tags} onAssignTag={(tagId) => assignTodoTag(id, tagId)} />

      <Tooltip title={text}>
        <Chip label={text} onClick={() => onAddTodoText(text)} sx={{ color, flex: 1, maxWidth: "none", minWidth: 0 }} variant="filled" />
      </Tooltip>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <AutoRepeatButton checked={item.repeatAtEndOfDay} onClick={() => onToggleEndOfDayRepeat(id)} />
        <TodoDetails todo={item} onReset={onResetTodoCount} />
        <IconButton onClick={() => onDeleteTodo(id)} size="small" sx={{ padding: 0 }}>
          <ClearIcon />
        </IconButton>
      </Box>
    </Box>
  );
};
