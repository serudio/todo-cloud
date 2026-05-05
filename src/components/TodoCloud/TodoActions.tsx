import { AutoRepeatButton } from "../Shared/AutoRepeatButton";
import { DatePicker } from "../Shared/DatePicker";
import { NotTodayButton } from "../Shared/NotTodayButton";
import { TagPicker } from "../Shared/TagPicker";
import { TodoDetails } from "../Shared/TodoDetails";
import { Card } from "@mui/material";
import { TASK_ACTIONS_Z } from "../../constants/ui";
import type { Todo, TodoTag } from "../../types/todo";

type Props = {
  todo: Todo;
  tags: TodoTag[];
  isDayBeforeDueDate: boolean;
  onAssignTodoTag: (id: string, tagId: string | null) => void;
  onMarkTodoNotToday: (id: string) => void;
  onResetTodoCount: (id: string) => void;
  onSetActionsFocused: (isFocused: boolean) => void;
  onSetTodoDueDate: (id: string, dueDate: number | null) => void;
  onToggleEndOfDayRepeat: (id: string) => void;
};

export const TodoActions: React.FC<Props> = ({
  todo,
  tags,
  isDayBeforeDueDate,
  onAssignTodoTag,
  onMarkTodoNotToday,
  onResetTodoCount,
  onSetActionsFocused,
  onSetTodoDueDate,
  onToggleEndOfDayRepeat,
}) => {
  const { id } = todo;

  return (
    <Card
      onFocusCapture={() => onSetActionsFocused(true)}
      onBlurCapture={(event) => {
        const nextFocusedElement = event.relatedTarget;

        if (!(nextFocusedElement instanceof Node) || !event.currentTarget.contains(nextFocusedElement)) {
          onSetActionsFocused(false);
        }
      }}
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 1,

        position: "absolute",
        top: "90%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: TASK_ACTIONS_Z,
        padding: "2px 6px",
        opacity: 0.9,
      }}
    >
      <TagPicker selectedTagId={todo.tagId} tags={tags} onAssignTag={(tagId) => onAssignTodoTag(id, tagId)} />
      <DatePicker value={todo.dueDate} onChange={(dueDate) => onSetTodoDueDate(todo.id, dueDate)} onOpen={() => onSetActionsFocused(true)} />
      {/* <NotNowButton onClick={() => onMarkTodoNotNow(todo.id)} /> */}
      {!isDayBeforeDueDate && <NotTodayButton onClick={() => onMarkTodoNotToday(id)} />}
      <AutoRepeatButton checked={todo.repeatAtEndOfDay} onClick={() => onToggleEndOfDayRepeat(todo.id)} />
      <TodoDetails todo={todo} onReset={onResetTodoCount} />
    </Card>
  );
};
