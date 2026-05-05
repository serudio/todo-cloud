import { MODAL_Z } from "../../constants/ui";
import { Backdrop, CircularProgress } from "@mui/material";

type Props = {
  loading: boolean;
};

export const LoadingComponent: React.FC<Props> = ({ loading }) => {
  return (
    <Backdrop open={loading} sx={{ zIndex: MODAL_Z }}>
      <CircularProgress />
    </Backdrop>
  );
};
