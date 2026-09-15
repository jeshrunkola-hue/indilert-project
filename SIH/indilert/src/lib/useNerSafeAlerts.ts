"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { registerServiceWorker, saveReceivedAlert } from "./pushNotifications";

const NER_SAFE_API = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_NERSAFE_API_URL || "http://localhost:8000";
const getWsUrl = () => {
  const explicitWs = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_NERSAFE_WS_URL;
  if (explicitWs) return explicitWs;
  const cleanHost = NER_SAFE_API.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '').replace(/\/$/, '');
  const wsProto = NER_SAFE_API.startsWith("https:") ? "wss:" : "ws:";
  return `${wsProto}//${cleanHost}/ws/live`;
};
const NER_SAFE_WS = getWsUrl();

export interface LiveEmergencyAlert {
  id?: string;
  alertId?: string;
  title: string;
  message: string;
  severity: "CRITICAL" | "HIGH" | "WARNING" | "ADVISORY" | string;
  type?: string;
  district?: string;
  state?: string;
  riskScore?: number;
  expectedWindow?: string;
  recommendedAction?: string;
  issuedAt?: string;
  translations?: Record<string, any>;
}

// Synthesize authentic emergency tone using Web Audio API
export function playEmergencyAudio() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    const now = ctx.currentTime;
    
    // Warble emergency siren frequencies
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(660, now + 0.25);
    osc.frequency.setValueAtTime(880, now + 0.5);
    osc.frequency.setValueAtTime(660, now + 0.75);
    osc.frequency.setValueAtTime(880, now + 1.0);
    osc.frequency.setValueAtTime(660, now + 1.25);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.5);
  } catch (e) {
    console.warn("[Indilert] Could not synthesize emergency audio tone:", e);
  }
}

// Trigger emergency vibration pattern [500ms, 200ms, 500ms, 200ms, 800ms]
export function triggerEmergencyVibration() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate([500, 200, 500, 200, 800]);
    } catch (e) {
      // Browser or device restrictions
    }
  }
}

