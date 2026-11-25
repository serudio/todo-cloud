import { useLayoutEffect, useRef, useState } from "react";
import { Card } from "@mui/material";
import { TASK_ACTIONS_Z } from "../../constants/ui";
import type { Todo, TodoTag } from "../../types/todo";
import { TodoActionControls } from "./TodoActionControls";

type Props = {
  todo: Todo;
  tags: TodoTag[];
  isDue: boolean;
  isSnoozed: boolean;
  updateTodo: (todo: Todo) => void;
  onToggleWeek: (todoId: string) => void;
  onToggleSnooze: () => void;
  onSetActionsFocused: (isFocused: boolean) => void;
};

// The hover card that floats under a cloud tile. Mobile uses TodoActionSheet instead.
export const TodoActions: React.FC<Props> = ({ onSetActionsFocused, ...controlProps }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  // Centred under its tile, but wider than most tiles: near the cloud's edge
  // it would hang past it and be cut off, so it is nudged back inside.
  const [offset, setOffset] = useState(0);

  useLayoutEffect(() => {
    const card = cardRef.current;
    const bounds = card?.closest("[data-cloud-bounds]")?.getBoundingClientRect();
    if (!card || !bounds) return;

    const rect = card.getBoundingClientRect();
    const margin = 4;

    if (rect.left < bounds.left + margin) setOffset(bounds.left + margin - rect.left);
    else if (rect.right > bounds.right - margin) setOffset(bounds.right - margin - rect.right);
  }, []);

  return (
    <Card
      ref={cardRef}
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
        transform: `translateX(calc(-50% + ${offset}px))`,
        zIndex: TASK_ACTIONS_Z,
        padding: "2px 6px",
        opacity: 0.9,
      }}
    >
      <TodoActionControls {...controlProps} onSetActionsFocused={onSetActionsFocused} />
    </Card>
  );
};
