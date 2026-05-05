import { Button } from "@mui/material";

type NotTodayButtonProps = {
  onClick: () => void;
};

export function NotTodayButton({ onClick }: NotTodayButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="small"
      variant="outlined"
      color="inherit"
      sx={{ p: 0, minHeight: 22, minWidth: 0 }}
    >
      <s>today</s>
    </Button>
  );
}
