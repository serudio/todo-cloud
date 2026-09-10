import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

type Props = {
  title: string;
  info?: string;
  onClick?: () => void;
  onActionButtonClick?: () => void;
};
export const SectionHeader: React.FC<Props> = ({ title, info, onClick, onActionButtonClick }) => {
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
      {info && (
        <Tooltip title={info} enterTouchDelay={0}>
          <InfoOutlinedIcon fontSize="small" color="disabled" sx={{ mr: "auto", ml: 0.5, cursor: "help" }} />
        </Tooltip>
      )}
      {onActionButtonClick && (
        <IconButton onClick={onActionButtonClick}>
          <AddIcon />
        </IconButton>
      )}
    </Box>
  );
};
