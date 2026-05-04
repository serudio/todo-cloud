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
        disaply: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      {todos.map((todo) => (
        <Chip key={todo.id} label={todo.text} onClick={() => onClick(todo.id)}>
          {todo.text}
        </Chip>
      ))}
    </Box>
  );
};
