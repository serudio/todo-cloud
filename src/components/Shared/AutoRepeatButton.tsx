import CachedIcon from "@mui/icons-material/Cached";
import { IconButton } from "@mui/joy";

type Props = {
  value: boolean;
  onClick: () => void;
};

export const AutoRepeatButton: React.FC<Props> = ({ value, onClick }) => {
  return (
    <IconButton
      title="Repeat at midnight"
      onClick={onClick}
      variant={value ? "plain" : "solid"}
      sx={{ padding: 0, width: 22, height: 22, minHeight: 22, minWidth: 22 }}
      size="sm"
    >
      <CachedIcon />
    </IconButton>
  );
};
