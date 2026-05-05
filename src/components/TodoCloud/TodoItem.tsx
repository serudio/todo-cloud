import { useState } from "react";
import type { Todo, TodoTag } from "../../types/todo";
import { getTodoSize, isStaleTodo } from "../../utils/todos";
import { AutoRepeatButton } from "../Shared/AutoRepeatButton";
import { NotTodayButton } from "../Shared/NotTodayButton";
import { TagPicker } from "../Shared/TagPicker";
import { TodoDetails } from "../Shared/TodoDetails";
import { Box, Card, Chip, IconButton } from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import { TASK_ACTION_HOVER_Z, TASK_ACTIONS_Z, TASK_Z } from "../../constants/ui";

type Props = {
  todo: Todo;
  editId: string | null;
  index: number;
  onToggleTodo: (id: string) => void;
  onAssignTodoTag: (id: string, tagId: string | null) => void;
  onMarkTodoNotToday: (id: string) => void;
  onToggleEndOfDayRepeat: (id: string) => void;
  onResetTodoCount: (id: string) => void;
  handleEdit: (todo: Todo) => void;
  editInputRef: React.RefObject<HTMLInputElement | null> | null;
  editText: string;
  setEditText: (text: string) => void;
  finishEditing: (todo: Todo) => void;
  handleEditSubmit: (event: React.FormEvent<HTMLFormElement>, todo: Todo) => void;
  handleEditKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  handleTodoDragStart: (event: React.DragEvent<HTMLElement>, todoId: string) => void;
  tags: TodoTag[];
};

export const TodoItem: React.FC<Props> = ({
  todo,
  editId,
  index,
  onToggleTodo,
  onAssignTodoTag,
  onMarkTodoNotToday,
  onToggleEndOfDayRepeat,
  onResetTodoCount,
  handleEdit,
  editInputRef,
  editText,
  setEditText,
  finishEditing,
  handleEditSubmit,
  handleEditKeyDown,
  handleTodoDragStart,
  tags,
}) => {
  const { id, text } = todo;

  const isEdit = editId === id;
  const isStale = isStaleTodo(todo.lastAddedDate);
  const selectedTag = tags.find((tag) => tag.id === todo.tagId);
  const { color = "#e2e2e2" } = selectedTag || {};

  const [hovered, setHovered] = useState(false);

  const size = getTodoSize(todo.count);

  const getFontSize = () => {
    if (size === 5) return "2rem";
    if (size === 4) return "1.5rem";
    if (size === 3) return "1.25rem";
    if (size === 2) return "1rem";
    return "0.8rem";
  };
  const getPadding = () => {
    if (size === 5) return "16px 16px";
    if (size === 4) return "14px 14px";
    if (size === 3) return "12px 12px";
    if (size === 2) return "9px 9px";
    return "5px 9px";
  };

  function handleDragStart(event: React.DragEvent<HTMLElement>) {
    const target = event.target;

    if (target instanceof HTMLElement && target.closest("button, input, textarea, select, a")) {
      event.preventDefault();
      return;
    }

    handleTodoDragStart(event, todo.id);
  }

  return (
    <Chip
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
        fontSize: getFontSize(),
        padding: getPadding(),
        cursor: !isEdit ? "grab" : "text",
        minWidth: 120,
        justifyContent: "center",
        zIndex: hovered ? TASK_ACTION_HOVER_Z : TASK_Z,
        scale: hovered ? 1.03 : 1,
      }}
      slotProps={{
        endDecorator: { sx: { pointerEvents: "auto", zIndex: TASK_ACTIONS_Z } },
      }}
      endDecorator={
        hovered &&
        !isEdit && (
          <IconButton
            size="sm"
            variant="plain"
            color="neutral"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleEdit(todo);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )
      }
    >
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
        <form className="todo-editor" onSubmit={(event) => handleEditSubmit(event, todo)}>
          <input
            ref={editInputRef}
            value={editText}
            onBlur={() => finishEditing(todo)}
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
      {hovered && (
        <Card
          size="sm"
          sx={{
            display: "flex",
            flexDirection: "row",
            position: "absolute",
            bottom: -10,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: TASK_ACTIONS_Z,
            padding: 0,
            opacity: 0.9,
          }}
        >
          <TagPicker selectedTagId={todo.tagId} tags={tags} onAssignTag={(tagId) => onAssignTodoTag(id, tagId)} />
          {/* <NotNowButton onClick={() => onMarkTodoNotNow(todo.id)} /> */}
          <NotTodayButton onClick={() => onMarkTodoNotToday(todo.id)} />
          <AutoRepeatButton checked={todo.repeatAtEndOfDay} onClick={() => onToggleEndOfDayRepeat(todo.id)} />
          <TodoDetails todo={todo} onReset={onResetTodoCount} />
        </Card>
      )}
    </Chip>
  );
};
