import { Box, Button, IconButton, Tooltip } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import { AutoRepeatButton } from "../Shared/AutoRepeatButton";
import { DatePicker } from "../Shared/DatePicker";
import { NotTodayButton } from "../Shared/NotTodayButton";
import { TagPicker } from "../Shared/TagPicker";
import { TodoDetails } from "../Shared/TodoDetails";
import { TodoLinkButton } from "../Shared/TodoLinkButton";
import type { Todo, TodoTag } from "../../types/todo";
import { getLocalDateKey } from "../../utils/date";
import { markTodoNotToday } from "../../utils/todos";

type Props = {
  todo: Todo;
  tags: TodoTag[];
  isDayBeforeDueDate: boolean;
  isSnoozed: boolean;
  updateTodo: (todo: Todo) => void;
  onToggleWeek: (todoId: string) => void;
  onToggleSnooze: () => void;
  onSetActionsFocused?: (isFocused: boolean) => void;
};

// The controls themselves, with no opinion about where they sit: the desktop hover
// card and the mobile action sheet both render this, so neither can drift.
export const TodoActionControls: React.FC<Props> = ({
  todo,
  tags,
  isDayBeforeDueDate,
  isSnoozed,
  updateTodo,
  onToggleWeek,
  onToggleSnooze,
  onSetActionsFocused,
}) => {
  const updateTag = (tagId: string | null) => updateTodo({ ...todo, tagId });

  const updateAutoRepeat = () => {
    const today = getLocalDateKey();
    const newRepeatAtEndOfDay = !todo.repeatAtEndOfDay;

    updateTodo({
      ...todo,
      repeatAtEndOfDay: newRepeatAtEndOfDay,
      lastAutoAddedDate: newRepeatAtEndOfDay ? today : null,
    });
  };

  const updateNotToday = () => updateTodo(markTodoNotToday(todo));
  const updateDueDate = (dueDate: number | null) => updateTodo({ ...todo, dueDate });
  const updateLink = (link: string | null) => updateTodo({ ...todo, link });

  return (
    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 1 }}>
      <TagPicker selectedTagId={todo.tagId} tags={tags} onTagSelect={updateTag} />
      <DatePicker value={todo.dueDate} onChange={updateDueDate} onOpen={() => onSetActionsFocused?.(true)} />
      <TodoLinkButton link={todo.link} onChange={updateLink} onOpen={() => onSetActionsFocused?.(true)} />
      <Tooltip title={todo.productiveWeek ? "Take out of the productive week" : "Gather for a productive week"}>
        <IconButton
          size="small"
          aria-label="Productive week"
          color={todo.productiveWeek ? "warning" : "default"}
          onClick={() => onToggleWeek(todo.id)}
        >
          <BoltIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {!isDayBeforeDueDate && <NotTodayButton onClick={updateNotToday} />}
      <Button
        onClick={onToggleSnooze}
        size="small"
        variant={isSnoozed ? "contained" : "text"}
        sx={{ p: 0, minHeight: 22, minWidth: 0, fontWeight: 700, textTransform: "lowercase" }}
      >
        snooze
      </Button>
      <AutoRepeatButton checked={todo.repeatAtEndOfDay} onClick={updateAutoRepeat} />
      <TodoDetails todo={todo} updateTodo={updateTodo} />
    </Box>
  );
};
