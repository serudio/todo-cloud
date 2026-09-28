import { Popover } from "@mui/material";
import type { CustomLink } from "../../types/todo";
import { LinksCard } from "./LinksCard";

export type LinksPopoverProps = {
  links: CustomLink[];
  updateLinks: (links: CustomLink[]) => void;
  setNotification: (message: string) => void;
  search: string;
};

type Props = LinksPopoverProps & {
  anchorElement: HTMLElement | null;
  onClose: () => void;
};

// Controlled by whichever button opened it, so the same card can hang off the
// header icon on a desktop and off the overflow button on a phone.
export const LinksPopover: React.FC<Props> = ({ anchorElement, onClose, ...linksProps }) => (
  <Popover
    open={Boolean(anchorElement)}
    anchorEl={anchorElement}
    onClose={onClose}
    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    transformOrigin={{ vertical: "top", horizontal: "left" }}
    slotProps={{ paper: { sx: { width: "min(320px, calc(100vw - 24px))" } } }}
    elevation={16}
  >
    <LinksCard hideHeader {...linksProps} />
  </Popover>
);
