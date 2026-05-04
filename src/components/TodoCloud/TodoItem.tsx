import { useState } from "react";
import type { Todo, TodoTag } from "../../types/todo";
import { getTodoSize, isStaleTodo } from "../../utils/todos";
import { AutoRepeatButton } from "../Shared/AutoRepeatButton";
import { NotTodayButton } from "../Shared/NotTodayButton";
import { TagPicker } from "../Shared/TagPicker";
import { TodoDetails } from "../Shared/TodoDetails";
import { TodoEditButton } from "../Shared/TodoEditButton";
import { Box, Card, Button } from "@mui/joy";

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
  handleEditSubmit: (
    event: React.FormEvent<HTMLFormElement>,
    todo: Todo,
  ) => void;
  handleEditKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  handleTodoDragStart: (
    event: React.DragEvent<HTMLElement>,
    todoId: string,
  ) => void;
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
  const fontSize = 10 * (1 + 0.2 * size);
  const getPadding = () => {
    const x = 5 + 2 * size;
    const y = 9 + 2 * size;
    return `${y}px ${x}px`;
  };

  function handleDragStart(event: React.DragEvent<HTMLElement>) {
    const target = event.target;

    if (
      target instanceof HTMLElement &&
      target.closest("button, input, textarea, select, a")
    ) {
      event.preventDefault();
      return;
    }

    handleTodoDragStart(event, todo.id);
  }

  return (
    <Box
      draggable={!isEdit}
      display="inline-flex"
      alignItems="center"
      position="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDragStart={handleDragStart}
      sx={{
        transform: `rotate(calc((${index % 5} - 2) * 2deg))`,
        color: "#000",
        background: color,
        borderRadius: 999,
        paddingLeft: 2,
        paddingRight: 2,
        fontSize,
        padding: getPadding(),
        cursor: !isEdit ? "grab" : "text",
        minWidth: 100,
        justifyContent: "center",
      }}
    >
      <Button
        sx={{
          position: "absolute",
          left: -1,
          padding: 0,
          opacity: 0.8,
          borderTopLeftRadius: 999,
          borderBottomLeftRadius: 999,
          minHeight: "100%",
          // visibility: hovered && !isEdit ? "visible" : "hidden",
          "&:hover": { opacity: 1 },
        }}
        size="sm"
        variant="soft"
        color="neutral"
        onClick={() => onToggleTodo(id)}
      >
        done
      </Button>

      <Box sx={{ display: !isEdit ? "block" : "none" }}>{text}</Box>
      {isEdit && (
        <form
          className="todo-editor"
          onSubmit={(event) => handleEditSubmit(event, todo)}
        >
          <input
            ref={editInputRef}
            value={editText}
            onBlur={() => finishEditing(todo)}
            onChange={(event) => setEditText(event.target.value)}
            onKeyDown={handleEditKeyDown}
          />
        </form>
      )}
      {hovered && <TodoEditButton onClick={() => handleEdit(todo)} />}

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
            bottom: -20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            padding: 0,
            opacity: 0.8,
          }}
        >
          <TagPicker
            selectedTagId={todo.tagId}
            tags={tags}
            onAssignTag={(tagId) => onAssignTodoTag(id, tagId)}
          />
          {/* <NotNowButton onClick={() => onMarkTodoNotNow(todo.id)} /> */}
          <NotTodayButton onClick={() => onMarkTodoNotToday(todo.id)} />
          <AutoRepeatButton
            value={todo.repeatAtEndOfDay}
            onClick={() => onToggleEndOfDayRepeat(todo.id)}
          />
          <TodoDetails todo={todo} onReset={onResetTodoCount} />
        </Card>
      )}
    </Box>
  );
};
