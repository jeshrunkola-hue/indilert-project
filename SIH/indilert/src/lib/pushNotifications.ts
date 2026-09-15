// Client-side Web Push notification helpers for Indilert

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushNotificationSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    return registration;
  } catch (err) {
    console.error('[pushNotifications] Service Worker registration failed:', err);
    return null;
  }
}

export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.error('[pushNotifications] Failed to get existing subscription:', err);
    return null;
  }
}

export async function subscribeToPush(): Promise<{
  success: boolean;
  permission: NotificationPermission | 'unsupported';
  subscription?: PushSubscription | null;
  error?: string;
}> {
  if (!isPushNotificationSupported()) {
    return { success: false, permission: 'unsupported', error: 'Push notifications are not supported by this browser.' };
  }

  // Explicit user permission request
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { success: false, permission, error: 'Notification permission was not granted.' };
  }

  try {
    const registration = await registerServiceWorker();
    if (!registration) {
      return { success: false, permission, error: 'Could not register Service Worker.' };
    }

    // Retrieve VAPID public key
    let vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      try {
        const res = await fetch('/api/push/vapid-public-key');
        if (res.ok) {
          const data = await res.json();
          vapidPublicKey = data.publicKey;
        }
      } catch (e) {
        console.warn('[pushNotifications] Could not fetch public key from API endpoint', e);
      }
    }

    if (!vapidPublicKey) {
      return { success: false, permission, error: 'VAPID public key is missing.' };
    }

    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    // Subscribe via PushManager
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any,
      });
    }

    // Send PushSubscription to backend for persistence
    const subJSON = subscription.toJSON();
    const saveRes = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: {
          endpoint: subJSON.endpoint,
          keys: {
            p256dh: subJSON.keys?.p256dh,
            auth: subJSON.keys?.auth,
          },
        },
        device: navigator.userAgent,
      }),
    });

    if (!saveRes.ok) {
      console.warn('[pushNotifications] Server could not save subscription');
    }

    return { success: true, permission, subscription };
  } catch (err: any) {
    console.error('[pushNotifications] Subscribe error:', err);
    return {
      success: false,
      permission,
      error: err?.message || 'Failed to subscribe to Web Push',
    };
  }
}

export async function unsubscribeFromPush(): Promise<{ success: boolean; error?: string }> {
  try {
    const subscription = await getExistingPushSubscription();
    if (subscription) {
      // Notify backend to deactivate subscription
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      }).catch((e) => console.warn('[pushNotifications] Server unsubscribe warning:', e));

      // Unsubscribe from browser push manager
      await subscription.unsubscribe();
    }
    return { success: true };
  } catch (err: any) {
    console.error('[pushNotifications] Unsubscribe error:', err);
    return { success: false, error: err?.message || 'Failed to unsubscribe' };
  }
}

export async function triggerTestNotification(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const subscription = await getExistingPushSubscription();
    const res = await fetch('/api/push/send-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription ? subscription.endpoint : undefined }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to dispatch test notification' };
    }
    return { success: true, message: data.message };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error while triggering test' };
  }
}

// Local storage helpers for received emergency alerts
const STORAGE_KEY_ALERTS = 'indilert_received_alerts';

export interface StoredEmergencyAlert {
  id: string;
  title: string;
  body: string;
  severity: string;
  type: string;
  area: string;
  url: string;
  issuedAt: string;
}

export function saveReceivedAlert(alert: StoredEmergencyAlert): void {
  if (typeof window === 'undefined') return;
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY_ALERTS);
    const list: StoredEmergencyAlert[] = existingRaw ? JSON.parse(existingRaw) : [];
    // Avoid duplicates
    if (!list.some((a) => a.id === alert.id)) {
      list.unshift(alert);
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(list.slice(0, 10)));
      window.dispatchEvent(new CustomEvent('indilert_alert_updated', { detail: alert }));
    }
  } catch (e) {
    console.warn('[pushNotifications] Failed to save alert to localStorage', e);
  }
}

export function getReceivedAlerts(): StoredEmergencyAlert[] {
  if (typeof window === 'undefined') return [];
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY_ALERTS);
    return existingRaw ? JSON.parse(existingRaw) : [];
  } catch (e) {
    return [];
  }
}
