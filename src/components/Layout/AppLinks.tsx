import { Box, Button } from "@mui/material";
import { GOALS_URL, HUNDRED_TODO_URL, SPORT_URL } from "../../constants/ui";
import { navigate, todosPath } from "../../hooks/route";

type Props = {
  /** On the cloud itself its link is the page you are on, so it is marked rather than offered. */
  isOnCloud?: boolean;
};

const linkSx = {
  minWidth: 0,
  px: 0.75,
  py: 0,
  minHeight: 26,
  fontWeight: 700,
  letterSpacing: "1.3px",
  textTransform: "lowercase",
  whiteSpace: "nowrap",
} as const;

/**
 * The everyday tools side by side: this one, and the ones that live on the
 * main site. They are used together through a day, so getting from one to
 * the next should be a tap rather than a bookmark.
 */
export const AppLinks: React.FC<Props> = ({ isOnCloud = false }) => (
  <Box component="nav" aria-label="Apps" sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
    <Button
      size="small"
      color={isOnCloud ? "warning" : "secondary"}
      variant={isOnCloud ? "outlined" : "text"}
      aria-current={isOnCloud ? "page" : undefined}
      onClick={isOnCloud ? undefined : () => navigate(todosPath)}
      sx={linkSx}
    >
      todo cloud
    </Button>
    <Button size="small" color="secondary" component="a" href={GOALS_URL} target="_blank" rel="noreferrer" sx={linkSx}>
      goals
    </Button>
    <Button
      size="small"
      color="secondary"
      component="a"
      href={HUNDRED_TODO_URL}
      target="_blank"
      rel="noreferrer"
      sx={linkSx}
    >
      100 todo
    </Button>
    <Button size="small" color="secondary" component="a" href={SPORT_URL} target="_blank" rel="noreferrer" sx={linkSx}>
      sport
    </Button>
  </Box>
);
