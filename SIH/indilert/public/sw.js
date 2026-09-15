// INDILERT Service Worker - Background Web Push & Emergency Alerts
// Root scope: /sw.js

self.addEventListener('install', (event) => {
  // Activate immediately without waiting for existing instances to close
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all pages under this service worker's scope immediately
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push notifications
self.addEventListener('push', (event) => {
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'INDILERT Emergency Alert',
        body: event.data.text() || 'An emergency alert has been received.',
      };
    }
  } else {
    data = {
      title: 'INDILERT Emergency Alert',
      body: 'Important emergency warning issued.',
    };
  }

  const innerData = data.data || {};
  const alertId = innerData.alertId || data.id || `alert-${Date.now()}`;
  const title = data.title || innerData.title || 'INDILERT Emergency Alert';
  const body = data.body || innerData.message || 'Important disaster/emergency warning.';
  const severity = (innerData.severity || data.severity || 'HIGH').toUpperCase();
  const isEmergencyOrCritical = 
    severity === 'CRITICAL' || 
    severity === 'HIGH' || 
    severity === 'EMERGENCY';

  // Attempt vibration pattern for emergency/critical warnings where supported by browser/device
  const vibrationPattern = isEmergencyOrCritical ? [500, 200, 500, 200, 800] : [200, 100, 200];

  // Determine target URL dynamically from origin
  const appOrigin = self.location.origin || 'http://localhost:3000';
  let targetUrl = innerData.url || data.url;
  if (!targetUrl || targetUrl === '/warnings' || targetUrl === '/') {
    targetUrl = `${appOrigin}/?alert_id=${alertId}`;
  }

  const notificationOptions = {
    body: body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `indilert-alert-${alertId}`,
    renotify: true,
    requireInteraction: isEmergencyOrCritical,
    vibrate: vibrationPattern,
    actions: data.actions || [
      { action: 'view', title: 'VIEW ALERT' },
      { action: 'help', title: 'GET HELP' }
    ],
    data: {
      ...innerData,
      id: alertId,
      alertId: alertId,
      url: targetUrl,
      title: title,
      body: body,
      message: innerData.message || body,
      severity: severity,
      type: innerData.type || data.type || 'LANDSLIDE',
      district: innerData.district || data.area || 'East Khasi Hills',
      recommendedAction: innerData.recommendedAction,
      issuedAt: innerData.issuedAt || data.issuedAt || new Date().toISOString(),
      apiBase: innerData.apiBase || 'http://localhost:8000',
    },
  };

  const notificationPromise = self.registration.showNotification(title, notificationOptions);

  // Broadcast payload to any open Indilert client windows so in-app state updates in real-time
  const broadcastPromise = self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    clientList.forEach((client) => {
      client.postMessage({
        type: 'INDILERT_PUSH_RECEIVED',
        payload: notificationOptions.data,
      });
    });
  });

  event.waitUntil(Promise.all([notificationPromise, broadcastPromise]));
});

// Handle notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const alertData = event.notification.data || {};
  const alertId = alertData.alertId || alertData.id;
  let targetUrl = alertData.url;

  if (event.action === 'help') {
    targetUrl = `${appOrigin}/help`;
  } else if (!targetUrl || targetUrl === '/' || targetUrl === '/warnings') {
    targetUrl = alertId ? `${appOrigin}/?alert_id=${alertId}` : `${appOrigin}/`;
  }

  // Ensure absolute URL
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = new URL(targetUrl, appOrigin).href;
  }

  // Inform backend that citizen opened the alert
  if (alertId && alertData.apiBase) {
    fetch(`${alertData.apiBase}/api/emergency-alerts/${alertId}/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => {});
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('3000') || client.url.includes('indilert') || client.url.includes('netlify.app')) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          client.postMessage({
            type: 'INDILERT_SHOW_ALERT_MODAL',
            alert: alertData,
            alertId: alertId
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
