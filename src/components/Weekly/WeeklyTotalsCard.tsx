import { Card } from "@astryxdesign/core/Card";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { Text } from "@astryxdesign/core/Text";
import { Tooltip } from "@astryxdesign/core/Tooltip";
import dayjs from "dayjs";
import type { Todo } from "../../types/todo";
import { getWeekDays, getWeekTotals } from "../../utils/weekly";

type Props = {
  todos: Todo[];
  daysLeft: number;
};

// Monday first, to match the week the counts run on.
const DAY_INITIALS = ["M", "T", "W", "T", "F", "S", "S"];

/**
 * Where the week stands, before the things it is made of.
 *
 * Two readings of the same week, one on top of the other: the card itself is
 * the seven days, tinted where something was counted, and the bar across it
 * is how much of what was asked for is done. The first says how the week has
 * been spread — five things on Sunday is not the same week as one a day — and
 * the second says how much is left.
 */
export const WeeklyTotalsCard: React.FC<Props> = ({ todos, daysLeft }) => {
  const totals = getWeekTotals(todos);
  const weekDays = getWeekDays(todos);

  return (
    <Card padding={3} className="weekly-totals" data-done={totals.isDone}>
      <div className="weekly-totals-days" aria-hidden>
        {weekDays.map((day) => (
          <span key={day.dayStart} data-counted={day.done > 0} data-today={day.isToday} />
        ))}
      </div>

      <div className="weekly-totals-content">
        <div className="weekly-totals-initials">
          {weekDays.map((day, index) => (
            // A box of its own per day: the tooltip wraps its trigger, so the
            // column width has to live on something outside it.
            <div key={day.dayStart} className="weekly-totals-day">
              <Tooltip
                content={`${dayjs(day.dayStart).format("ddd D MMM")} — ${day.done || "nothing"}${day.done ? " counted" : ""}`}
                hasHoverIndication={false}
              >
                <Text
                  type="supporting"
                  color={day.isToday ? "accent" : day.done > 0 ? "primary" : "disabled"}
                  weight={day.isToday ? "semibold" : undefined}
                  justify="center"
                  display="block"
                >
                  {DAY_INITIALS[index]}
                </Text>
              </Tooltip>
            </div>
          ))}
        </div>

        <ProgressBar
          label="This week"
          isLabelHidden
          value={totals.done}
          max={Math.max(totals.target, 1)}
          variant={totals.isDone ? "success" : "warning"}
        />

        <Text type="supporting">
          {totals.done} of {totals.target} this week
          {totals.isDone
            ? " — the whole week is done"
            : ` · ${totals.target - totals.done} to go, ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`}
        </Text>
      </div>
    </Card>
  );
};
