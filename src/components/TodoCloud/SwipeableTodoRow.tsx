import { useRef, useState } from "react";
import dayjs from "dayjs";
import { Box, Chip, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import SnoozeIcon from "@mui/icons-material/Snooze";
import LinkIcon from "@mui/icons-material/Link";
import RepeatIcon from "@mui/icons-material/Repeat";
import type { Todo, TodoTag } from "../../types/todo";
import { DEFAULT_TAG_COLOR } from "../../constants/ui";
import { isStaleTodo, shouldHighlightDueDate } from "../../utils/todos";
import { StaleBadge } from "../Shared/StaleBadge";

type Props = {
  todo: Todo;
  tags: TodoTag[];
  isSnoozed: boolean;
  // A snoozed row swipes the same way, but leftwards it wakes rather than snoozes.
  leftActionLabel?: string;
  onDone: () => void;
  onSnooze: () => void;
  onOpenActions: () => void;
};

// Past this much horizontal travel the gesture commits on release. Below it the row
// springs back, so a hesitant swipe never completes a task by accident.
const COMMIT_DISTANCE = 96;
// Ignore drags that are mostly vertical, otherwise the list cannot be scrolled.
const DIRECTION_LOCK = 12;

export const SwipeableTodoRow: React.FC<Props> = ({
  todo,
  tags,
  isSnoozed,
  leftActionLabel = "snooze",
  onDone,
  onSnooze,
  onOpenActions,
}) => {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const gestureRef = useRef<{ startX: number; startY: number; isHorizontal: boolean | null } | null>(null);
  // The committed distance is read from a ref, not from state: pointer events can be
  // coalesced into one task, and then the release would still see an offset of zero.
  const offsetRef = useRef(0);

  const tagColor = tags.find((tag) => tag.id === todo.tagId)?.color ?? DEFAULT_TAG_COLOR;
  const isCommitted = Math.abs(offset) >= COMMIT_DISTANCE;

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    gestureRef.current = { startX: event.clientX, startY: event.clientY, isHorizontal: null };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture) return;

    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;

    // Decide once whether this is a swipe or a scroll, then stick with it.
    if (gesture.isHorizontal === null) {
      if (Math.abs(deltaX) < DIRECTION_LOCK && Math.abs(deltaY) < DIRECTION_LOCK) return;

      gesture.isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

      if (!gesture.isHorizontal) {
        gestureRef.current = null;
        return;
      }

      setIsDragging(true);

      // Capture keeps the gesture alive if the finger leaves the row, but it throws
      // for a pointer the element does not own, which must not kill the swipe.
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // The gesture still tracks through the row's own move events.
      }
    }

    offsetRef.current = deltaX;
    setOffset(deltaX);
  };

  const endGesture = () => {
    const wasHorizontal = gestureRef.current?.isHorizontal;
    const travelled = offsetRef.current;

    gestureRef.current = null;
    offsetRef.current = 0;
    setIsDragging(false);

    if (!wasHorizontal) return;

    if (travelled >= COMMIT_DISTANCE) onDone();
    else if (travelled <= -COMMIT_DISTANCE) onSnooze();

    setOffset(0);
  };

  const handleClick = () => {
    // A swipe ends with a click event too, so only a genuine tap opens the sheet.
    if (Math.abs(offset) > 4 || Math.abs(offsetRef.current) > 4) return;

    onOpenActions();
  };

  return (
    <Box sx={{ position: "relative", overflow: "hidden", borderRadius: 1, touchAction: "pan-y" }}>
      {/* The action revealed behind the row, coloured by the direction of travel. */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: offset > 0 ? "flex-start" : "flex-end",
          px: 2,
          gap: 1,
          color: "#fff",
          backgroundColor: offset > 0 ? "success.main" : "warning.main",
          opacity: offset === 0 ? 0 : isCommitted ? 1 : 0.55,
        }}
      >
        {offset > 0 ? <CheckIcon /> : <SnoozeIcon />}
        <Typography variant="body2">{offset > 0 ? "done" : leftActionLabel}</Typography>
      </Box>

      <Box
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        onClick={handleClick}
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 1,
          minHeight: 52,
          px: 1.5,
          py: 1,
          cursor: "pointer",
          userSelect: "none",
          backgroundColor: "background.paper",
          borderLeft: `4px solid ${tagColor}`,
          transform: `translateX(${offset}px)`,
          transition: isDragging ? "none" : "transform 180ms ease",
          opacity: isSnoozed ? 0.55 : 1,
        }}
      >
        <Typography sx={{ flex: 1, minWidth: 0, wordBreak: "break-word" }}>{todo.text}</Typography>

        {isStaleTodo(todo.lastAddedDate) && <StaleBadge lastAddedDate={todo.lastAddedDate} />}
        {todo.link && <LinkIcon fontSize="small" color="warning" />}
        {todo.repeatAtEndOfDay && <RepeatIcon fontSize="small" color="disabled" />}
        {todo.count > 1 && (
          <Typography variant="caption" color="text.secondary">
            ×{todo.count}
          </Typography>
        )}
        {todo.dueDate && (
          <Chip
            label={dayjs(todo.dueDate).format("MMM D")}
            size="small"
            color={shouldHighlightDueDate(todo.dueDate) ? "info" : "default"}
            variant={shouldHighlightDueDate(todo.dueDate) ? "filled" : "outlined"}
            sx={{ flexShrink: 0 }}
          />
        )}
      </Box>
    </Box>
  );
};
