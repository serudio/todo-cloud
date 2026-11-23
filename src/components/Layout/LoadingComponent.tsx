import { MODAL_Z } from "../../constants/ui";
import { Backdrop, CircularProgress } from "@mui/material";

type Props = {
  loading: boolean;
  // Reloading a list that is already on screen: nothing dimmed and no spinner
  // (the bar at the top says it), but taps still wait, so a change cannot be
  // made to the copy that is about to be replaced.
  isQuiet?: boolean;
};

export const LoadingComponent: React.FC<Props> = ({ loading, isQuiet = false }) => {
  return (
    <Backdrop
      open={loading}
      transitionDuration={isQuiet ? 0 : undefined}
      sx={{ zIndex: MODAL_Z, ...(isQuiet && { backgroundColor: "transparent" }) }}
    >
      {!isQuiet && <CircularProgress />}
    </Backdrop>
  );
};
