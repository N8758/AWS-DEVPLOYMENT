import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

export const startNotificationListener = () => {
  onMessage(messaging, (payload) => {
    console.log("Notification received:", payload);

    const title =
      payload.notification?.title || "Laundry Update";

    const body =
      payload.notification?.body || "";

    alert(`${title}\n${body}`);
  });
};