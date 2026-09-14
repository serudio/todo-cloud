import { Box, Button, Card, Chip, IconButton, Tooltip } from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import { ThemeSelector } from "./ThemeSelector";
import { signOut } from "../../utils/auth";
import ListIcon from "@mui/icons-material/List";
import TocIcon from "@mui/icons-material/Toc";
import LinkIcon from "@mui/icons-material/Link";
import BalanceIcon from "@mui/icons-material/Balance";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";

type Props = {
  isLoadingTodos: boolean;
  onRefresh: () => void;
  onLeftMenuClick: () => void;
  onRightMenuClick: () => void;
  onTopMenuClick: () => void;
  onListsClick: () => void;
  onPointsClick: () => void;
  isCloudSortedByName: boolean;
  onCloudSortClick: () => void;
  email?: string;
};

export const Header: React.FC<Props> = ({
  isLoadingTodos,
  onRefresh,
  onLeftMenuClick,
  onRightMenuClick,
  onTopMenuClick,
  onListsClick,
  onPointsClick,
  isCloudSortedByName,
  onCloudSortClick,
  email = "",
}) => {
  return (
    <Card sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", p: 1 }}>
      <Button disabled={isLoadingTodos} variant="text" color="secondary" onClick={onRefresh} sx={{ minWidth: 0 }}>
        <RefreshRoundedIcon />
      </Button>

      <Box>
        <Button variant="text" color="secondary" onClick={onTopMenuClick} sx={{ minWidth: 0 }}>
          <LinkIcon />
        </Button>
        <Button variant="text" color="secondary" onClick={onLeftMenuClick} sx={{ minWidth: 0 }}>
          <ListIcon />
        </Button>
        <Tooltip title="Pros and cons lists">
          <Button variant="text" color="secondary" onClick={onListsClick} sx={{ minWidth: 0 }} aria-label="Open lists">
            <BalanceIcon />
          </Button>
        </Tooltip>
        <Tooltip title={isCloudSortedByName ? "Back to the order tasks were added" : "Sort tasks A–Z"}>
          <Button
            variant="text"
            color={isCloudSortedByName ? "warning" : "secondary"}
            onClick={onCloudSortClick}
            sx={{ minWidth: 0 }}
            aria-pressed={isCloudSortedByName}
            aria-label="Sort tasks A to Z"
          >
            <SortByAlphaIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Reward points">
          <Button
            variant="text"
            color="secondary"
            onClick={onPointsClick}
            sx={{ minWidth: 0 }}
            aria-label="Open rewards"
          >
            <EmojiEventsIcon />
          </Button>
        </Tooltip>
        <ThemeSelector />

        <Button variant="text" color="secondary" onClick={onRightMenuClick} sx={{ minWidth: 0 }}>
          <TocIcon />
        </Button>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Chip label={email} size="small" color="secondary" variant="outlined" />
        <IconButton onClick={signOut} size="small" color="secondary">
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
};
