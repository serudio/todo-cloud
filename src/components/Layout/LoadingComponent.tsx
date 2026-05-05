import { Box, CircularProgress } from "@mui/joy";
import { MODAL_Z } from "../../constants/ui";

type Props = {
  loading: boolean;
};

export const LoadingComponent: React.FC<Props> = ({ loading }) => {
  if (!loading) return null;
  return (
    <Box
      sx={{
        zIndex: MODAL_Z,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <CircularProgress />
    </Box>
  );
};
