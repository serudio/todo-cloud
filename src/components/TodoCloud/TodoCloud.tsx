import type { DragEvent } from "react";
import type { Todo, TodoTag } from "../../types/todo";
import { NotTodayList } from "./NotTodayList";
import { TodoItem } from "./TodoItem";
import { Box, Card } from "@mui/material";
import { LoadingComponent } from "../Layout/LoadingComponent";
import { markTodoNow } from "../../utils/todos";

type TodoCloudProps = {
  todos: Todo[];
  isLoadingTodos: boolean;
  notTodayTodos: Todo[];
  tags: TodoTag[];
  onAssignTodoTag: (id: string, tagId: string | null) => void;
  onEditTodoText: (id: string, nextText: string) => boolean;
  onMarkTodoNotToday: (id: string) => void;
  onResetTodoCount: (id: string) => void;
  onSetTodoDueDate: (id: string, dueDate: number | null) => void;
  onToggleEndOfDayRepeat: (id: string) => void;
  onToggleTodo: (id: string) => void;
  updateTodo: (todo: Todo) => void;
};

export function TodoCloud({
  todos,
  isLoadingTodos,
  notTodayTodos,
  tags,
  onAssignTodoTag,
  onEditTodoText,
  onMarkTodoNotToday,
  onResetTodoCount,
  onSetTodoDueDate,
  onToggleEndOfDayRepeat,
  onToggleTodo,
  updateTodo,
}: TodoCloudProps) {
  const activeTodos = todos.filter((todo) => !todo.done && !todo.notNow && !todo.notToday);
  function handleTodoDragStart(event: DragEvent<HTMLElement>, todoId: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", todoId);
  }

  function handleCloudDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleCloudDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();

    const todoId = event.dataTransfer.getData("text/plain");
    if (todoId) {
      const newTodo = todos.find((x) => x.id === todoId);
      if (!newTodo) return;
      updateTodo(markTodoNow(newTodo));
    }
  }

  return (
    <Card sx={{ flex: 1, position: "relative", display: "flex" }}>
      <LoadingComponent loading={isLoadingTodos} />
      {!isLoadingTodos && notTodayTodos.length > 0 && <NotTodayList todos={notTodayTodos} updateTodo={updateTodo} />}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          alignContent: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          position: "relative",
          minHeight: 300,
          gap: "18px 14px",
          flex: 1,
        }}
        onDragOver={handleCloudDragOver}
        onDrop={handleCloudDrop}
      >
        {!isLoadingTodos && activeTodos.length === 0 && <p className="status">No todos yet. Add the first one.</p>}
        {activeTodos.map((todo, index) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            index={index}
            onToggleTodo={onToggleTodo}
            onAssignTodoTag={onAssignTodoTag}
            onEditTodoText={onEditTodoText}
            onMarkTodoNotToday={onMarkTodoNotToday}
            onSetTodoDueDate={onSetTodoDueDate}
            onToggleEndOfDayRepeat={onToggleEndOfDayRepeat}
            onResetTodoCount={onResetTodoCount}
            handleTodoDragStart={handleTodoDragStart}
            tags={tags}
          />
        ))}
      </Box>
    </Card>
  );
}
