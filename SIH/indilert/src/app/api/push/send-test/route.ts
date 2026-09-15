import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptions, getSubscriptionByEndpoint } from '@/lib/pushSubscriptionStore';
import { sendPushNotification, EmergencyAlertPayload } from '@/lib/webPushServer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const endpoint = body.endpoint;

    let targetSub = endpoint ? getSubscriptionByEndpoint(endpoint) : null;

    if (!targetSub) {
      const activeList = getSubscriptions(true);
      if (activeList.length > 0) {
        // Fallback to the most recent active subscription
        targetSub = activeList[activeList.length - 1];
      }
    }

    if (!targetSub || !targetSub.active) {
      return NextResponse.json(
        { error: 'No active push subscription found for this device. Please enable alerts first.' },
        { status: 404 }
      );
    }

    const testPayload: EmergencyAlertPayload = {
      id: `test_${Date.now()}`,
      title: '🔔 INDILERT Push Test',
      body: 'Verification test: Browser Web Push receiving and background alerts are functioning properly.',
      severity: 'HIGH',
      type: 'SYSTEM_TEST',
      area: 'Local Device Verification',
      url: '/warnings',
      issuedAt: new Date().toISOString(),
      actionRequired: 'No action required. This is a system verification test.',
    };

    const result = await sendPushNotification(
      { endpoint: targetSub.endpoint, p256dh: targetSub.p256dh, auth: targetSub.auth },
      testPayload
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to dispatch test notification to push service' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test notification successfully dispatched via Web Push service',
      alertId: testPayload.id,
    });
  } catch (err: any) {
    console.error('[API /api/push/send-test] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error while dispatching test push' },
      { status: 500 }
    );
  }
}
