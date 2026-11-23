import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Text } from "@astryxdesign/core/Text";
import { Tooltip } from "@astryxdesign/core/Tooltip";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { Todo } from "../../types/todo";
import { getDoneThisWeek, getWeeklyTarget, isWeeklyDoneToday, WEEKLY_TARGETS } from "../../utils/weekly";

type Props = {
  todo: Todo;
  // Just made with Add: the name field takes the cursor.
  isJustAdded?: boolean;
  onChange: (input: { text?: string; weeklyTarget?: number }) => void;
  onCommit: (input: { text?: string; weeklyTarget?: number }) => void;
  onCountOne: () => void;
  onUndoOne: () => void;
  onDelete: () => void;
  isNotToday: boolean;
  onToggleNotToday: () => void;
};

export const WeeklyActivityCard: React.FC<Props> = ({
  todo,
  isJustAdded = false,
  onChange,
  onCommit,
  onCountOne,
  onUndoOne,
  onDelete,
  isNotToday,
  onToggleNotToday,
}) => {
  const done = getDoneThisWeek(todo);
  const target = getWeeklyTarget(todo);
  const left = Math.max(0, target - done);
  const isDone = left === 0;
  const isDoneToday = isWeeklyDoneToday(todo);
  const name = todo.text || "this";

  // Folded to one line for the rest of the day: it is still owed this week, so
  // it stays on the page, but not today, and the targets are the part that
  // takes the room. It unfolds at midnight on its own.
  if (isNotToday) {
    return (
      <Card variant="muted" padding={0} className="weekly-folded">
        <span className="weekly-folded-name">{todo.text || "untitled"}</span>
        <Text type="supporting" textWrap="nowrap">
          not today
        </Text>
        <Button variant="ghost" size="sm" label={`Bring ${name} back for today`} onClick={onToggleNotToday}>
          today
        </Button>
      </Card>
    );
  }

  return (
    <Card padding={0} className="weekly-row" data-done-today={isDoneToday && !isDone}>
      <input
        className="weekly-name"
        value={todo.text}
        placeholder="what, and how often"
        aria-label="Name"
        autoFocus={isJustAdded}
        onChange={(event) => onChange({ text: event.target.value })}
        onBlur={() => onCommit({ text: todo.text })}
      />

      {/* How often, as the whole range rather than a box to type in: a target
          is set once and is always a single digit. */}
      <div className="weekly-targets">
        {/* Plain numbers, with only the chosen one drawn as a filled circle,
            so the target is the one thing the row says loudly. */}
        <div className="weekly-target-numbers" role="radiogroup" aria-label="Times a week">
          {WEEKLY_TARGETS.map((chipTarget) => {
            const isTarget = chipTarget === target;
            const targetLabel = `${chipTarget} ${chipTarget === 1 ? "time" : "times"} a week`;

            return (
              <Tooltip
                key={chipTarget}
                // The count lives here, on hover: the line under the numbers
                // already shows how far along it is.
                content={isTarget ? `${targetLabel} · ${isDone ? "done for the week" : `${left} to go`}` : targetLabel}
                hasHoverIndication={false}
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={isTarget}
                  aria-label={targetLabel}
                  className="weekly-target-number"
                  data-selected={isTarget}
                  data-done={isDone}
                  onClick={() => onCommit({ weeklyTarget: chipTarget })}
                >
                  {chipTarget}
                </button>
              </Tooltip>
            );
          })}
        </div>

        {/* The progress, right under the numbers it counts against: a
            segment under each one up to the target, filled as they are done,
            and nothing under the numbers past it. */}
        <div className="weekly-progress-line" data-done={isDone} aria-hidden>
          {WEEKLY_TARGETS.map((chipTarget) => (
            <span
              key={chipTarget}
              data-in-target={chipTarget <= target}
              data-filled={chipTarget <= Math.min(done, target)}
            />
          ))}
        </div>
      </div>

      {/* The phone's line break, between the count buttons and the targets. */}
      <span className="weekly-line-break" />

      <div className="weekly-actions" data-part="count">
        <IconButton
          variant="ghost"
          size="sm"
          label={`Take one back from ${name}`}
          tooltip="Take the last one back"
          icon={<Minus size={16} />}
          isDisabled={done === 0}
          onClick={onUndoOne}
        />
        <IconButton
          variant={isDone ? "secondary" : "primary"}
          size="sm"
          label={`Count one for ${name}`}
          tooltip="Did it once"
          icon={<Plus size={16} />}
          onClick={onCountOne}
        />
      </div>

      <div className="weekly-actions" data-part="more">
        <Button
          variant="ghost"
          size="sm"
          label={`Not today for ${name}`}
          tooltip="Not today: fold it away until tomorrow"
          onClick={onToggleNotToday}
        >
          <s>today</s>
        </Button>
        <IconButton
          variant="ghost"
          size="sm"
          label={`Remove ${name}`}
          tooltip="Remove this"
          icon={<Trash2 size={16} />}
          onClick={onDelete}
        />
      </div>
    </Card>
  );
};
