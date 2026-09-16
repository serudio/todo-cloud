import { Box, Button, Card, Chip, IconButton, InputBase, Tooltip } from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import { ThemeSelector } from "./ThemeSelector";
import { signOut } from "../../utils/auth";
import { HeaderMenu } from "./HeaderMenu";
import { getAbsoluteUrl, pointsPath } from "../../hooks/route";
import { useIsMobile } from "../../hooks/mobile";
import ListIcon from "@mui/icons-material/List";
import TocIcon from "@mui/icons-material/Toc";
import LinkIcon from "@mui/icons-material/Link";
import BalanceIcon from "@mui/icons-material/Balance";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

type Props = {
  isLoadingTodos: boolean;
  onRefresh: () => void;
  onLeftMenuClick: () => void;
  onRightMenuClick: () => void;
  onTopMenuClick: () => void;
  onListsClick: () => void;
  isCloudSortedByName: boolean;
  onCloudSortClick: () => void;
  search: string;
  onSearchChange: (search: string) => void;
  email?: string;
};

export const Header: React.FC<Props> = ({
  isLoadingTodos,
  onRefresh,
  onLeftMenuClick,
  onRightMenuClick,
  onTopMenuClick,
  onListsClick,
  isCloudSortedByName,
  onCloudSortClick,
  search,
  onSearchChange,
  email = "",
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Card sx={{ display: "flex", alignItems: "center", gap: 0.5, p: 0.5 }}>
        <Button
          disabled={isLoadingTodos}
          variant="text"
          color="secondary"
          onClick={onRefresh}
          sx={{ minWidth: 0, px: 1 }}
          aria-label="Refresh"
        >
          <RefreshRoundedIcon />
        </Button>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            flex: 1,
            minWidth: 0,
            borderRadius: 999,
            border: 1,
            borderColor: search ? "warning.main" : "divider",
          }}
        >
          <SearchIcon fontSize="small" color="disabled" />
          <InputBase
            value={search}
            placeholder="search"
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => event.key === "Escape" && onSearchChange("")}
            slotProps={{ input: { "aria-label": "Search tasks" } }}
            sx={{ flex: 1, minWidth: 0, fontSize: "0.85rem", "& input": { padding: "2px 0" } }}
          />
          {search && (
            <IconButton size="small" onClick={() => onSearchChange("")} aria-label="Clear search" sx={{ padding: 0 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Tooltip title="Tags, links, not now">
          <IconButton color="secondary" onClick={onLeftMenuClick} aria-label="Tags, links and not now">
            <ListIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Done and deleted">
          <IconButton color="secondary" onClick={onRightMenuClick} aria-label="Done and deleted">
            <TocIcon />
          </IconButton>
        </Tooltip>

        <HeaderMenu
          isCloudSortedByName={isCloudSortedByName}
          onCloudSortClick={onCloudSortClick}
          onTopMenuClick={onTopMenuClick}
          onListsClick={onListsClick}
        />
      </Card>
    );
  }

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: { xs: "wrap", md: "nowrap" },
        gap: 0.5,
        p: 1,
      }}
    >
      <Button disabled={isLoadingTodos} variant="text" color="secondary" onClick={onRefresh} sx={{ minWidth: 0 }}>
        <RefreshRoundedIcon />
      </Button>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          px: 1,
          borderRadius: 999,
          border: 1,
          borderColor: search ? "warning.main" : "divider",
          width: { xs: "100%", md: 190 },
          order: { xs: 3, md: 0 },
        }}
      >
        <SearchIcon fontSize="small" color="disabled" />
        <InputBase
          value={search}
          placeholder="search tasks"
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => event.key === "Escape" && onSearchChange("")}
          slotProps={{ input: { "aria-label": "Search tasks" } }}
          sx={{ flex: 1, fontSize: "0.85rem", "& input": { padding: "2px 0" } }}
        />
        {search && (
          <IconButton size="small" onClick={() => onSearchChange("")} aria-label="Clear search" sx={{ padding: 0 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        <Button variant="text" color="secondary" onClick={onTopMenuClick} sx={{ minWidth: 0 }}>
          <LinkIcon />
        </Button>
        <Button variant="text" color="secondary" onClick={onLeftMenuClick} sx={{ minWidth: 0 }}>
          <ListIcon />
        </Button>
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
        <Tooltip title="Pros and cons lists">
          <Button variant="text" color="secondary" onClick={onListsClick} sx={{ minWidth: 0 }} aria-label="Open lists">
            <BalanceIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Reward points (opens a new tab)">
          <Button
            variant="text"
            color="secondary"
            component="a"
            href={getAbsoluteUrl(pointsPath)}
            target="_blank"
            rel="noreferrer"
            sx={{ minWidth: 0 }}
            aria-label="Open rewards in a new tab"
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
        <Chip
          label={email}
          size="small"
          color="secondary"
          variant="outlined"
          sx={{ display: { xs: "none", lg: "flex" } }}
        />
        <IconButton onClick={signOut} size="small" color="secondary">
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
};
