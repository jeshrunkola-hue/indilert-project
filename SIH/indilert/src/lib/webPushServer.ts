import webpush from 'web-push';
import { PushSubscriptionRecord, deactivateSubscription } from './pushSubscriptionStore';

let isConfigured = false;

function ensureVapidConfig(): void {
  if (isConfigured) return;

  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@indilert.org';

  if (!publicKey || !privateKey) {
    console.warn('[webPushServer] VAPID keys not configured in environment variables');
    return;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  isConfigured = true;
}

export interface EmergencyAlertPayload {
  id: string;
  title: string;
  body: string;
  severity?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'EMERGENCY';
  type?: string;
  area?: string;
  url?: string;
  issuedAt?: string;
  actionRequired?: string;
}

export async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: EmergencyAlertPayload
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  ensureVapidConfig();

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  const payloadString = JSON.stringify(payload);

  try {
    const result = await webpush.sendNotification(pushSubscription, payloadString, {
      TTL: 60 * 60 * 24, // 24 hours TTL for emergency notices
      urgency: payload.severity === 'CRITICAL' || payload.severity === 'HIGH' ? 'high' : 'normal',
    });
    return { success: true, statusCode: result.statusCode };
  } catch (err: any) {
    console.error(`[webPushServer] Push send error for ${subscription.endpoint.substring(0, 30)}...:`, err?.message || err);
    
    // HTTP 404 (Not Found) or 410 (Gone) indicates the browser unsubscribed or subscription expired
    if (err?.statusCode === 404 || err?.statusCode === 410) {
      deactivateSubscription(subscription.endpoint);
    }

    return {
      success: false,
      statusCode: err?.statusCode,
      error: err?.message || 'Failed to dispatch push notification',
    };
  }
}
