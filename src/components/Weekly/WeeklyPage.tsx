import { useState } from "react";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Spinner } from "@astryxdesign/core/Spinner";
import { Text } from "@astryxdesign/core/Text";
import { ArrowLeft, Plus, RefreshCw, Settings } from "lucide-react";
import type { Todo } from "../../types/todo";
import { navigate, todosPath } from "../../hooks/route";
import { GOALS_URL, HUNDRED_TODO_URL, SPORT_URL } from "../../constants/ui";
import { markTodoBackToday, markTodoNotToday } from "../../utils/todos";
import {
  DEFAULT_WEEKLY_TARGET,
  formatWeekRange,
  getDaysLeftInWeek,
  getNewWeeklyTodo,
  getWeeklyTodos,
  getWeekStart,
  getWeeklyGroup,
  isWeeklyNotToday,
  WEEKLY_GROUPS,
  type WeeklyGroup,
  markWeeklyDone,
  sortWeeklyByRemaining,
  undoWeeklyDone,
} from "../../utils/weekly";
import { WeeklyActivityCard } from "./WeeklyActivityCard";
import { WeeklyTotalsCard } from "./WeeklyTotalsCard";
import "./weekly.css";

const GROUP_TITLES: Record<WeeklyGroup, string> = {
  owed: "to do",
  doneToday: "done today",
  notToday: "not today",
  doneForWeek: "done this week",
};

// Dealt with for now — counted today, put off for today, or finished for the
// week: shown in their own column on the right of a wide screen, so the left
// is only what is still to do.
const SIDE_GROUPS = new Set<WeeklyGroup>(["doneToday", "notToday", "doneForWeek"]);

type Props = {
  // The whole list, because a weekly task is a task: it is in there with the
  // rest of them, and the cloud is counting against the same rows.
  todos: Todo[];
  isLoadingTodos: boolean;
  applyToTodo: (todoId: string, change: (todo: Todo) => Todo) => void;
  addTodo: (todo: Todo) => void;
  deleteTodo: (todoId: string) => void;
  onSettingsClick: () => void;
  onRefresh: () => void;
};

/**
 * What is owed to the week.
 *
 * Counts come back every Monday and nothing carries over: a week that went
 * badly is over, not a debt. The point is to pace the week, and a running
 * total of everything missed since March would only make it a worse place to
 * look.
 */
