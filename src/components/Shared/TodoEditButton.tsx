import { IconButton } from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";

type Props = {
  onClick: () => void;
};

export const TodoEditButton: React.FC<Props> = ({ onClick }) => {
  return (
    <IconButton
      variant="plain"
      color="neutral"
      size="sm"
      onClick={onClick}
      sx={{
        position: "absolute",
        top: "50%",
        right: -10,
        transform: "translateY(-50%)",
      }}
    >
      <EditIcon fontSize="small" />
    </IconButton>
  );
};
