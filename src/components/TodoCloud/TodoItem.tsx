import { useEffect, useRef, useState } from "react";
import type { Todo, TodoTag } from "../../types/todo";
import { getDateInputValue, getTodoSize, isStaleTodo } from "../../utils/todos";
import { Box, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { DEFAULT_TAG_COLOR, TASK_ACTION_HOVER_Z, TASK_ACTIONS_Z, TASK_Z } from "../../constants/ui";
import { getTodoFontSize, getTodoPadding } from "../../utils/ui";
import { TodoActions } from "./TodoActions";

type Props = {
  todo: Todo;
  index: number;
  onToggleTodo: (id: string) => void;
  onAssignTodoTag: (id: string, tagId: string | null) => void;
  onEditTodoText: (id: string, nextText: string) => boolean;
  onMarkTodoNotToday: (id: string) => void;
  onSetTodoDueDate: (id: string, dueDate: number | null) => void;
  onToggleEndOfDayRepeat: (id: string) => void;
  onResetTodoCount: (id: string) => void;
  handleTodoDragStart: (event: React.DragEvent<HTMLElement>, todoId: string) => void;
  tags: TodoTag[];
};

function getTomorrowDateInputValue() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return getDateInputValue(tomorrow.getTime());
}

export const TodoItem: React.FC<Props> = ({
  todo,
  index,
  onToggleTodo,
  onAssignTodoTag,
  onEditTodoText,
  onMarkTodoNotToday,
  onSetTodoDueDate,
  onToggleEndOfDayRepeat,
  onResetTodoCount,
  handleTodoDragStart,
  tags,
}) => {
  const { id, text } = todo;

  const isStale = isStaleTodo(todo.lastAddedDate);
  const selectedTag = tags.find((tag) => tag.id === todo.tagId);
  const { color = DEFAULT_TAG_COLOR } = selectedTag || {};

  const [isEdit, setIsEdit] = useState(false);
  const [editText, setEditText] = useState("");
  const [hovered, setHovered] = useState(false);
  const [actionsFocused, setActionsFocused] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const showActions = (hovered || actionsFocused) && !isEdit;
  const isDayBeforeDueDate = getDateInputValue(todo.dueDate) === getTomorrowDateInputValue();

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

  function cancelEditing() {
    setIsEdit(false);
    setEditText("");
  }

  function finishEditing() {
    const trimmedText = editText.trim().replace(/\s+/g, " ");

    if (!trimmedText || trimmedText === todo.text) {
      cancelEditing();
      return;
    }

    if (onEditTodoText(todo.id, trimmedText)) {
      cancelEditing();
    }
  }

  function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    finishEditing();
  }

  function handleEditKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
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
        borderRadius: 999,
        paddingLeft: 2,
        paddingRight: 2,
        fontSize: getTodoFontSize(size),
        padding: getTodoPadding(size),
        cursor: !isEdit ? "grab" : "text",
        minWidth: 120,
        justifyContent: "center",
        zIndex: showActions ? TASK_ACTION_HOVER_Z : TASK_Z,
        scale: showActions ? 1.03 : 1,
        ...(isDayBeforeDueDate && {
          outline: "2px solid",
          outlineColor: "warning.main",
          outlineOffset: 3,
          animation: "dueTomorrowPulse 1.4s ease-in-out infinite",
          "@keyframes dueTomorrowPulse": (theme) => ({
            "0%, 100%": {
              boxShadow: `0 0 0 0 ${theme.palette.warning.main}`,
            },
            "50%": {
              boxShadow: `0 0 0 6px ${theme.palette.warning.light}`,
            },
          }),
        }),
      }}
    >
      {showActions && (
        <IconButton
          size="small"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleEdit();
          }}
          sx={{
            position: "absolute",
            right: -1,
            minHeight: "100%",
            borderTopRightRadius: 999,
            borderBottomRightRadius: 999,
            zIndex: TASK_ACTIONS_Z,
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      )}
      <Box
        sx={{ display: !isEdit ? "block" : "none" }}
        onClick={(e) => {
          e.preventDefault();
          onToggleTodo(id);
        }}
      >
        {text}
      </Box>
      {isEdit && (
        <form className="todo-editor" onSubmit={handleEditSubmit}>
          <input
            ref={editInputRef}
            value={editText}
            onBlur={finishEditing}
            onChange={(event) => setEditText(event.target.value)}
            onKeyDown={handleEditKeyDown}
          />
        </form>
      )}

      {isStale && (
        <span className="stale-badge" title="Added at least a month ago">
          STALE
        </span>
      )}
      {showActions && (
        <TodoActions
          todo={todo}
          tags={tags}
          isDayBeforeDueDate={isDayBeforeDueDate}
          onAssignTodoTag={onAssignTodoTag}
          onMarkTodoNotToday={onMarkTodoNotToday}
          onResetTodoCount={onResetTodoCount}
          onSetActionsFocused={setActionsFocused}
          onSetTodoDueDate={onSetTodoDueDate}
          onToggleEndOfDayRepeat={onToggleEndOfDayRepeat}
        />
      )}
    </Box>
  );
};
