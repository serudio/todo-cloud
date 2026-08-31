import { Box, Button, Card, Chip, IconButton } from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import { ThemeSelector } from "./ThemeSelector";
import { signOut } from "../../utils/auth";
import ListIcon from "@mui/icons-material/List";
import TocIcon from "@mui/icons-material/Toc";

type Props = {
  isLoadingTodos: boolean;
  onRefresh: () => void;
  onLeftMenuClick: () => void;
  onRightMenuClick: () => void;
  email?: string;
};

export const Header: React.FC<Props> = ({
  isLoadingTodos,
  onRefresh,
  onLeftMenuClick,
  onRightMenuClick,
  email = "",
}) => {
  return (
    <Card sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", p: 1 }}>
      <Box>
        <Button variant="text" color="secondary" onClick={onLeftMenuClick} sx={{ minWidth: 0 }}>
          <ListIcon />
        </Button>
        <Button disabled={isLoadingTodos} variant="text" color="secondary" onClick={onRefresh} sx={{ minWidth: 0 }}>
          <RefreshRoundedIcon />
        </Button>
      </Box>
      <ThemeSelector />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Chip label={email} size="small" color="secondary" variant="outlined" />
        <IconButton onClick={signOut} size="small" color="secondary">
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>

      <Button variant="text" color="secondary" onClick={onRightMenuClick} sx={{ minWidth: 0 }}>
        <TocIcon />
      </Button>
    </Card>
  );
};
