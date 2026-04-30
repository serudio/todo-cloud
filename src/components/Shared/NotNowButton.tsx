type NotNowButtonProps = {
  todoText: string;
  onClick: () => void;
};

export function NotNowButton({ todoText, onClick }: NotNowButtonProps) {
  return (
    <button
      aria-label={`Move ${todoText} to not now`}
      className="tag-not-now"
      title="Hide from cloud for now"
      type="button"
      onClick={onClick}
    >
      <s>Now</s>
    </button>
  );
}
