import "./CountBadge.css";

type CountBadgeProps = {
  count: number;
  onReset: () => void;
};

export function CountBadge({ count, onReset }: CountBadgeProps) {
  return (
    <span className="count-anchor">
      <span className="count">count: {count}</span>
      <span className="count-popover">
        <span className="count-popover-title">Count</span>
        <button type="button" onClick={onReset}>
          Reset to 0
        </button>
      </span>
    </span>
  );
}
