import { Box, Chip } from "@mui/joy";
import type { Todo } from "../../types/todo";

type Props = {
  todos: Todo[];
  onClick: (id: string) => void;
};

export const NotTodayList: React.FC<Props> = ({ todos, onClick }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px 8px",
        position: "absolute",
        top: 8,
        left: 0,
        width: "100%",
        flexWrap: "wrap",
      }}
    >
      {todos.map((todo) => (
        <Chip
          key={todo.id}
          onClick={() => onClick(todo.id)}
          size="sm"
          variant="outlined"
        >
          {todo.text}
        </Chip>
      ))}
    </Box>
  );
};
