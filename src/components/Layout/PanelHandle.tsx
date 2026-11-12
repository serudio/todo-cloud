import { Box, IconButton, Tooltip } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { SIDE_PANEL_WIDTH } from "../../constants/ui";

type Props = {
  side: "left" | "right";
  isOpen: boolean;
  onToggle: () => void;
};

// The panel's own padding, between its cards and its edge. The strip that
// listens for the pointer is exactly that band, so it never sits over a link,
// a task, or the tasks on the other side of the seam.
const SEAM_STRIP = 9;

// How far the button leans out of that band, towards the tasks. It only leans
// while it is visible, and by then the pointer is already on it.
const BUTTON_OVERHANG = 8;

/**
 * The seam between a side panel and the tasks, and the way to close it.
 *
 * The button is where the panel actually meets the page rather than up in the
 * header, so closing one is a move towards the thing being closed. It appears
 * under the pointer and is untouchable until then — a chevron sitting in the
 * gap all day is one more thing to look past, and one that quietly ate clicks
 * meant for the page underneath would be worse. The header buttons stay for
 * anyone who never finds this.
 *
 * The panels are drawers pinned to the window, so this is pinned too: it
 * follows the edge out and back, and holds still while the page scrolls.
 */
export const PanelHandle: React.FC<Props> = ({ side, isOpen, onToggle }) => {
  // Points at where the panel is going: in to close it, back out to bring it
  // again, so the arrow always says what the click will do.
  const pointsLeft = side === "left" ? isOpen : !isOpen;
  const label = `${isOpen ? "Hide" : "Show"} the ${side} panel`;

  return (
    <Box
      sx={{
        // A phone has no room for a seam, and its panels are overlays that are
        // dismissed by tapping away from them.
        display: { xs: "none", md: "block" },
        position: "fixed",
        top: 0,
        bottom: 0,
        width: SEAM_STRIP,
        // Closed, the panel is gone and the seam is the window's own edge.
        [side]: isOpen ? SIDE_PANEL_WIDTH - SEAM_STRIP : 0,
        transition: (theme) =>
          theme.transitions.create(side, {
            duration: theme.transitions.duration.enteringScreen,
          }),
        zIndex: (theme) => theme.zIndex.drawer + 1,
        // The button hangs out of this band, so it must not be clipped.
        overflow: "visible",
        // A hairline only once the panel is away: open, the drawer's own border
        // is already the seam, and two lines a few pixels apart is just noise.
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          bottom: 0,
          [side]: 0,
          width: "1px",
          bgcolor: "divider",
          opacity: isOpen ? 0 : 0.6,
          transition: "opacity 160ms",
        },
        // Focus as well as hover, so the button can be reached from the keyboard
        // rather than being a thing only a mouse knows about.
        "&:hover .PanelHandle-button, & .PanelHandle-button:focus-visible": {
          opacity: 1,
          pointerEvents: "auto",
        },
      }}
    >
      <Tooltip title={label} placement={side === "left" ? "right" : "left"}>
        <IconButton
          className="PanelHandle-button"
          size="small"
          onClick={onToggle}
          aria-label={label}
          aria-expanded={isOpen}
          sx={{
            position: "absolute",
            top: 8,
            [side]: isOpen ? -BUTTON_OVERHANG : 0,
            padding: 0.25,
            opacity: 0,
            // Nothing underneath loses a click to a button that cannot be seen.
            pointerEvents: "none",
            transition: "opacity 120ms",
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            "&:hover": { bgcolor: "background.paper" },
          }}
        >
          {pointsLeft ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};
