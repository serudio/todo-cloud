import { Card } from "@mui/material";
import { TASK_ACTIONS_Z } from "../../constants/ui";
import type { Todo, TodoTag } from "../../types/todo";
import { TodoActionControls } from "./TodoActionControls";

type Props = {
  todo: Todo;
  tags: TodoTag[];
  isDayBeforeDueDate: boolean;
  isSnoozed: boolean;
  updateTodo: (todo: Todo) => void;
  onToggleSnooze: () => void;
  onSetActionsFocused: (isFocused: boolean) => void;
};

// The hover card that floats under a cloud tile. Mobile uses TodoActionSheet instead.
export const TodoActions: React.FC<Props> = ({ onSetActionsFocused, ...controlProps }) => {
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
        position: "absolute",
        top: "90%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: TASK_ACTIONS_Z,
        padding: "2px 6px",
        opacity: 0.9,
      }}
    >
      <TodoActionControls {...controlProps} onSetActionsFocused={onSetActionsFocused} />
    </Card>
  );
};
