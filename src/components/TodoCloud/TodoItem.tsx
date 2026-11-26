import { useCallback, useEffect, useRef, useState } from "react";
import type { Todo, TodoTag } from "../../types/todo";
import { isStaleTodo, markTodoDone, normalizeTodoText, shouldHighlightDueDate } from "../../utils/todos";
import { Box, IconButton, useTheme } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import {
  CLOUD_ACCENT,
  CLOUD_ITEM_FONT_SIZE,
  CLOUD_ITEM_HEIGHT,
  getCloudPalette,
  TASK_ACTION_HOVER_Z,
  TASK_ACTIONS_Z,
  TASK_Z,
} from "../../constants/ui";
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
  const cloud = getCloudPalette(useTheme().palette.mode);

  const [isEdit, setIsEdit] = useState(false);
  const [editText, setEditText] = useState("");
  const [hovered, setHovered] = useState(false);
  const [actionsFocused, setActionsFocused] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const showActions = (hovered || actionsFocused) && !isEdit;
  const shouldHighlightDue = shouldHighlightDueDate(todo.dueDate);

  // The tile is a pill, and the pointer only counts as over it inside the
  // rounded shape. A button on the box's corner sits outside the curve, so
  // reaching for it left the tile and it vanished: it goes on the flat top
  // edge instead, just before the curve starts.
  const editButtonRight = CLOUD_ITEM_HEIGHT / 2 - 11;

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
        boxSizing: "border-box",
        height: CLOUD_ITEM_HEIGHT,
        px: 1.75,
        // Frosted glass over the background picture: the headline behind
        // blurs away under a tile, so the name on it reads first.
        color: cloud.ink,
        // A tag tints the whole tile and its outline in its colour, so a
        // tagged task reads at a glance while keeping the same quiet shape.
        background: selectedTag
          ? `color-mix(in srgb, ${selectedTag.color} 26%, ${cloud.tileBg})`
          : cloud.tileBg,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: 1,
        borderColor: showActions
          ? CLOUD_ACCENT
          : selectedTag
            ? `color-mix(in srgb, ${selectedTag.color} 70%, transparent)`
            : cloud.tileBorder,
        borderRadius: 999,
        fontSize: CLOUD_ITEM_FONT_SIZE,
        fontWeight: 500,
        // Normal case, with the spacing kept airy: capitals made every name a
        // good deal wider, and the cloud is about fitting them in.
        letterSpacing: "0.08em",
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
          // On the top edge rather than over the name, so it never covers the end of it.
          sx={{
            position: "absolute",
            top: -10,
            right: editButtonRight,
            zIndex: TASK_ACTIONS_Z,
            width: 22,
            height: 22,
            p: 0,
            color: cloud.ink,
            bgcolor: cloud.raised,
            border: 1,
            borderColor: CLOUD_ACCENT,
            "&:hover": { bgcolor: cloud.raisedHover },
          }}
        >
          <EditIcon sx={{ fontSize: 12 }} />
        </IconButton>
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
