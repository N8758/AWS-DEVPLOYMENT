importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCAywcppnwWNMro1KSGa1CJy_AeWX9q8I4",
  authDomain: "laundry-management-b657f.firebaseapp.com",
  projectId: "laundry-management-b657f",
  storageBucket: "laundry-management-b657f.firebasestorage.app",
  messagingSenderId: "567461498436",
  appId: "1:567461498436:web:4ed9db794182078b56f611",
  measurementId: "G-DJCBRLTEVW"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background Message:", payload);

  const notificationTitle =
    payload.notification?.title || "Laundry Update";

  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/logo192.png"
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});