import { useEffect, useState } from "react";
import { Box, Button, Divider, Drawer, InputBase, Typography } from "@mui/material";
import type { Todo, TodoTag } from "../../types/todo";
import { markTodoDone, markTodoNotNow, normalizeTodoText, shouldHighlightDueDate } from "../../utils/todos";
import { TodoActionControls } from "./TodoActionControls";

type Props = {
  todo: Todo | null;
  tags: TodoTag[];
  isSnoozed: boolean;
  updateTodo: (todo: Todo) => void;
  onToggleSnooze: (todoId: string) => void;
  onDelete: (todoId: string) => void;
  onClose: () => void;
};

// Everything the desktop hover card offers, reachable by tapping a row, plus the
// actions a cloud tile handles by click or drag and which touch cannot reproduce.
export const TodoActionSheet: React.FC<Props> = ({
  todo,
  tags,
  isSnoozed,
  updateTodo,
  onToggleSnooze,
  onDelete,
  onClose,
}) => {
  const [editText, setEditText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsEditing(false);
    setEditText(todo?.text ?? "");
  }, [todo?.id, todo?.text]);

  const closeAfter = (action: () => void) => () => {
    action();
    onClose();
  };

  const saveText = () => {
    if (!todo) return;

    const trimmedText = normalizeTodoText(editText);

    if (trimmedText && trimmedText !== todo.text) updateTodo({ ...todo, text: trimmedText });

    setIsEditing(false);
  };

  return (
    <Drawer anchor="bottom" open={Boolean(todo)} onClose={onClose}>
      {todo && (
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {isEditing ? (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <InputBase
                autoFocus
                fullWidth
                value={editText}
                onChange={(event) => setEditText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    saveText();
                  }

                  if (event.key === "Escape") setIsEditing(false);
                }}
                sx={{ border: 1, borderColor: "divider", borderRadius: 1, px: 1, py: 0.5 }}
              />
              <Button size="small" onClick={saveText}>
                save
              </Button>
            </Box>
          ) : (
            <Typography sx={{ fontWeight: 500, wordBreak: "break-word" }} onClick={() => setIsEditing(true)}>
              {todo.text}
            </Typography>
          )}

          <Divider />

          <TodoActionControls
            todo={todo}
            tags={tags}
            isDayBeforeDueDate={shouldHighlightDueDate(todo.dueDate)}
            isSnoozed={isSnoozed}
            updateTodo={updateTodo}
            onToggleSnooze={() => onToggleSnooze(todo.id)}
          />

          <Divider />

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button size="small" variant="outlined" onClick={() => setIsEditing(true)}>
              rename
            </Button>
            <Button size="small" variant="outlined" onClick={closeAfter(() => updateTodo(markTodoNotNow(todo)))}>
              not now
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="success"
              onClick={closeAfter(() => updateTodo(markTodoDone(todo)))}
            >
              done
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={closeAfter(() => onDelete(todo.id))}
              sx={{ ml: "auto" }}
            >
              delete
            </Button>
          </Box>
        </Box>
      )}
    </Drawer>
  );
};
