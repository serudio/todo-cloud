import { Box, IconButton, Typography } from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";

type Props = {
  title: string;
  onClick?: () => void;
  onActionButtonClick?: () => void;
};
export const SectionHeader: React.FC<Props> = ({
  title,
  onClick,
  onActionButtonClick,
}) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Typography
        level="title-sm"
        onClick={onClick}
        sx={{ textTransform: "uppercase", letterSpacing: 2 }}
        color="warning"
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
