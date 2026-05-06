import { useCallback, useEffect, useRef, useState } from "react";
import type { Todo, TodoTag } from "../../types/todo";
import { getTodoSize, isStaleTodo, markTodoDone, normalizeTodoText, shouldHighlightDueDate } from "../../utils/todos";
import { Box, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { DEFAULT_TAG_COLOR, TASK_ACTION_HOVER_Z, TASK_ACTIONS_Z, TASK_Z } from "../../constants/ui";
import { getTodoFontSize, getTodoPadding } from "../../utils/ui";
import { TodoActions } from "./TodoActions";
import { DueDateChip } from "./DueDateChip";

type Props = {
  todo: Todo;
  updateTodo: (todo: Todo) => void;
  index: number;
  handleTodoDragStart: (event: React.DragEvent<HTMLElement>, todoId: string) => void;
  tags: TodoTag[];
};

export const TodoItem: React.FC<Props> = ({ todo, updateTodo, index, handleTodoDragStart, tags }) => {
  const { text } = todo;

  const isStale = isStaleTodo(todo.lastAddedDate);
  const selectedTag = tags.find((tag) => tag.id === todo.tagId);
  const { color = DEFAULT_TAG_COLOR } = selectedTag || {};

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
        position: "relative",
        transform: `rotate(calc((${index % 5} - 2) * 2deg))`,
        color: "#000",
        background: color,
        maxWidth: 300,
        borderRadius: 999,
        paddingLeft: 2,
        paddingRight: 2,
        letterSpacing: 1.5,
        fontSize: getTodoFontSize(size),
        padding: getTodoPadding(size),
        cursor: !isEdit ? "grab" : "text",
        minWidth: 120,
        justifyContent: "center",
        zIndex: showActions ? TASK_ACTION_HOVER_Z : TASK_Z,
        scale: showActions ? 1.03 : 1,
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
          sx={{ position: "absolute", right: -1, zIndex: TASK_ACTIONS_Z }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      )}
      <Box sx={{ display: !isEdit ? "block" : "none" }} onClick={handleClick}>
        {text}
      </Box>
      {isEdit && (
        <form className="todo-editor" onSubmit={handleEditSubmit}>
          <input
            ref={editInputRef}
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
          isDayBeforeDueDate={shouldHighlightDue}
          onSetActionsFocused={setActionsFocused}
        />
      )}
      {shouldHighlightDue && <DueDateChip />}
      {isStale && <span>STALE</span>}
    </Box>
  );
};
