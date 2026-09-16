import { useMediaQuery, useTheme } from "@mui/material";

// Below this the cloud has no room to breathe and there is no hover to rely on,
// so the todo screen switches to a swipeable list with a tap-opened action sheet.
export function useIsMobile() {
  const theme = useTheme();

  return useMediaQuery(theme.breakpoints.down("md"));
}
