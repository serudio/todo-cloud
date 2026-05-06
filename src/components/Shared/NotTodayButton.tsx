import { Button } from "@mui/material";

type Props = {
  onClick: () => void;
};

export function NotTodayButton({ onClick }: Props) {
  return (
    <Button
      onClick={onClick}
      size="small"
      variant="text"
      sx={{ p: 0, minHeight: 22, minWidth: 0, fontWeight: 700, textTransform: "lowercase" }}
    >
      <s>today</s>
    </Button>
  );
}
