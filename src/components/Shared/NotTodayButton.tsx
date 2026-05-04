import { Button } from "@mui/joy";

type NotTodayButtonProps = {
  onClick: () => void;
};

export function NotTodayButton({ onClick }: NotTodayButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="sm"
      variant="neutral"
      sx={{ padding: 0, minHeight: 22 }}
    >
      <s>today</s>
    </Button>
  );
}
