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
  updateTodo: (todo: Todo) => void;
};

export function TodoCloud({ todos, isLoadingTodos, notTodayTodos, tags, updateTodo }: TodoCloudProps) {
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
          <Box
            key={todo.id}
            sx={{
              display: "inline-flex",
              overflow: "visible",
              // animation: "todo-slide-in 700ms cubic-bezier(0.2, 0.8, 0.2, 1)",
              // "@keyframes todo-slide-in": {
              //   from: {
              //     opacity: 0,
              //     transform: "translate(calc(50vw - 50%), calc(100vh + 100px))",
              //   },
              //   to: {
              //     opacity: 1,
              //     transform: "translateY(0)",
              //   },
              // },
            }}
          >
            <TodoItem
              todo={todo}
              updateTodo={updateTodo}
              index={index}
              handleTodoDragStart={handleTodoDragStart}
              tags={tags}
            />
          </Box>
        ))}
      </Box>
    </Card>
  );
}
