import { useEffect } from 'react';
import api from '../services/api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export function usePushNotifications(user) {
  useEffect(() => {
    if (!user || !('serviceWorker' in navigator) || !('PushManager' in window)) return;

    async function subscribe() {
      try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (existing) return; // already subscribed

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const { data } = await api.get('/notifications/vapid-key');
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(data.publicKey),
        });
        await api.post('/notifications/subscribe', { subscription: sub });
      } catch (err) {
        // silently fail — push notifications are optional
      }
    }

    // Delay to not block initial load
    const t = setTimeout(subscribe, 3000);
    return () => clearTimeout(t);
  }, [user?._id]);
}
