import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

let echoInstance = null;

export const initializeEcho = () => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    console.warn('No access token found');
    return null;
  }

  if (echoInstance) {
    return echoInstance;
  }

  echoInstance = new Echo({
    broadcaster: 'pusher',
    // eslint-disable-next-line no-undef
    key: process.env.REACT_APP_PUSHER_APP_KEY,
    // eslint-disable-next-line no-undef
    cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
    forceTLS: true,
    encrypted: true,
    // eslint-disable-next-line no-undef
    authEndpoint: `${process.env.REACT_APP_API_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
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