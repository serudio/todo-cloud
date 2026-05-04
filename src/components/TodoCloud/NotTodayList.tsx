import { Box } from "@mui/joy";
import type { Todo } from "../../types/todo";

type Props = {
  todos: Todo[];
  onClick: (id: string) => void;
};

export const NotTodayList: React.FC<Props> = ({ todos, onClick }) => {
  return (
    <Box>
      <div className="not-today-row">
        <ol>
          {todos.map((todo) => (
            <li key={todo.id}>
              <button type="button" onClick={() => onClick(todo.id)}>
                {todo.text}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </Box>
  );
};
