import { NextRequest, NextResponse } from 'next/server';
import { saveSubscription, removeSubscription } from '@/lib/pushSubscriptionStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.subscription) {
      return NextResponse.json(
        { error: 'Missing required subscription payload' },
        { status: 400 }
      );
    }

    const { subscription, region, district, device, user_id } = body;

    if (!subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription structure: endpoint, p256dh, and auth are required' },
        { status: 400 }
      );
    }

    const record = saveSubscription({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      user_id: user_id || null,
      device: device || req.headers.get('user-agent') || null,
      region: region || null,
      district: district || null,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Push subscription registered successfully',
        id: record.id,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[API /api/push/subscribe] Error saving subscription:', err);
    return NextResponse.json(
      { error: 'Internal server error while saving push subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const endpoint = body.endpoint || req.nextUrl.searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Subscription endpoint is required to unsubscribe' },
        { status: 400 }
      );
    }

    const removed = removeSubscription(endpoint);

    return NextResponse.json({
      success: true,
      message: removed ? 'Subscription deactivated successfully' : 'Subscription not found or already inactive',
    });
  } catch (err: any) {
    console.error('[API /api/push/subscribe DELETE] Error removing subscription:', err);
    return NextResponse.json(
      { error: 'Internal server error while removing push subscription' },
      { status: 500 }
    );
  }
}
