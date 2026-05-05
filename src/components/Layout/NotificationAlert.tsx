import { Slide, Snackbar, type SlideProps } from "@mui/material";
import type { Notification } from "../../types/notification";

function SnackbarSlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

type Props = {
  notification: Notification | null;
};

export const NotificationsToast: React.FC<Props> = ({ notification }) => {
  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      key={notification?.id}
      message={notification?.message}
      open={Boolean(notification)}
      slots={{ transition: SnackbarSlideTransition }}
    />
  );
};
