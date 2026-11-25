import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: "BLeBN7I-fDLBHlcp72aFtaRflNBHucYe1OUpFCKX0wu9A3rEmr9c8rz3w2feuE_5Ehj2Rvi1E14RbXarT-GLuts",
    });

    console.log("FCM TOKEN:", token);

    return token;
  } catch (error) {
    console.error("FCM Error:", error);
  }
};