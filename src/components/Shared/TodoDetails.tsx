import type { Todo } from "../../types/todo";
import { formatDateKey } from "../../utils/todos";
import { CountBadge } from "./CountBadge";
import { Tooltip, Box, Typography, IconButton } from "@mui/joy";
import InfoIcon from "@mui/icons-material/Info";

type Props = {
  todo: Todo;
  onReset?: (id: string) => void;
};
export const TodoDetails: React.FC<Props> = ({ todo, onReset }) => {
  return (
    <Tooltip
      title={
        <Box>
          <Typography level="body-sm">
            Last added: {formatDateKey(todo.lastAddedDate)}
          </Typography>

          <CountBadge count={todo.count} onReset={() => onReset?.(todo.id)} />
        </Box>
      }
    >
      <IconButton
        sx={{ padding: 0, width: 22, height: 22, minHeight: 22, minWidth: 22 }}
      >
        <InfoIcon />
      </IconButton>
    </Tooltip>
  );
};
