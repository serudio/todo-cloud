import { Box, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

type Props = {
  title: string;
  onClick?: () => void;
  onActionButtonClick?: () => void;
};
export const SectionHeader: React.FC<Props> = ({ title, onClick, onActionButtonClick }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Typography
        variant="subtitle2"
        onClick={onClick}
        color="warning"
        sx={{ textTransform: "uppercase", letterSpacing: 2, cursor: "pointer" }}
      >
        {title}
      </Typography>
      {onActionButtonClick && (
        <IconButton onClick={onActionButtonClick}>
          <AddIcon />
        </IconButton>
      )}
    </Box>
  );
};
