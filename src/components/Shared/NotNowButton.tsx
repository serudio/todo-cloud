type NotNowButtonProps = {
  onClick: () => void;
};

export function NotNowButton({ onClick }: NotNowButtonProps) {
  return (
    <button
      className="todo-not-now"
      title="Hide from cloud for now"
      type="button"
      onClick={onClick}
    >
      <s>now</s>
    </button>
  );
}
