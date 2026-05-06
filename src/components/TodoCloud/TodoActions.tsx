import { AutoRepeatButton } from "../Shared/AutoRepeatButton";
import { DatePicker } from "../Shared/DatePicker";
import { NotTodayButton } from "../Shared/NotTodayButton";
import { TagPicker } from "../Shared/TagPicker";
import { TodoDetails } from "../Shared/TodoDetails";
import { Card } from "@mui/material";
import { TASK_ACTIONS_Z } from "../../constants/ui";
import type { Todo, TodoTag } from "../../types/todo";
import { getLocalDateKey } from "../../utils/date";
import { markTodoNotToday } from "../../utils/todos";

type Props = {
  todo: Todo;
  tags: TodoTag[];
  isDayBeforeDueDate: boolean;
  updateTodo: (todo: Todo) => void;
  onSetActionsFocused: (isFocused: boolean) => void;
};

export const TodoActions: React.FC<Props> = ({ todo, tags, isDayBeforeDueDate, updateTodo, onSetActionsFocused }) => {
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
      <DatePicker value={todo.dueDate} onChange={updateDueDate} onOpen={() => onSetActionsFocused(true)} />
      {/* <NotNowButton onClick={() => onMarkTodoNotNow(todo.id)} /> */}
      {!isDayBeforeDueDate && <NotTodayButton onClick={updateNotToday} />}
      <AutoRepeatButton checked={todo.repeatAtEndOfDay} onClick={updateAutoRepeat} />
      <TodoDetails todo={todo} updateTodo={updateTodo} />
    </Card>
  );
};
