type CountBadgeProps = {
  count: number;
  label: string;
  onReset: () => void;
};

export function CountBadge({ count, label, onReset }: CountBadgeProps) {
  return (
    <span className="count-anchor">
      <span aria-label={label} className="count" tabIndex={0}>
        {count}
      </span>
      <span className="count-popover" role="status">
        <span className="count-popover-title">Count</span>
        <button type="button" onClick={onReset}>
          Reset to 0
        </button>
      </span>
    </span>
  );
}
