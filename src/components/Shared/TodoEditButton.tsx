import { Button } from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";

type Props = {
  onClick: () => void;
};

export const TodoEditButton: React.FC<Props> = ({ onClick }) => {
  return (
    <Button
      variant="soft"
      color="neutral"
      size="sm"
      onClick={onClick}
      sx={{
        position: "absolute",
        padding: 0,

        right: -1,

        minHeight: "100%",
        borderTopRightRadius: 999,
        borderBottomRightRadius: 999,
        opacity: 0.8,
        "&:hover": { opacity: 1 },
      }}
    >
      edit
      <EditIcon fontSize="small" />
    </Button>
  );
};
