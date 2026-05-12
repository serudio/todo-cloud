import { Box, Chip, Tooltip, IconButton } from "@mui/material";
import { TagPicker } from "../Shared/TagPicker";
import type { Todo, TodoTag } from "../../types/todo";
import { AutoRepeatButton } from "../Shared/AutoRepeatButton";
import ClearIcon from "@mui/icons-material/Clear";
import { TodoDetails } from "../Shared/TodoDetails";
import { DEFAULT_TAG_COLOR } from "../../constants/ui";
import { getLocalDateKey } from "../../utils/date";
import { restoreTodoFromDone } from "../../utils/todos";

type Props = {
  item: Todo;
  tags: TodoTag[];
  updateTodo: (todo: Todo) => void;
  onDeleteTodo: (id: string) => void;
};

export const DoneItem: React.FC<Props> = ({ item, tags, updateTodo, onDeleteTodo }) => {
  const { id, text, tagId } = item;
  const tag = tags.find((t) => t.id === tagId);
  const color = tag?.color ?? DEFAULT_TAG_COLOR;

  const updateTag = (tagId: string | null) => updateTodo({ ...item, tagId });

  const updateAutoRepeat = () => {
    const today = getLocalDateKey();
    const newRepeatAtEndOfDay = !item.repeatAtEndOfDay;
    updateTodo({
      ...item,
      repeatAtEndOfDay: newRepeatAtEndOfDay,
      lastAutoAddedDate: newRepeatAtEndOfDay ? today : null,
    });
  };

  const handleClick = () => {
    updateTodo(restoreTodoFromDone(item));
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 0.5 }}>
      <TagPicker selectedTagId={tagId} tags={tags} onTagSelect={updateTag} />

      <Tooltip title={text}>
        <Chip
          label={text}
          onClick={handleClick}
          sx={{
            color,
            flex: 1,
            maxWidth: "none",
            minWidth: 0,
            justifyContent: "flex-start",
            ".MuiChip-label": { padding: "0 4px" },
          }}
          variant="filled"
        />
      </Tooltip>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <AutoRepeatButton checked={item.repeatAtEndOfDay} onClick={updateAutoRepeat} />
        <TodoDetails todo={item} updateTodo={updateTodo} />
        <IconButton onClick={() => onDeleteTodo(id)} size="small" sx={{ padding: 0 }}>
          <ClearIcon />
        </IconButton>
      </Box>
    </Box>
  );
};
