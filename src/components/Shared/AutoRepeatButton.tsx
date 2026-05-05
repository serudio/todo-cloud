import CachedIcon from "@mui/icons-material/Cached";
import { IconButton } from "@mui/joy";

type Props = {
  checked: boolean;
  onClick: () => void;
};

export const AutoRepeatButton: React.FC<Props> = ({ checked, onClick }) => {
  console.log({ checked });
  return (
    <IconButton
      title="Repeat at midnight"
      onClick={onClick}
      variant={checked ? "solid" : "outlined"}
      color="warning"
      sx={{ padding: 0, width: 22, height: 22, minHeight: 22, minWidth: 22 }}
      size="sm"
    >
      <CachedIcon />
    </IconButton>
  );
};
