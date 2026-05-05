import { Box, Button, Card, Chip, IconButton } from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import { ThemeSelector } from "./ThemeSelector";

type Props = {
  isLoadingTodos: boolean;
  onRefresh: () => void;
  onSignOut: () => void;
  email?: string;
};

export const Header: React.FC<Props> = ({
  isLoadingTodos,
  onRefresh,
  onSignOut,
  email = "",
}) => {
  return (
    <Card sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", p: 1 }}>
      <Button
        disabled={isLoadingTodos}
        size="small"
        title="Refresh"
        type="button"
        variant="contained"
        onClick={onRefresh}
      >
        <RefreshRoundedIcon fontSize="small" />
      </Button>
      <ThemeSelector />
      <Box sx={{ display: "flex" }}>
        <Chip label={email} size="small" />
        <IconButton onClick={onSignOut} size="small">
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
};