export function useNerSafeAlerts() {
  const [activeAlert, setActiveAlert] = useState<LiveEmergencyAlert | null>(null);
  const [modalAlert, setModalAlert] = useState<LiveEmergencyAlert | null>(null);
  const [alertHistory, setAlertHistory] = useState<LiveEmergencyAlert[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch active alerts from NER-SAFE REST API
  const fetchActiveAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${NER_SAFE_API}/api/emergency-alerts/active?district=East Khasi Hills`, {
        cache: "no-store",
      });
      if (res.ok) {
        const alerts: any[] = await res.json();
        if (alerts && alerts.length > 0) {
          const first = alerts[0];
          const mapped: LiveEmergencyAlert = {
            id: first.id,
            alertId: first.id,
            title: first.title,
            message: first.message,
            severity: first.severity,
            type: first.type,
            district: first.district,
            state: first.state,
            riskScore: first.risk_score,
            expectedWindow: first.expected_window,
            recommendedAction: first.recommended_action,
            issuedAt: first.issued_at,
            translations: first.translations,
          };
          setActiveAlert(mapped);
          saveReceivedAlert({
            id: mapped.id || `alert-${Date.now()}`,
            title: mapped.title,
            body: mapped.message,
            severity: mapped.severity,
            type: mapped.type || "LANDSLIDE",
            area: mapped.district || "East Khasi Hills",
            url: "/#alert",
            issuedAt: mapped.issuedAt || new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.warn("[Indilert] Could not fetch active alerts from NER-SAFE:", err);
    }
  }, []);

  // 2. Acknowledge alert & report to NER-SAFE
  const acknowledgeAlert = useCallback(async () => {
    const alertId = activeAlert?.alertId || activeAlert?.id;
    if (!alertId) return;
    try {
      await fetch(`${NER_SAFE_API}/api/emergency-alerts/${alertId}/acknowledge`, {
        method: "POST",
      });
    } catch (e) {
      console.warn("[Indilert] Acknowledge error:", e);
    }
  }, [activeAlert]);

  // 3. Mark alert opened
  const markAlertOpened = useCallback(async (alertId: string) => {
    if (!alertId) return;
    try {
      await fetch(`${NER_SAFE_API}/api/emergency-alerts/${alertId}/open`, {
        method: "POST",
      });
    } catch (e) {
      console.warn("[Indilert] Mark opened error:", e);
    }
  }, []);

  // 3.5. Fetch specific alert by ID (for direct deep links like ?alert_id=...)
  const fetchAlertById = useCallback(async (alertId: string) => {
    if (!alertId) return;
    try {
      const res = await fetch(`${NER_SAFE_API}/api/emergency-alerts/${alertId}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const item = await res.json();
        const mapped: LiveEmergencyAlert = {
          id: item.id,
          alertId: item.id,
          title: item.title,
          message: item.message,
          severity: item.severity,
          type: item.type,
          district: item.district,
          state: item.state,
          riskScore: item.risk_score,
          expectedWindow: item.expected_window,
          recommendedAction: item.recommended_action,
          issuedAt: item.issued_at,
          translations: item.translations,
        };
        setModalAlert(mapped);
        setActiveAlert(mapped);
        setIsModalOpen(true);
        markAlertOpened(alertId);
        triggerEmergencyVibration();
        playEmergencyAudio();
      }
    } catch (e) {
      console.warn("[Indilert] Failed to fetch alert by ID:", e);
    }
  }, [markAlertOpened]);

  // 4. Background Web Push Subscription
  const autoSubscribeWebPush = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    try {
      // Register Service Worker first
      const registration = await registerServiceWorker();
      if (!registration) return;

      if (Notification.permission === "granted") {
        // Fetch VAPID public key directly from NER-SAFE
        let publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicKey) {
          const keyRes = await fetch(`${NER_SAFE_API}/api/emergency-alerts/vapid-public-key`);
          if (keyRes.ok) {
            const keyData = await keyRes.json();
            publicKey = keyData.publicKey;
          }
        }
        if (!publicKey) return;

        // Convert base64 VAPID key
        const padding = "=".repeat((4 - (publicKey.length % 4)) % 4);
        const base64 = (publicKey + padding).replace(/-/g, "+").replace(/_/g, "/");
        const rawData = window.atob(base64);
        const appServerKey = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          appServerKey[i] = rawData.charCodeAt(i);
        }

        let sub = await registration.pushManager.getSubscription();
        if (!sub) {
          sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: appServerKey,
          });
        }

        const subJSON = sub.toJSON();
        if (subJSON.endpoint && subJSON.keys) {
          // Register with NER-SAFE push service
          await fetch(`${NER_SAFE_API}/api/emergency-alerts/push-subscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              endpoint: subJSON.endpoint,
              keys: {
                p256dh: subJSON.keys.p256dh,
                auth: subJSON.keys.auth,
              },
              district: "East Khasi Hills",
              state: "Meghalaya",
            }),
          });
          console.log("[Indilert] Web Push subscription successfully registered with NER-SAFE");
        }
      }
    } catch (err) {
      console.warn("[Indilert] Auto-subscribe push warning:", err);
    }
  }, []);

  // 5. Connect WebSocket to NER-SAFE real-time stream
  const connectWebSocket = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      setConnectionStatus("connecting");
      const ws = new WebSocket(NER_SAFE_WS);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus("connected");
        console.log("[Indilert] Connected to NER-SAFE real-time WebSocket");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "EMERGENCY_ALERT_BROADCAST") {
            const rawAlert = data.alert || data.notification?.data || {};
            const mapped: LiveEmergencyAlert = {
              id: rawAlert.alertId || rawAlert.id,
              alertId: rawAlert.alertId || rawAlert.id,
              title: rawAlert.title || data.notification?.title || "EMERGENCY ALERT",
              message: rawAlert.message || data.notification?.body || "Immediate evacuation recommended.",
              severity: rawAlert.severity || "HIGH",
              type: rawAlert.type || "LANDSLIDE",
              district: rawAlert.district || "East Khasi Hills",
              state: rawAlert.state || "Meghalaya",
              riskScore: rawAlert.riskScore,
              expectedWindow: rawAlert.expectedWindow,
              recommendedAction: rawAlert.recommendedAction,
              issuedAt: rawAlert.issuedAt || new Date().toISOString(),
              translations: rawAlert.translations,
            };

            setActiveAlert(mapped);
            setModalAlert(mapped);
            setAlertHistory(prev => {
              if (!prev.find(a => a.id === mapped.id)) {
                return [mapped, ...prev].slice(0, 10);
              }
              return prev;
            });
            setIsModalOpen(true);
            triggerEmergencyVibration();
            playEmergencyAudio();

            // Save for active warnings list
            saveReceivedAlert({
              id: mapped.id || `alert-${Date.now()}`,
              title: mapped.title,
              body: mapped.message,
              severity: mapped.severity,
              type: mapped.type || "LANDSLIDE",
              area: mapped.district || "East Khasi Hills",
              url: "/#alert",
              issuedAt: mapped.issuedAt || new Date().toISOString(),
            });

            // Mark alert opened
            if (mapped.id) {
              markAlertOpened(mapped.id);
            }
          }
        } catch (e) {
          console.warn("[Indilert] Failed to parse WebSocket message:", e);
        }
      };

      ws.onclose = () => {
        setConnectionStatus("disconnected");
        // Reconnect after 4 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 4000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (e) {
      setConnectionStatus("disconnected");
    }
  }, [markAlertOpened]);

  // Toggle or grant notification permission
  const toggleNotifications = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }
    try {
      if (Notification.permission !== "granted") {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          await autoSubscribeWebPush();
          setIsSubscribed(true);
          playEmergencyAudio();
          triggerEmergencyVibration();
        }
      } else {
        // Test chime & vibration when already allowed
        playEmergencyAudio();
        triggerEmergencyVibration();
      }
    } catch (e) {
      console.warn("[Indilert] Toggle notification error:", e);
    }
  }, [autoSubscribeWebPush]);

  useEffect(() => {
    // Check initial notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSubscribed(Notification.permission === "granted");
    }

    // Check URL parameters for ?alert_id=
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const alertIdParam = params.get("alert_id");
      if (alertIdParam) {
        fetchAlertById(alertIdParam);
      }
    }

    // Initial fetch of active alerts
    fetchActiveAlerts();

    // Start WebSocket
    connectWebSocket();

    // Setup push subscription
    autoSubscribeWebPush();

    // On user first interaction (click/touch), request notification permission if default
    const handleFirstInteraction = () => {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          Notification.requestPermission().then((perm) => {
            if (perm === "granted") {
              setIsSubscribed(true);
              autoSubscribeWebPush();
            }
          });
        }
      }
    };
    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { once: true });

    // Listen to ServiceWorker push and click messages
    const handleSwMessage = (event: MessageEvent) => {
      const msgType = event.data?.type;
      if (msgType === "INDILERT_PUSH_RECEIVED" || msgType === "INDILERT_SHOW_ALERT_MODAL" || msgType === "INDILERT_NOTIFICATION_CLICK") {
        const payload = event.data.payload || event.data.alert || {};
        const incoming: LiveEmergencyAlert = {
          id: payload.id || payload.alertId,
          alertId: payload.id || payload.alertId,
          title: payload.title || "EMERGENCY ALERT",
          message: payload.body || payload.message || "Emergency alert received.",
          severity: payload.severity || "HIGH",
          type: payload.type,
          district: payload.area || payload.district || "East Khasi Hills",
          issuedAt: payload.issuedAt,
        };
        setActiveAlert(incoming);
        setModalAlert(incoming);
        setAlertHistory(prev => {
          if (!prev.find(a => a.id === incoming.id)) {
            return [incoming, ...prev].slice(0, 10);
          }
          return prev;
        });
        setIsModalOpen(true);
        triggerEmergencyVibration();
        playEmergencyAudio();
      }
    };

    if (typeof navigator !== "undefined" && navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("message", handleSwMessage);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      if (typeof navigator !== "undefined" && navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener("message", handleSwMessage);
      }
    };
  }, [fetchActiveAlerts, connectWebSocket, autoSubscribeWebPush, fetchAlertById]);

  return {
    activeAlert,
    modalAlert: modalAlert || activeAlert,
    isModalOpen,
    openModal: (alert?: LiveEmergencyAlert) => {
      if (alert) setModalAlert(alert);
      setIsModalOpen(true);
    },
    closeModal: () => setIsModalOpen(false),
    isSubscribed,
    toggleNotifications,
    connectionStatus,
    acknowledgeAlert,
    alertHistory,
    triggerTestAlert: () => {
      triggerEmergencyVibration();
      playEmergencyAudio();
    },
  };
}
