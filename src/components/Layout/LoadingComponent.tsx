import { MODAL_Z } from "../../constants/ui";
import { Backdrop, CircularProgress } from "@mui/material";

type Props = {
  loading: boolean;
};

export const LoadingComponent: React.FC<Props> = ({ loading }) => {
  return (
    // In at once: the page stops taking input the moment loading starts, so it
    // should look it, rather than fade in over a page that already is not answering.
    <Backdrop open={loading} transitionDuration={{ enter: 0, exit: 200 }} sx={{ zIndex: MODAL_Z }}>
      <CircularProgress />
    </Backdrop>
  );
};
