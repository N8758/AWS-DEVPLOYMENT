import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCAywcppnwWNMro1KSGa1CJy_AeWX9q8I4",
  authDomain: "laundry-management-b657f.firebaseapp.com",
  projectId: "laundry-management-b657f",
  storageBucket: "laundry-management-b657f.firebasestorage.app",
  messagingSenderId: "567461498436",
  appId: "1:567461498436:web:4ed9db794182078b56f611",
  measurementId: "G-DJCBRLTEVW"
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);

export default app;