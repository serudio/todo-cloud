type NotNowButtonProps = {
  onClick: () => void;
};

export function NotNowButton({ onClick }: NotNowButtonProps) {
  return (
    <button title="Hide from cloud for now" type="button" onClick={onClick}>
      <s>now</s>
    </button>
  );
}
