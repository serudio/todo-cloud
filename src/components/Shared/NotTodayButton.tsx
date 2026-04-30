type NotTodayButtonProps = {
  todoText: string;
  onClick: () => void;
};

export function NotTodayButton({ todoText, onClick }: NotTodayButtonProps) {
  return (
    <button
      aria-label={`Move ${todoText} to not today`}
      className="tag-not-today"
      title="Hide from cloud today"
      type="button"
      onClick={onClick}
    >
      Today
    </button>
  );
}
