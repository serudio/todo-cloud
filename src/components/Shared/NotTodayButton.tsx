type NotTodayButtonProps = {
  onClick: () => void;
};

export function NotTodayButton({ onClick }: NotTodayButtonProps) {
  return (
    <button
      className="todo-not-today"
      title="Hide from cloud today"
      type="button"
      onClick={onClick}
    >
      <s>today</s>
    </button>
  );
}
