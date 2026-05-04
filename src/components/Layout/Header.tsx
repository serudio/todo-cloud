import { Box, Button, Card, Chip, IconButton } from "@mui/joy";
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
    <Card
      orientation="horizontal"
      sx={{ alignItems: "center", justifyContent: "space-between" }}
      size="sm"
    >
      <Button
        color="neutral"
        disabled={isLoadingTodos}
        size="sm"
        title="Refresh"
        type="button"
        variant="solid"
        onClick={onRefresh}
      >
        <RefreshRoundedIcon fontSize="small" />
      </Button>
      <ThemeSelector />
      <Box sx={{ display: "flex" }}>
        <Chip>{email}</Chip>
        <IconButton onClick={onSignOut}>
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
};
