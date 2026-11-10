import { Box, Chip, Typography } from "@mui/material";
import type { Todo } from "../../types/todo";
import { getTodosWithNotTodayReleased, markTodoNow } from "../../utils/todos";

type Props = {
  // Only the tasks hidden for today; the full list is needed to save them back.
  todos: Todo[];
  allTodos: Todo[];
  updateTodo: (todo: Todo) => void;
  updateTodos: (todos: Todo[]) => void;
};

// A band across the top of the card rather than chips floating over the tiles:
// these tasks are still here, but they are not part of today's cloud.
export const NotTodayList: React.FC<Props> = ({ todos, allTodos, updateTodo, updateTodos }) => {
  const handleClick = (id: string) => () => {
    const newTodo = todos.find((x) => x.id === id);
    if (!newTodo) return;

    updateTodo(markTodoNow(newTodo));
  };

  const handleBringAllBack = () =>
    updateTodos(
      getTodosWithNotTodayReleased(
        allTodos,
        todos.map((todo) => todo.id),
      ),
    );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        flexWrap: "wrap",
        px: 1,
        py: 0.5,
        borderBottom: 1,
        borderColor: "divider",
        backgroundColor: "action.hover",
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5, flexShrink: 0 }}>
        not today
      </Typography>

      {todos.map((todo) => (
        <Chip
          key={todo.id}
          onClick={handleClick(todo.id)}
          size="small"
          variant="outlined"
          label={todo.text}
          sx={{ height: 18, fontSize: 11 }}
        />
      ))}

      {todos.length > 1 && (
        <Chip
          onClick={handleBringAllBack}
          size="small"
          color="warning"
          variant="filled"
          label="all back"
          sx={{ height: 18, fontSize: 11, ml: "auto" }}
        />
      )}
    </Box>
  );
};
