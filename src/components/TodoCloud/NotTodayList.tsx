import { Box, Chip } from "@mui/joy";
import type { Todo } from "../../types/todo";
import { NOT_TODAY_Z } from "../../constants/ui";

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
        zIndex: NOT_TODAY_Z,
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
