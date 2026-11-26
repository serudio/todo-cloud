import { useState } from "react";
import { Box, Chip, Typography } from "@mui/material";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import type { Todo } from "../../types/todo";
import { getTodosWithNotTodayReleased, markTodoNow } from "../../utils/todos";
import { isWeeklyTodo } from "../../utils/weekly";
import { useHiddenPastFirstRow } from "../../hooks/firstRow";
import { CLOUD_ITEM_FONT_SIZE, CLOUD_ITEM_HEIGHT } from "../../constants/ui";

// The same height and type as the tiles on the cloud below.
const chipSx = { height: CLOUD_ITEM_HEIGHT, fontSize: CLOUD_ITEM_FONT_SIZE, borderRadius: 999 };

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

  // One row of chips unless asked for the rest: these are set aside for today,
  // and a long list of them pushed today's cloud down the page.
  const [isExpanded, setIsExpanded] = useState(false);
  const { ref: chipsRef, hiddenCount } = useHiddenPastFirstRow<HTMLDivElement>(todos);

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
        // The label and the buttons stay on the first row; the chips wrap
        // between them when the list is opened.
        alignItems: "flex-start",
        gap: 0.5,
        px: 1,
        py: 0.5,
        borderBottom: 1,
        borderColor: "divider",
        backgroundColor: "action.hover",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mr: 0.5, flexShrink: 0, lineHeight: `${CLOUD_ITEM_HEIGHT}px` }}
      >
        not today
      </Typography>

      <Box
        ref={chipsRef}
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexWrap: "wrap",
          gap: 0.5,
          // One chip high, the rest cut off below, until the list is opened.
          maxHeight: isExpanded ? "none" : CLOUD_ITEM_HEIGHT,
          overflow: "hidden",
        }}
      >
        {todos.map((todo) => (
          <Chip
            key={todo.id}
            onClick={handleClick(todo.id)}
            size="small"
            variant="outlined"
            // The week's own are marked here too: set aside for today is a
            // different thing for something the week still wants three more of.
            color={isWeeklyTodo(todo) ? "warning" : "default"}
            icon={isWeeklyTodo(todo) ? <EventRepeatIcon sx={{ fontSize: 16 }} /> : undefined}
            label={todo.text}
            sx={chipSx}
          />
        ))}
      </Box>

      {(hiddenCount > 0 || isExpanded) && (
        <Chip
          onClick={() => setIsExpanded((previous) => !previous)}
          size="small"
          variant="outlined"
          label={isExpanded ? "show less" : `show all · +${hiddenCount}`}
          sx={{ ...chipSx, flexShrink: 0 }}
        />
      )}

      {todos.length > 1 && (
        <Chip
          onClick={handleBringAllBack}
          size="small"
          color="warning"
          variant="filled"
          label="all back"
          sx={{ ...chipSx, flexShrink: 0 }}
        />
      )}
    </Box>
  );
};
