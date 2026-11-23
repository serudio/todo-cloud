import { LinearProgress } from "@mui/material";
import { MODAL_Z } from "../../constants/ui";
import { useShownAtLeast } from "../../hooks/loading";

type Props = {
  isLoading: boolean;
};

/**
 * A thin bar across the top of the window while the list is being read again.
 *
 * The list stays on screen underneath: it reloads every time the tab comes
 * back, and dimming the whole page for that each time would be a lot of noise
 * for what is usually the same list.
 */
export const RefreshBar: React.FC<Props> = ({ isLoading }) => {
  const isShown = useShownAtLeast(isLoading);

  if (!isShown) return null;

  return (
    <LinearProgress
      color="warning"
      aria-label="Refreshing the list"
      sx={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: MODAL_Z + 1 }}
    />
  );
};