export const WeeklyPage: React.FC<Props> = ({
  todos,
  isLoadingTodos,
  applyToTodo,
  addTodo,
  deleteTodo,
  onSettingsClick,
  onRefresh,
}) => {
  const [todoPendingDelete, setTodoPendingDelete] = useState<Todo | null>(null);
  // Typing is local until it is committed, so every keystroke is not a write of
  // the whole list; the text in hand wins over the one that came back.
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const daysLeft = getDaysLeftInWeek();
  const weeklyTodos = getWeeklyTodos(todos).map((todo) =>
    drafts[todo.id] === undefined ? todo : { ...todo, text: drafts[todo.id] },
  );
  // Not today ends at midnight, and the app re-renders then on its own, so
  // there is no clock to keep here.
  const shownTodos = sortWeeklyByRemaining(weeklyTodos, Date.now(), { isNotTodayAside: true });
  // Each state under a heading of its own, so where one ends and the next
  // begins is read rather than inferred from colours and folds.
  const groups = WEEKLY_GROUPS.map((group) => ({
    group,
    todos: shownTodos.filter((todo) => getWeeklyGroup(todo) === group),
  })).filter(({ todos: groupTodos }) => groupTodos.length > 0);
  const mainGroups = groups.filter(({ group }) => !SIDE_GROUPS.has(group));
  const sideGroups = groups.filter(({ group }) => SIDE_GROUPS.has(group));

  const handleToggleNotToday = (todoId: string) =>
    applyToTodo(todoId, (todo) => (isWeeklyNotToday(todo) ? markTodoBackToday(todo) : markTodoNotToday(todo)));

  const handleDeleteConfirm = () => {
    if (todoPendingDelete) deleteTodo(todoPendingDelete.id);
    setTodoPendingDelete(null);
  };

  const handleChange = (todoId: string, input: { text?: string; weeklyTarget?: number }) => {
    if (input.text !== undefined) setDrafts((previous) => ({ ...previous, [todoId]: input.text as string }));
  };

  const handleCommit = (todoId: string, input: { text?: string; weeklyTarget?: number }) => {
    applyToTodo(todoId, (todo) => ({
      ...todo,
      ...(input.text === undefined ? {} : { text: input.text.trim() }),
      ...(input.weeklyTarget === undefined ? {} : { weeklyTarget: input.weeklyTarget }),
    }));

    if (input.text === undefined) return;

    setDrafts((previous) => {
      const { [todoId]: _removed, ...rest } = previous;

      return rest;
    });
  };

  const renderGroup = ({ group, todos: groupTodos }: (typeof groups)[number]) => (
    <section key={group} aria-label={GROUP_TITLES[group]} className="weekly-group">
      <div className="weekly-group-heading" data-group={group}>
        {GROUP_TITLES[group]} · {groupTodos.length}
      </div>
      {groupTodos.map((todo) => (
        <WeeklyActivityCard
          key={todo.id}
          todo={todo}
          onChange={(input) => handleChange(todo.id, input)}
          onCommit={(input) => handleCommit(todo.id, input)}
          onCountOne={() => applyToTodo(todo.id, (current) => markWeeklyDone(current))}
          onUndoOne={() => applyToTodo(todo.id, (current) => undoWeeklyDone(current))}
          onDelete={() => setTodoPendingDelete(todo)}
          isNotToday={isWeeklyNotToday(todo)}
          onToggleNotToday={() => handleToggleNotToday(todo.id)}
        />
      ))}
    </section>
  );

  return (
    <div className="weekly-page">
      <header className="weekly-header">
        <IconButton
          variant="ghost"
          label="Back to tasks"
          icon={<ArrowLeft size={18} />}
          onClick={() => navigate(todosPath)}
        />
        <Text weight="semibold" className="weekly-title">
          Weekly
        </Text>
        <Text type="supporting" className="weekly-header-range">
          {formatWeekRange(getWeekStart())} · {daysLeft} {daysLeft === 1 ? "day" : "days"} left
        </Text>

        <nav aria-label="Apps" className="weekly-app-links">
          <Button variant="ghost" size="sm" label="todo cloud" onClick={() => navigate(todosPath)} />
          <Button variant="ghost" size="sm" label="goals" href={GOALS_URL} target="_blank" rel="noreferrer" />
          <Button variant="ghost" size="sm" label="100 todo" href={HUNDRED_TODO_URL} target="_blank" rel="noreferrer" />
          <Button variant="ghost" size="sm" label="sport" href={SPORT_URL} target="_blank" rel="noreferrer" />
        </nav>

        <Button
          size="sm"
          label="Add"
          icon={<Plus size={16} />}
          onClick={() => addTodo(getNewWeeklyTodo(DEFAULT_WEEKLY_TARGET))}
        />
        {/* The same reload as the cloud's: this page reads the same list, and
            a count made on the phone should be one tap away on the laptop. */}
        <IconButton
          variant="ghost"
          size="sm"
          label="Refresh"
          tooltip="Refresh"
          icon={<RefreshCw size={16} />}
          isDisabled={isLoadingTodos}
          onClick={onRefresh}
        />
        {/* The theme lives in settings, and this page is somewhere you can end
            up and stay — so it needs the same way in as the cloud has. */}
        <IconButton
          variant="ghost"
          size="sm"
          label="Open settings"
          tooltip="Settings"
          icon={<Settings size={16} />}
          onClick={onSettingsClick}
        />
      </header>

      {isLoadingTodos && <Spinner size="lg" />}

      {!isLoadingTodos && !weeklyTodos.length && (
        <Text>
          Things you owe the week rather than a day — read five times, yoga twice. Counts start again every Monday.
        </Text>
      )}

      {/* The week as one line, before the things it is made of: whether this
          week is on track is the question the page is opened to answer. */}
      {weeklyTodos.length > 0 && <WeeklyTotalsCard todos={weeklyTodos} daysLeft={daysLeft} />}

      {/* Each state under a heading of its own. On a wide screen what is
          still to do keeps the left, and everything dealt with for now moves
          to a column on the right. */}
      <div className="weekly-columns" data-split={mainGroups.length > 0 && sideGroups.length > 0}>
        {mainGroups.length > 0 && <div className="weekly-groups">{mainGroups.map(renderGroup)}</div>}
        {sideGroups.length > 0 && <div className="weekly-groups">{sideGroups.map(renderGroup)}</div>}
      </div>

      <AlertDialog
        isOpen={Boolean(todoPendingDelete)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setTodoPendingDelete(null);
        }}
        title="Remove this?"
        description={`"${todoPendingDelete?.text || "Untitled"}" and everything counted against it will be gone.`}
        actionLabel="Remove"
        onAction={handleDeleteConfirm}
      />
    </div>
  );
};
