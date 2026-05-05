import { AutoRepeatButton } from "../Shared/AutoRepeatButton";
import { DatePicker } from "../Shared/DatePicker";
import { NotTodayButton } from "../Shared/NotTodayButton";
import { TagPicker } from "../Shared/TagPicker";
import { TodoDetails } from "../Shared/TodoDetails";
import { Card } from "@mui/material";
import { TASK_ACTIONS_Z } from "../../constants/ui";
import type { Todo, TodoTag } from "../../types/todo";
import { getLocalDateKey } from "../../utils/date";

type Props = {
  todo: Todo;
  tags: TodoTag[];
  isDayBeforeDueDate: boolean;
  updateTodo: (todo: Todo) => void;
  onMarkTodoNotToday: (id: string) => void;
  onSetActionsFocused: (isFocused: boolean) => void;
  onSetTodoDueDate: (id: string, dueDate: number | null) => void;
};

export const TodoActions: React.FC<Props> = ({
  todo,
  tags,
  isDayBeforeDueDate,
  updateTodo,
  onMarkTodoNotToday,
  onSetActionsFocused,
  onSetTodoDueDate,
}) => {
  const { id } = todo;

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

  const updateCount = () => {
    updateTodo({ ...todo, count: 0 });
  };

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
      <TagPicker selectedTagId={todo.tagId} tags={tags} onTagSelect={updateTag} />
      <DatePicker
        value={todo.dueDate}
        onChange={(dueDate) => onSetTodoDueDate(todo.id, dueDate)}
        onOpen={() => onSetActionsFocused(true)}
      />
      {/* <NotNowButton onClick={() => onMarkTodoNotNow(todo.id)} /> */}
      {!isDayBeforeDueDate && <NotTodayButton onClick={() => onMarkTodoNotToday(id)} />}
      <AutoRepeatButton checked={todo.repeatAtEndOfDay} onClick={updateAutoRepeat} />
      <TodoDetails todo={todo} onReset={updateCount} />
    </Card>
  );
};
