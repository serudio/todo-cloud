import { Slide, Snackbar, type SlideProps } from "@mui/material";

function SnackbarSlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

type Props = {
  notification: string | null;
  onClose: () => void;
};

export const NotificationsToast: React.FC<Props> = ({ notification, onClose }) => {
  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      message={notification}
      open={Boolean(notification)}
      slots={{ transition: SnackbarSlideTransition }}
      onClose={onClose}
      autoHideDuration={3000}
    />
  );
};
