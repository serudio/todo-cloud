import type { Todo, TodoTag } from "../types/todo";
import { formatDateKey } from "../utils/todos";
import { Panel } from "./Shared/Panel";
import { PanelHeader } from "./Shared/PanelHeader";
import { TagPicker } from "./Shared/TagPicker";
import { useMobileCollapsedState } from "./Shared/useMobileCollapsedState";
import "./DoneList.css";

type DoneListProps = {
  todos: Todo[];
  tags: TodoTag[];
  onAddTodoText: (text: string) => void;
  onAssignTodoTag: (id: string, tagId: string | null) => void;
  onDeleteTodo: (id: string) => void;
  onResetTodoCount: (id: string) => void;
  onToggleEndOfDayRepeat: (id: string) => void;
};

export function DoneList({
  todos,
  tags,
  onAddTodoText,
  onAssignTodoTag,
  onDeleteTodo,
  onResetTodoCount,
  onToggleEndOfDayRepeat,
}: DoneListProps) {
  const [isCollapsed, setIsCollapsed] = useMobileCollapsedState();

  function assignTodoTag(todoId: string, tagId: string | null) {
    onAssignTodoTag(todoId, tagId);
  }

  return (
    <Panel className="done">
      <PanelHeader onClick={() => setIsCollapsed((current) => !current)}>
        done
      </PanelHeader>
      {!isCollapsed && (
        <>
          {todos.length === 0 ? (
            <p className="status">Done items will show up here.</p>
          ) : (
            <ol className="suggestion-list">
              {todos.map((todo) => {
                return (
                  <li key={todo.id}>
                    <span className="item-text-control">
                      <TagPicker
                        selectedTagId={todo.tagId}
                        tags={tags}
                        onAssignTag={(tagId) => assignTodoTag(todo.id, tagId)}
                      />
                      <button
                        className="suggestion-add"
                        type="button"
                        onClick={() => onAddTodoText(todo.text)}
                      >
                        <span>{todo.text}</span>
                      </button>
                      <span className="count-anchor">
                        <span
                          className="count"
                          title={`Added ${todo.count} ${todo.count === 1 ? "time" : "times"}`}
                        >
                          {todo.count}
                        </span>
                        <span className="count-popover">
                          <span className="count-popover-title">Count</span>
                          <button
                            type="button"
                            onClick={() => onResetTodoCount(todo.id)}
                          >
                            Reset to 0
                          </button>
                        </span>
                      </span>
                    </span>
                    <button
                      aria-pressed={todo.repeatAtEndOfDay}
                      className="suggestion-repeat"
                      title="Add again at midnight"
                      type="button"
                      onClick={() => onToggleEndOfDayRepeat(todo.id)}
                    >
                      <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
                        <path d="M15.8 5.4A6.7 6.7 0 0 0 4.4 4.1l1.2 1.2a5 5 0 0 1 8.9 2.9H12l3.6 3.6 3.6-3.6h-2.9a6.7 6.7 0 0 0-.5-2.8ZM4.2 14.6a6.7 6.7 0 0 0 11.4 1.3l-1.2-1.2a5 5 0 0 1-8.9-2.9H8L4.4 8.2.8 11.8h2.9c0 1 .2 1.9.5 2.8Z" />
                      </svg>
                    </button>
                    <span className="details-anchor">
                      <span className="suggestion-details">
                        i
                      </span>
                      <span className="todo-details-popover">
                        <span className="todo-details-title">Last added</span>
                        <span>{formatDateKey(todo.lastAddedDate)}</span>
                      </span>
                    </span>
                    <button
                      className="delete"
                      type="button"
                      onClick={() => onDeleteTodo(todo.id)}
                    >
                      x
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </>
      )}
    </Panel>
  );
}
