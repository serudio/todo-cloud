import {
  Box,
  Chip,
  Tooltip,
  // Badge,
  IconButton,
} from "@mui/joy";
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
      {/* <Badge badgeContent={count} badgeInset="10%" variant="plain" color="neutral" size="sm"> */}
      <TagPicker selectedTagId={tagId} tags={tags} onAssignTag={(tagId) => assignTodoTag(id, tagId)} />
      {/* </Badge> */}

      <Tooltip title={text}>
        <Chip onClick={() => onAddTodoText(text)} sx={{ color, flex: 1, maxWidth: "none", minWidth: 0 }} variant="solid">
          {text}
        </Chip>
      </Tooltip>
      <Box display="flex" alignItems="center" gap={0.5}>
        <AutoRepeatButton checked={item.repeatAtEndOfDay} onClick={() => onToggleEndOfDayRepeat(id)} />
        <TodoDetails todo={item} onReset={onResetTodoCount} />
        <IconButton onClick={() => onDeleteTodo(id)} size="sm" sx={{ padding: 0, width: 22, height: 22, minHeight: 22, minWidth: 22 }}>
          <ClearIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

// <li key={todo.id}>
//   <span className="item-text-control">

//     <span className="count-anchor">
//       <span className="count" title={`Added ${todo.count} ${todo.count === 1 ? "time" : "times"}`}>
//         {todo.count}
//       </span>
//       <span className="count-popover">
//         <span className="count-popover-title">Count</span>
//         <button type="button" onClick={() => onResetTodoCount(todo.id)}>
//           Reset to 0
//         </button>
//       </span>
//     </span>
//   </span>
//   <button
//     aria-pressed={todo.repeatAtEndOfDay}
//     className="suggestion-repeat"
//     title="Add again at midnight"
//     type="button"
//     onClick={() => onToggleEndOfDayRepeat(todo.id)}
//   >
//     <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
//       <path d="M15.8 5.4A6.7 6.7 0 0 0 4.4 4.1l1.2 1.2a5 5 0 0 1 8.9 2.9H12l3.6 3.6 3.6-3.6h-2.9a6.7 6.7 0 0 0-.5-2.8ZM4.2 14.6a6.7 6.7 0 0 0 11.4 1.3l-1.2-1.2a5 5 0 0 1-8.9-2.9H8L4.4 8.2.8 11.8h2.9c0 1 .2 1.9.5 2.8Z" />
//     </svg>
//   </button>

// </li>
