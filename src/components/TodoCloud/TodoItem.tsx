import type { CSSProperties } from "react";
import type { Todo, TodoTag } from "../../types/todo";
import { getTodoSize, isStaleTodo } from "../../utils/todos";
import { AutoRepeatButton } from "../Shared/AutoRepeatButton";
import { NotTodayButton } from "../Shared/NotTodayButton";
import { TagPicker } from "../Shared/TagPicker";
import { TodoDetails } from "../Shared/TodoDetails";
import { TodoEditButton } from "../Shared/TodoEditButton";

type Props = {
  todo: Todo;
  editId: string | null;
  index: number;
  onToggleTodo: (id: string) => void;
  onAssignTodoTag: (id: string, tagId: string | null) => void;
  onMarkTodoNotToday: (id: string) => void;
  onToggleEndOfDayRepeat: (id: string) => void;
  onResetTodoCount: (id: string) => void;
  handleEdit: (todo: Todo) => void;
  editInputRef: React.RefObject<HTMLInputElement | null> | null;
  editText: string;
  setEditText: (text: string) => void;
  finishEditing: (todo: Todo) => void;
  handleEditSubmit: (
    event: React.FormEvent<HTMLFormElement>,
    todo: Todo,
  ) => void;
  handleEditKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  handleTodoDragStart: (
    event: React.DragEvent<HTMLElement>,
    todoId: string,
  ) => void;
  tags: TodoTag[];
};

export const TodoItem: React.FC<Props> = ({
  todo,
  editId,
  index,
  onToggleTodo,
  onAssignTodoTag,
  onMarkTodoNotToday,
  onToggleEndOfDayRepeat,
  onResetTodoCount,
  handleEdit,
  editInputRef,
  editText,
  setEditText,
  finishEditing,
  handleEditSubmit,
  handleEditKeyDown,
  handleTodoDragStart,
  tags,
}) => {
  const isEditing = editId === todo.id;
  const isStale = isStaleTodo(todo.lastAddedDate);
  const selectedTag = tags.find((tag) => tag.id === todo.tagId);

  return (
    <span
      className={`todo todo-${getTodoSize(todo.count)}${isEditing ? " editing" : ""}${isStale ? " stale" : ""}`}
      draggable={!isEditing}
      key={todo.id}
      style={
        {
          "--todo-color": selectedTag?.color,
          "--todo-offset": `${index % 5}`,
        } as CSSProperties
      }
      title={`Added ${todo.count} ${todo.count === 1 ? "time" : "times"}`}
      onDragStart={(event) => handleTodoDragStart(event, todo.id)}
    >
      {isEditing ? (
        <form
          className="todo-editor"
          onSubmit={(event) => handleEditSubmit(event, todo)}
        >
          <input
            ref={editInputRef}
            value={editText}
            onBlur={() => finishEditing(todo)}
            onChange={(event) => setEditText(event.target.value)}
            onKeyDown={handleEditKeyDown}
          />
        </form>
      ) : (
        <>
          <span className="item-text-control">
            <button
              className="todo-text"
              type="button"
              onClick={() => onToggleTodo(todo.id)}
            >
              {todo.text}
            </button>
          </span>
          {isStale ? (
            <span className="stale-badge" title="Added at least a month ago">
              STALE
            </span>
          ) : null}
          <span className="todo-actions">
            <TagPicker
              selectedTagId={todo.tagId}
              tags={tags}
              onAssignTag={(tagId) => onAssignTodoTag(todo.id, tagId)}
            />
            <NotTodayButton onClick={() => onMarkTodoNotToday(todo.id)} />
            {/* <NotNowButton onClick={() => onMarkTodoNotNow(todo.id)} /> */}
            <AutoRepeatButton onClick={() => onToggleEndOfDayRepeat(todo.id)} />

            <TodoDetails todo={todo} onReset={onResetTodoCount} />
            {/* <TodoEditButton onClick={() => handleEdit(todo)} /> */}
          </span>
        </>
      )}
      <div className="todo-inline-hover-actions">
        <TodoEditButton onClick={() => handleEdit(todo)} />
      </div>
    </span>
  );
};
