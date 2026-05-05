import { Button } from "@mui/material";

type Props = {
  onClick: () => void;
};

export function NotTodayButton({ onClick }: Props) {
  return (
    <Button onClick={onClick} size="small" variant="outlined" color="inherit" sx={{ p: 0, minHeight: 22, minWidth: 0 }}>
      <s>today</s>
    </Button>
  );
}
