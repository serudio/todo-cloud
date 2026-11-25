import { useCallback, useEffect, useRef, useState } from "react";
import type { Todo, TodoTag } from "../../types/todo";
import { getTodoSize, isStaleTodo, markTodoDone, normalizeTodoText, shouldHighlightDueDate } from "../../utils/todos";
import { Box, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import {
  CLOUD_ACCENT,
  CLOUD_INK,
  CLOUD_TILE_BG,
  CLOUD_TILE_BORDER,
  TASK_ACTION_HOVER_Z,
  TASK_ACTIONS_Z,
  TASK_Z,
} from "../../constants/ui";
import { getTodoFontSize, getTodoPadding } from "../../utils/ui";
import { TodoActions } from "./TodoActions";
import { DueDateChip } from "./DueDateChip";
import { StaleBadge } from "../Shared/StaleBadge";

type Props = {
  todo: Todo;
  updateTodo: (todo: Todo) => void;
  isSnoozed: boolean;
  onToggleWeek: (todoId: string) => void;
  onToggleSnooze: () => void;
  handleTodoDragStart: (event: React.DragEvent<HTMLElement>, todoId: string) => void;
  tags: TodoTag[];
};

export const TodoItem: React.FC<Props> = ({
  todo,
  updateTodo,
  isSnoozed,
  onToggleWeek,
  onToggleSnooze,
  handleTodoDragStart,
  tags,
}) => {
  const { text } = todo;

  const isStale = isStaleTodo(todo.lastAddedDate);
  const selectedTag = tags.find((tag) => tag.id === todo.tagId);

  const [isEdit, setIsEdit] = useState(false);
  const [editText, setEditText] = useState("");
  const [hovered, setHovered] = useState(false);
  const [actionsFocused, setActionsFocused] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const showActions = (hovered || actionsFocused) && !isEdit;
  const shouldHighlightDue = shouldHighlightDueDate(todo.dueDate);

  const size = getTodoSize(todo.count);

  useEffect(() => {
    if (!isEdit) return;

    editInputRef.current?.focus();
    editInputRef.current?.select();
  }, [isEdit]);

  function handleEdit() {
    setIsEdit(true);
    setEditText(todo.text);
  }

  function resetEdit() {
    setIsEdit(false);
    setEditText("");
  }

  function finishEditing() {
    const trimmedText = normalizeTodoText(editText);

    if (!trimmedText || trimmedText === todo.text) {
      resetEdit();
      return;
    }

    updateTodo({ ...todo, text: trimmedText });
    resetEdit();
  }

  function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    finishEditing();
  }

  function handleEditKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      resetEdit();
    }
  }

  function handleDragStart(event: React.DragEvent<HTMLElement>) {
    const target = event.target;

    if (target instanceof HTMLElement && target.closest("button, input, textarea, select, a")) {
      event.preventDefault();
      return;
    }

    handleTodoDragStart(event, todo.id);
  }

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      updateTodo(markTodoDone(todo));
    },
    [updateTodo],
  );

  return (
    <Box
      draggable={!isEdit}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDragStart={handleDragStart}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5em",
        position: "relative",
        maxWidth: 300,
        minWidth: 120,
        padding: getTodoPadding(size),
        // Frosted glass over the background picture: the headline behind
        // blurs away under a tile, so the name on it reads first.
        color: CLOUD_INK,
        background: CLOUD_TILE_BG,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: 1,
        borderColor: showActions ? CLOUD_ACCENT : CLOUD_TILE_BORDER,
        borderRadius: 999,
        fontSize: getTodoFontSize(size),
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        cursor: !isEdit ? "grab" : "text",
        zIndex: showActions ? TASK_ACTION_HOVER_Z : TASK_Z,
        transform: showActions ? "translateY(-2px)" : "none",
        transition: "transform 150ms ease, border-color 150ms ease",
        opacity: isStale && !showActions ? 0.6 : 1,
      }}
    >
      {showActions && (
        <IconButton
          size="small"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleEdit();
          }}
          // On the corner rather than over the name, so it never covers the end of it.
          sx={{
            position: "absolute",
            top: -10,
            right: -10,
            zIndex: TASK_ACTIONS_Z,
            width: 22,
            height: 22,
            p: 0,
            color: CLOUD_INK,
            bgcolor: "#141414",
            border: 1,
            borderColor: CLOUD_ACCENT,
            "&:hover": { bgcolor: "#1f1f1f" },
          }}
        >
          <EditIcon sx={{ fontSize: 12 }} />
        </IconButton>
      )}
      {/* The tag as a dot rather than a fill, so every tile is the same quiet shape. */}
      {selectedTag && !isEdit && (
        <Box
          aria-hidden
          sx={{ width: 6, height: 6, flexShrink: 0, borderRadius: "50%", bgcolor: selectedTag.color }}
        />
      )}
      <Box sx={{ display: !isEdit ? "block" : "none", textAlign: "center", lineHeight: 1 }} onClick={handleClick}>
        {text}
      </Box>
      {isEdit && (
        <form onSubmit={handleEditSubmit}>
          <input
            ref={editInputRef}
            style={{
              background: "transparent",
              border: 0,
              outline: "none",
              color: "inherit",
              font: "inherit",
              letterSpacing: "inherit",
              textTransform: "inherit",
              textAlign: "center",
            }}
            value={editText}
            onBlur={finishEditing}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleEditKeyDown}
          />
        </form>
      )}

      {showActions && (
        <TodoActions
          todo={todo}
          tags={tags}
          updateTodo={updateTodo}
          isDue={shouldHighlightDue}
          isSnoozed={isSnoozed}
          onToggleWeek={onToggleWeek}
          onToggleSnooze={onToggleSnooze}
          onSetActionsFocused={setActionsFocused}
        />
      )}
      {shouldHighlightDue && <DueDateChip />}
      {isStale && <StaleBadge lastAddedDate={todo.lastAddedDate} isFloating />}
    </Box>
  );
};
