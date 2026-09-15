"""
Web Push Notification Service for Indilert Citizen Alerts.
Uses standard VAPID authentication and RFC 8291/8292 payloads.
"""
import json
import logging
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from pywebpush import webpush, WebPushException

from app.core.config import settings
from app.models.emergency_alerts import EmergencyAlert, PushSubscription, AlertSeverity
from app.api.websocket import ws_manager

logger = logging.getLogger("webpush")

class WebPushService:
    def __init__(self):
        self.vapid_private_key = settings.VAPID_PRIVATE_KEY
        self.vapid_public_key = settings.VAPID_PUBLIC_KEY
        self.vapid_claims = {
            "sub": settings.VAPID_CLAIMS_EMAIL
        }

    def format_alert_payload(self, alert: EmergencyAlert) -> Dict[str, Any]:
        """Creates standard alert payload for Indilert Service Worker & foreground reception."""
        # Emergency vibration pattern for critical/high alerts
        vibration_pattern = [500, 200, 500, 200, 800] if alert.severity in [AlertSeverity.CRITICAL, AlertSeverity.HIGH] else [300, 100, 300]
        
        # Primary display title
        icon_emoji = "🚨" if alert.severity == AlertSeverity.CRITICAL else "⚠️"
        title = f"{icon_emoji} {alert.severity.value} {alert.type} ALERT: {alert.district.upper()}"
        
        indilert_host = settings.INDILERT_PRODUCTION_URL if (settings.INDILERT_PRODUCTION_URL and "http" in settings.INDILERT_PRODUCTION_URL) else "http://localhost:3000"
        target_url = f"{indilert_host}/?alert_id={alert.id}"
        body = f"{alert.message} Recommended Action: {alert.recommended_action}" if alert.recommended_action else alert.message

        return {
            "title": title,
            "body": body,
            "icon": "/favicon.ico",
            "badge": "/favicon.ico",
            "tag": f"indilert-alert-{alert.id}",
            "requireInteraction": alert.severity == AlertSeverity.CRITICAL,
            "vibrate": vibration_pattern,
            "data": {
                "alertId": alert.id,
                "title": alert.title,
                "message": alert.message,
                "severity": alert.severity.value,
                "type": alert.type,
                "district": alert.district,
                "state": alert.state,
                "latitude": alert.latitude,
                "longitude": alert.longitude,
                "riskScore": alert.risk_score,
                "expectedWindow": alert.expected_window,
                "recommendedAction": alert.recommended_action,
                "issuedAt": alert.issued_at.isoformat() if alert.issued_at else None,
                "expiresAt": alert.expires_at.isoformat() if alert.expires_at else None,
                "source": alert.source,
                "mode": alert.mode.value,
                "translations": alert.translations or {},
                "url": target_url,
                "apiBase": settings.BACKEND_PUBLIC_URL or "http://localhost:8000"
            },
            "actions": [
                {"action": "view", "title": "VIEW ALERT"},
                {"action": "help", "title": "GET HELP"}
            ]
        }

    async def broadcast_emergency_alert(self, alert: EmergencyAlert, db: Session) -> Tuple[int, int]:
        """
        Dispatches emergency alert to:
        1. All matching push subscriptions via Web Push
        2. All active WebSocket clients (foreground instant sync)
        Returns: (total_subscriptions, successful_pushes)
        """
        payload = self.format_alert_payload(alert)
        payload_json = json.dumps(payload)

        # 1. Send via WebSocket for instant foreground updates
        try:
            await ws_manager.broadcast({
                "type": "EMERGENCY_ALERT_BROADCAST",
                "alert": payload["data"],
                "notification": payload
            })
            logger.info("Broadcast alert %s over WebSocket to active clients", alert.id)
        except Exception as e:
            logger.warning("WebSocket broadcast error: %s", e)

        # 2. Query target subscriptions (matching district or "All")
        query = db.query(PushSubscription).filter(PushSubscription.active == True)
        if alert.district and alert.district != "All":
            query = query.filter(
                (PushSubscription.district == alert.district) | 
                (PushSubscription.district == "All") | 
                (PushSubscription.district == None)
            )
        subscriptions: List[PushSubscription] = query.all()
        total_subs = len(subscriptions)
        successful_pushes = 0

        # 3. Dispatch to Web Push endpoints
        for sub in subscriptions:
            subscription_info = {
                "endpoint": sub.endpoint,
                "keys": {
                    "p256dh": sub.p256dh,
                    "auth": sub.auth
                }
            }
            try:
                webpush(
                    subscription_info=subscription_info,
                    data=payload_json,
                    vapid_private_key=self.vapid_private_key,
                    vapid_claims=self.vapid_claims,
                    ttl=3600
                )
                successful_pushes += 1
            except WebPushException as ex:
                logger.warning("WebPush error for endpoint %s: %s", sub.endpoint[:30], ex)
                # If subscription has expired / unregistered (HTTP 404 or 410 Gone), deactivate it
                if ex.response is not None and ex.response.status_code in [404, 410]:
                    sub.active = False
                    db.commit()
            except Exception as e:
                logger.error("Unexpected error sending push to %s: %s", sub.endpoint[:30], e)

        return total_subs, successful_pushes

webpush_service = WebPushService()
