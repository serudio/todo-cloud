import { useState } from "react";
import type { Todo } from "../../types/todo";
import { formatDateKey } from "../../utils/todos";
import { CountBadge } from "./CountBadge";
import { Box, IconButton, Popover, Typography } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

type Props = {
  todo: Todo;
  onReset?: (id: string) => void;
};
export const TodoDetails: React.FC<Props> = ({ todo, onReset }) => {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchorElement);

  return (
    <>
      <IconButton
        aria-describedby={isOpen ? `todo-details-${todo.id}` : undefined}
        onClick={(event) => setAnchorElement(event.currentTarget)}
        sx={{ padding: 0, width: 22, height: 22, minHeight: 22, minWidth: 22 }}
      >
        <InfoIcon />
      </IconButton>

      <Popover
        id={`todo-details-${todo.id}`}
        open={isOpen}
        anchorEl={anchorElement}
        onClose={() => setAnchorElement(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="body2">
            Last added: {formatDateKey(todo.lastAddedDate)}
          </Typography>
          <Typography variant="body2">
            Due: {todo.dueDate ? formatDateKey(todo.dueDate) : "not set"}
          </Typography>

          <CountBadge count={todo.count} onReset={() => onReset?.(todo.id)} />
        </Box>
      </Popover>
    </>
  );
};
