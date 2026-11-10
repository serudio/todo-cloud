import type { DragEvent } from "react";
import { Box, Button, Chip } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import type { Todo, TodoTag } from "../types/todo";
import { SectionCard } from "./Shared/SectionCard";
import { DEFAULT_TAG_COLOR } from "../constants/ui";
import { getWeekTodos } from "../utils/todos";
import { isSearching, matchesSearch } from "../utils/search";

type Props = {
  todos: Todo[];
  tags: TodoTag[];
  search: string;
  onToggleTodo: (todoId: string) => void;
  onMoveAllToMain: () => void;
};

export const ProductiveWeekCard: React.FC<Props> = ({ todos, tags, search, onToggleTodo, onMoveAllToMain }) => {
  const weekTodos = getWeekTodos(todos).filter((todo) => matchesSearch(search, todo.text));

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();

    const todoId = event.dataTransfer.getData("text/plain");
    const droppedTodo = todos.find((todo) => todo.id === todoId);

    if (droppedTodo && !droppedTodo.productiveWeek) onToggleTodo(todoId);
  }

  return (
    <SectionCard
      title="Productive Week"
      collapsed
      expanded={isSearching(search)}
      info="Gather the tasks that keep bothering you. They wait here, out of the cloud, until you have the energy and time — then move the whole pile back at once and work through it."
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Box sx={{ maxHeight: 200, overflow: "auto", display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {!weekTodos.length && !isSearching(search) && <p>Drag the tasks that keep bothering you here.</p>}
        {weekTodos.map((todo) => {
          const color = tags.find((tag) => tag.id === todo.tagId)?.color ?? DEFAULT_TAG_COLOR;

          return (
            <Chip
              key={todo.id}
              label={todo.text}
              size="small"
              variant="outlined"
              onClick={() => onToggleTodo(todo.id)}
              sx={{ color }}
            />
          );
        })}
      </Box>

      {weekTodos.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
          <Button size="small" variant="contained" startIcon={<BoltIcon />} onClick={onMoveAllToMain}>
            let's do them
          </Button>
        </Box>
      )}
    </SectionCard>
  );
};
