import { Box, Chip } from "@mui/joy";
import type { Todo } from "../../types/todo";
import { NOT_TODAY_Z } from "../../constants/ui";
import { markTodoNow } from "../../utils/todos";

type Props = {
  todos: Todo[];
  updateTodo: (todo: Todo) => void;
};

export const NotTodayList: React.FC<Props> = ({ todos, updateTodo }) => {
  const handleClick = (id: string) => () => {
    const newTodo = todos.find((x) => x.id === id);
    if (!newTodo) return;
    updateTodo(markTodoNow(newTodo));
  };
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "4px 8px",
        position: "absolute",
        top: 8,
        left: 8,
        width: "100%",
        flexWrap: "wrap",
        zIndex: NOT_TODAY_Z,
      }}
    >
      {todos.map((todo) => (
        <Chip key={todo.id} onClick={handleClick(todo.id)} size="sm" variant="outlined">
          {todo.text}
        </Chip>
      ))}
    </Box>
  );
};
