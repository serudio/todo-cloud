import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { IconButton } from "@astryxdesign/core/IconButton";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { Text } from "@astryxdesign/core/Text";
import { Tooltip } from "@astryxdesign/core/Tooltip";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { Todo } from "../../types/todo";
import { getDoneThisWeek, getWeeklyTarget, isWeeklyDoneToday, WEEKLY_TARGETS } from "../../utils/weekly";

type Props = {
  todo: Todo;
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
          {done}/{target} · not today
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
        onChange={(event) => onChange({ text: event.target.value })}
        onBlur={() => onCommit({ text: todo.text })}
      />

      {/* How often, as the whole range rather than a box to type in: a target
          is set once and is always a single digit. */}
      <div className="weekly-targets">
        <Tooltip content={`${target} ${target === 1 ? "time" : "times"} a week`} hasHoverIndication={false}>
          <SegmentedControl
            size="sm"
            label="Times a week"
            value={String(target)}
            onChange={(value) => onCommit({ weeklyTarget: Number(value) })}
          >
            {WEEKLY_TARGETS.map((chipTarget) => (
              <SegmentedControlItem key={chipTarget} value={String(chipTarget)} label={String(chipTarget)} />
            ))}
          </SegmentedControl>
        </Tooltip>
      </div>

      {/* The phone's line break, between the count and the targets. */}
      <span className="weekly-line-break" />

      <Tooltip content={isDone ? "Done for the week" : `${left} still to go this week`} hasHoverIndication={false}>
        <Text type="supporting" hasTabularNumbers className="weekly-count">
          {done}/{target}
        </Text>
      </Tooltip>

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

      {/* The progress, as a line along the bottom: one segment per time it
          should happen, filled as they are done. */}
      <div className="weekly-progress-line" data-done={isDone} aria-hidden>
        {Array.from({ length: target }, (_unused, index) => (
          <span key={index} data-filled={index < Math.min(done, target)} />
        ))}
      </div>
    </Card>
  );
};
