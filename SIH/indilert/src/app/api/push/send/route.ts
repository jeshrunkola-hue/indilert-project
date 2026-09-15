import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptions } from '@/lib/pushSubscriptionStore';
import { sendPushNotification, EmergencyAlertPayload } from '@/lib/webPushServer';

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce Server-to-Server Authentication
    const configuredApiKey = process.env.ALERT_SENDER_API_KEY;
    const authHeader = req.headers.get('authorization');
    const xApiKey = req.headers.get('x-api-key');

    let providedToken: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      providedToken = authHeader.substring(7).trim();
    } else if (xApiKey) {
      providedToken = xApiKey.trim();
    }

    if (!configuredApiKey || !providedToken || providedToken !== configuredApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid emergency alert sender API key is required' },
        { status: 401 }
      );
    }

    // 2. Parse & Validate Emergency Alert Payload
    const body = await req.json();
    if (!body || !body.title || !body.body) {
      return NextResponse.json(
        { error: 'Invalid payload: title and body are required' },
        { status: 400 }
      );
    }

    const alertPayload: EmergencyAlertPayload = {
      id: body.id || `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: body.title,
      body: body.body,
      severity: body.severity || 'HIGH',
      type: body.type || 'EMERGENCY_ALERT',
      area: body.area || 'All Districts',
      url: body.url || '/warnings',
      issuedAt: body.issuedAt || new Date().toISOString(),
      actionRequired: body.actionRequired,
    };

    // 3. Fetch Targeted Push Subscriptions
    const allActive = getSubscriptions(true);
    let targetSubscriptions = allActive;

    // Support optional geographic targeting
    if (body.targetRegion) {
      targetSubscriptions = targetSubscriptions.filter(
        (sub) => !sub.region || sub.region.toLowerCase() === body.targetRegion.toLowerCase()
      );
    }
    if (body.targetDistrict) {
      targetSubscriptions = targetSubscriptions.filter(
        (sub) => !sub.district || sub.district.toLowerCase() === body.targetDistrict.toLowerCase()
      );
    }

    if (targetSubscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active push subscriptions found matching target criteria',
        totalTargeted: 0,
        sent: 0,
        failed: 0,
      });
    }

    // 4. Dispatch Push Notifications
    const results = await Promise.all(
      targetSubscriptions.map((sub) =>
        sendPushNotification(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          alertPayload
        )
      )
    );

    const sentCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Emergency alert dispatched to ${sentCount} device(s)`,
      alertId: alertPayload.id,
      totalTargeted: targetSubscriptions.length,
      sent: sentCount,
      failed: failedCount,
    });
  } catch (err: any) {
    console.error('[API /api/push/send] Error dispatching alerts:', err);
    return NextResponse.json(
      { error: 'Internal server error while dispatching emergency alert' },
      { status: 500 }
    );
  }
}
