import type { Todo } from "../../types/todo";
import { formatDateKey } from "../../utils/todos";
import { CountBadge } from "./CountBadge";

type Props = {
  todo: Todo;
  onReset?: (id: string) => void;
};
export const TodoDetails: React.FC<Props> = ({ todo, onReset }) => {
  return (
    <span className="details-anchor">
      <span className="todo-details">i</span>
      <span className="todo-details-popover">
        <span className="todo-details-title">Last added</span>
        <span>{formatDateKey(todo.lastAddedDate)}</span>
        {onReset && (
          <CountBadge count={todo.count} onReset={() => onReset(todo.id)} />
        )}
      </span>
    </span>
  );
};
