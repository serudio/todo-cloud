import type { Notification } from "../../types/notification";
import "./AppState.css";

type NotificationToastProps = {
  notification: Notification | null;
};

export function NotificationToast({ notification }: NotificationToastProps) {
  if (!notification) return null;

  return (
    <div className="notification">
      {notification.message}
    </div>
  );
}
