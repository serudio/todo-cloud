import { useState } from "react";
import { Button } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import type { Todo } from "../../types/todo";
import { getTodosWithResetCounts } from "../../utils/todos";
import { ConfirmDialog } from "./ConfirmDialog";

type Props = {
  todos: Todo[];
  updateTodos: (todos: Todo[]) => void;
};

export const ResetCountsButton: React.FC<Props> = ({ todos, updateTodos }) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const raisedCount = todos.filter((todo) => todo.count > 1).length;

  const handleConfirm = () => {
    updateTodos(getTodosWithResetCounts(todos));
    setIsConfirming(false);
  };

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        color="secondary"
        startIcon={<RestartAltIcon />}
        disabled={raisedCount === 0}
        onClick={() => setIsConfirming(true)}
      >
        reset counts
      </Button>

      <ConfirmDialog
        open={isConfirming}
        title="Reset every count?"
        message={`${raisedCount} ${raisedCount === 1 ? "task goes" : "tasks go"} back to the smallest size, and how often each one has been added is forgotten.`}
        confirmLabel="Reset"
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirming(false)}
      />
    </>
  );
};
