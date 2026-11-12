import { Box, Chip } from "@mui/material";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import { NOT_TODAY_Z } from "../../constants/ui";
import type { Todo } from "../../types/todo";
import type { WeeklyActivity } from "../../types/weekly";

type Props = {
  todos: Todo[];
  updateTodo: (id: string) => void;
  // A snoozed quota waits in the same corner as a snoozed task, and a click
  // wakes it the same way.
  weeklyActivities: WeeklyActivity[];
  onWakeWeekly: (activityId: string) => void;
};

export const Snoozed: React.FC<Props> = ({ todos, updateTodo, weeklyActivities, onWakeWeekly }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        position: "absolute",
        bottom: 8,
        left: 8,
        zIndex: NOT_TODAY_Z,
      }}
    >
      {todos.map((todo) => (
        <Chip
          key={todo.id}
          onClick={() => updateTodo(todo.id)}
          size="small"
          variant="outlined"
          label={todo.text}
          sx={{
            justifyContent: "flex-start",
            background: "rgba(0, 0, 0, 0.5)",
            "&:not(:last-child)": { marginBottom: -2 },
            maxWidth: 150,
          }}
        />
      ))}

      {weeklyActivities.map((activity) => (
        <Chip
          key={activity.id}
          onClick={() => onWakeWeekly(activity.id)}
          size="small"
          variant="outlined"
          color="warning"
          icon={<EventRepeatIcon sx={{ fontSize: 14 }} />}
          label={activity.name || "untitled"}
          sx={{
            justifyContent: "flex-start",
            background: "rgba(0, 0, 0, 0.5)",
            "&:not(:last-child)": { marginBottom: -2 },
            maxWidth: 150,
          }}
        />
      ))}
    </Box>
  );
};
