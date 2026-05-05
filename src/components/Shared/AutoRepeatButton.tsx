import CachedIcon from "@mui/icons-material/Cached";
import { IconButton } from "@mui/material";

type Props = {
  checked: boolean;
  onClick: () => void;
};

export const AutoRepeatButton: React.FC<Props> = ({ checked, onClick }) => {
  return (
    <IconButton
      title="Repeat at midnight"
      onClick={onClick}
      color={checked ? "secondary" : "primary"}
      sx={{ padding: 0, width: 22, height: 22, minHeight: 22, minWidth: 22 }}
      size="small"
    >
      <CachedIcon />
    </IconButton>
  );
};
