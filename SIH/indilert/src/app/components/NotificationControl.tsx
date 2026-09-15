"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Check, AlertTriangle, Loader2 } from "lucide-react";
import {
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  triggerTestNotification,
  registerServiceWorker,
  saveReceivedAlert,
  isPushNotificationSupported,
} from "@/lib/pushNotifications";

interface NotificationControlProps {
  buttonClassName?: string;
}

export default function NotificationControl({ buttonClassName = "w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm bg-black/20 hover:bg-black/30" }: NotificationControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isTestLoading, setIsTestLoading] = useState(false);

  // Detect current permission state without prompting
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPerm = getNotificationPermission();
      setPermission(currentPerm);

      // If already granted, ensure service worker is active
      if (currentPerm === "granted") {
        registerServiceWorker();
      }

      // Listen for push messages broadcast by service worker
      if ("serviceWorker" in navigator) {
        const messageHandler = (event: MessageEvent) => {
          if (event.data?.type === "INDILERT_PUSH_RECEIVED" && event.data?.payload) {
            saveReceivedAlert(event.data.payload);
          }
        };
        navigator.serviceWorker.addEventListener("message", messageHandler);
        return () => {
          navigator.serviceWorker.removeEventListener("message", messageHandler);
        };
      }
    }
  }, []);

  const handleEnableAlerts = async () => {
    setLoading(true);
    setFeedbackMessage(null);

    const result = await subscribeToPush();
    setPermission(result.permission);
    setLoading(false);

    if (result.success) {
      setFeedbackMessage("✓ Emergency notifications enabled");
    } else if (result.permission === "denied") {
      setFeedbackMessage(null);
    } else if (result.error) {
      setFeedbackMessage(result.error);
    }
  };

  const handleDisableAlerts = async () => {
    setLoading(true);
    await unsubscribeFromPush();
    setLoading(false);
    setFeedbackMessage("Notifications turned off for this browser");
    // Permission remains granted in browser settings, but subscription is removed
  };

  const handleSendTest = async () => {
    setIsTestLoading(true);
    setFeedbackMessage(null);
    const result = await triggerTestNotification();
    setIsTestLoading(false);

    if (result.success) {
      setFeedbackMessage("✓ Test notification dispatched. Check your device/screen.");
    } else {
      setFeedbackMessage(result.error || "Failed to dispatch test notification");
    }
  };

  const isEnabled = permission === "granted";
  const isDenied = permission === "denied";

  return (
    <div className="relative">
      {/* Small 🔔 notification icon in header */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setFeedbackMessage(null);
          setPermission(getNotificationPermission());
        }}
        className={`${buttonClassName} relative`}
        aria-label={isEnabled ? "Emergency Alerts Enabled" : "Enable Emergency Alerts"}
        title={isEnabled ? "Emergency Alerts Enabled" : "Emergency Alerts"}
      >
        {isDenied ? (
          <BellOff className="w-4 h-4 text-white/70" />
        ) : (
          <Bell className="w-4 h-4 text-white" />
        )}

        {/* Small active badge indicator when granted */}
        {isEnabled && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
        )}
      </button>

      {/* Small, native-styled Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Popover */}
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-red-600" />
                <span className="font-bold text-sm text-slate-800">Emergency Alerts</span>
              </div>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isEnabled
                    ? "bg-emerald-100 text-emerald-800"
                    : isDenied
                    ? "bg-red-100 text-red-800"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {isEnabled ? "Active" : isDenied ? "Blocked" : "Off"}
              </span>
            </div>

            {/* Content Area */}
            <div className="p-4 space-y-3">
              {/* State 1: Granted */}
              {isEnabled && (
                <div className="space-y-3">
                  <div className="flex items-start space-x-2.5 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900">✓ Alerts Enabled</p>
                      <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                        Your device is registered to receive critical warnings and disaster alerts.
                      </p>
                    </div>
                  </div>

                  {/* Dev / Verification Test Trigger */}
                  <div className="pt-1">
                    <button
                      onClick={handleSendTest}
                      disabled={isTestLoading}
                      className="w-full py-2 px-3 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors flex items-center justify-center space-x-1.5"
                    >
                      {isTestLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Bell className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span>Test Notification</span>
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-1">
                      Verification test: sends a test alert to this device
                    </p>
                  </div>

                  <button
                    onClick={handleDisableAlerts}
                    disabled={loading}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-700 font-medium py-1"
                  >
                    Turn off alerts
                  </button>
                </div>
              )}

              {/* State 2: Default (Unconfigured) */}
              {!isEnabled && !isDenied && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Enable notifications to receive important disaster and emergency warnings.
                  </p>

                  <button
                    onClick={handleEnableAlerts}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                    <span>Enable Alerts</span>
                  </button>
                </div>
              )}

              {/* State 3: Denied */}
              {isDenied && (
                <div className="space-y-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-2 text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold">⚠️ Notifications are disabled</p>
                      <p className="text-[11px] text-amber-800 font-medium mt-1 leading-relaxed">
                        Please allow notifications in your browser/device settings to receive emergency alerts.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback messages (in-app, non-blocking) */}
              {feedbackMessage && (
                <div className="text-[11px] font-semibold text-slate-600 bg-slate-100 rounded-lg p-2 text-center">
                  {feedbackMessage}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
