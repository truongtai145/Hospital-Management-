import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

let echoInstance = null;

// Lấy env theo chuẩn Vite
const API_URL = import.meta.env.VITE_API_URL;
const PUSHER_KEY = import.meta.env.VITE_PUSHER_APP_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_APP_CLUSTER || "mt1";

export const initializeEcho = () => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    console.warn("No access token found for Echo");
    return null;
  }

  if (echoInstance) {
    return echoInstance;
  }

  if (!API_URL || !PUSHER_KEY) {
    console.error("Echo config missing VITE_API_URL or VITE_PUSHER_APP_KEY");
    return null;
  }

  echoInstance = new Echo({
    broadcaster: "pusher",
    key: PUSHER_KEY,
    cluster: PUSHER_CLUSTER,
    forceTLS: true,
    encrypted: true,
    authEndpoint: `${API_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  });

  return echoInstance;
};

export const getEcho = () => {
  if (!echoInstance) {
    return initializeEcho();
  }
  return echoInstance;
};

export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
};