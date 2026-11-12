import { Box, Chip, Typography } from "@mui/material";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import type { Todo } from "../../types/todo";
import type { WeeklyActivity } from "../../types/weekly";
import { getTodosWithNotTodayReleased, markTodoNow } from "../../utils/todos";

type Props = {
  // Only the tasks hidden for today; the full list is needed to save them back.
  todos: Todo[];
  allTodos: Todo[];
  updateTodo: (todo: Todo) => void;
  updateTodos: (todos: Todo[]) => void;
  // Quotas set aside for today sit in the same band: they were pushed out of
  // the same cloud, and this is where things pushed out of it wait.
  weeklyActivities: WeeklyActivity[];
  onBringWeeklyBack: (activityId: string) => void;
};

// A band across the top of the card rather than chips floating over the tiles:
// these tasks are still here, but they are not part of today's cloud.
export const NotTodayList: React.FC<Props> = ({
  todos,
  allTodos,
  updateTodo,
  updateTodos,
  weeklyActivities,
  onBringWeeklyBack,
}) => {
  const handleClick = (id: string) => () => {
    const newTodo = todos.find((x) => x.id === id);
    if (!newTodo) return;

    updateTodo(markTodoNow(newTodo));
  };

  const handleBringAllBack = () => {
    updateTodos(
      getTodosWithNotTodayReleased(
        allTodos,
        todos.map((todo) => todo.id),
      ),
    );
    weeklyActivities.forEach((activity) => onBringWeeklyBack(activity.id));
  };

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

      {weeklyActivities.map((activity) => (
        <Chip
          key={activity.id}
          onClick={() => onBringWeeklyBack(activity.id)}
          size="small"
          variant="outlined"
          color="warning"
          icon={<EventRepeatIcon sx={{ fontSize: 12 }} />}
          label={activity.name || "untitled"}
          sx={{ height: 18, fontSize: 11 }}
        />
      ))}

      {todos.length + weeklyActivities.length > 1 && (
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
