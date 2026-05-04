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
    >
      <CachedIcon />
    </IconButton>
  );
};
