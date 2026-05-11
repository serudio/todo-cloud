import type { Todo, TodoTag } from "../../types/todo";
import { SectionCard } from "../Shared/SectionCard";
import { Box } from "@mui/material";
import { DoneItem } from "./DoneItem";
import { getDoneTodos } from "../../utils/todos";

type DoneListProps = {
  todos: Todo[];

  updateTodo: (todos: Todo) => void;
  tags: TodoTag[];
  onAddTodoText: (text: string) => void;
  onDeleteTodo: (id: string) => void;
};

export const DoneCard: React.FC<DoneListProps> = ({ todos, updateTodo, tags, onAddTodoText, onDeleteTodo }) => {
  const doneTodos = getDoneTodos(todos);

  return (
    <SectionCard title="Done" sx={{ overflow: "auto" }}>
      {doneTodos.length === 0 && <p>Done items will show up here.</p>}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, overflow: "auto" }}>
        {doneTodos.map((todo) => {
          return (
            <DoneItem
              key={todo.id}
              item={todo}
              tags={tags}
              updateTodo={updateTodo}
              onAddTodoText={onAddTodoText}
              onDeleteTodo={onDeleteTodo}
            />
          );
        })}
      </Box>
    </SectionCard>
  );
};
