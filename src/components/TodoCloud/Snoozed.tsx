import { Box, Chip } from "@mui/material";
import { NOT_TODAY_Z } from "../../constants/ui";
import type { Todo } from "../../types/todo";

type Props = {
  todos: Todo[];
  updateTodo: (id: string) => void;
};

export const Snoozed: React.FC<Props> = ({ todos, updateTodo }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        position: "absolute",
        bottom: 8,
        left: 8,
        zIndex: NOT_TODAY_Z,
      }}
    >
      {todos.map((todo) => (
        <Chip
          key={todo.id}
          onClick={() => updateTodo(todo.id)}
          size="small"
          variant="outlined"
          label={todo.text}
          sx={{
            background: "rgba(255, 255, 255, 0.5)",
            "&:not(:last-child)": { marginBottom: -2 },
          }}
        />
      ))}
    </Box>
  );
};
