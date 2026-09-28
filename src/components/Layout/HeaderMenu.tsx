import { useRef, useState } from "react";
import { Box, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LinkIcon from "@mui/icons-material/Link";
import BalanceIcon from "@mui/icons-material/Balance";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import LogoutIcon from "@mui/icons-material/Logout";
import { ThemeSelector } from "./ThemeSelector";
import { signOut } from "../../utils/auth";
import { getAbsoluteUrl, pointsPath } from "../../hooks/route";
import { LinksPopover, type LinksPopoverProps } from "../LinksCard/LinksPopover";

type Props = LinksPopoverProps & {
  isCloudSortedByName: boolean;
  onCloudSortClick: () => void;
  onListsClick: () => void;
};

// On a phone the header cannot hold eight controls and a search box, so everything
// that is not search or refresh moves in here.
export const HeaderMenu: React.FC<Props> = ({ isCloudSortedByName, onCloudSortClick, onListsClick, ...linksProps }) => {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [isLinksOpen, setIsLinksOpen] = useState(false);
  // The menu closes before the popover opens, so the popover hangs off this button
  // rather than off a menu item that is no longer in the document.
  const buttonRef = useRef<HTMLButtonElement>(null);

  const closeAfter = (action: () => void) => () => {
    action();
    setAnchorElement(null);
  };

  const items = [
    { label: "Quick links", icon: <LinkIcon />, onClick: () => setIsLinksOpen(true) },
    {
      label: isCloudSortedByName ? "Original order" : "Sort A–Z",
      icon: <SortByAlphaIcon />,
      onClick: onCloudSortClick,
    },
    { label: "Pros and cons lists", icon: <BalanceIcon />, onClick: onListsClick },
  ];

  return (
    <>
      <IconButton ref={buttonRef} color="secondary" onClick={(event) => setAnchorElement(event.currentTarget)}>
        <MoreVertIcon />
      </IconButton>

      <Menu anchorEl={anchorElement} open={Boolean(anchorElement)} onClose={() => setAnchorElement(null)}>
        {items.map((item) => (
          <MenuItem key={item.label} onClick={closeAfter(item.onClick)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}

        <MenuItem
          component="a"
          href={getAbsoluteUrl(pointsPath)}
          target="_blank"
          rel="noreferrer"
          onClick={() => setAnchorElement(null)}
        >
          <ListItemIcon>
            <EmojiEventsIcon />
          </ListItemIcon>
          <ListItemText>Rewards</ListItemText>
        </MenuItem>

        <Divider />

        <Box sx={{ px: 2, py: 1 }}>
          <ThemeSelector />
        </Box>

        <Divider />

        <MenuItem onClick={closeAfter(signOut)}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText>Sign out</ListItemText>
        </MenuItem>
      </Menu>

      <LinksPopover
        {...linksProps}
        anchorElement={isLinksOpen ? buttonRef.current : null}
        onClose={() => setIsLinksOpen(false)}
      />
    </>
  );
};
