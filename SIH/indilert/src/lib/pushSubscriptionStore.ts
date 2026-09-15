import fs from 'fs';
import path from 'path';

export interface PushSubscriptionRecord {
  id: string;
  user_id: string | null;
  endpoint: string;
  p256dh: string;
  auth: string;
  device?: string | null;
  region?: string | null;
  district?: string | null;
  created_at: string;
  updated_at: string;
  active: boolean;
}

// Storage path: in project data directory, with /tmp fallback for ephemeral serverless read-only roots
function getStorageFilePath(): string {
  const primaryDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(primaryDir)) {
      fs.mkdirSync(primaryDir, { recursive: true });
    }
    return path.join(primaryDir, 'push_subscriptions.json');
  } catch (err) {
    // Fallback to /tmp if primary directory is not writable (e.g. some Lambda / read-only container environments)
    const tmpDir = '/tmp';
    return path.join(tmpDir, 'indilert_push_subscriptions.json');
  }
}

// In-memory cache for fast access & atomic read/write synchronization
let inMemorySubscriptions: Map<string, PushSubscriptionRecord> | null = null;

function loadFromDisk(): Map<string, PushSubscriptionRecord> {
  const map = new Map<string, PushSubscriptionRecord>();
  const filePath = getStorageFilePath();

  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      if (raw.trim()) {
        const list: PushSubscriptionRecord[] = JSON.parse(raw);
        for (const item of list) {
          if (item && item.endpoint) {
            map.set(item.endpoint, item);
          }
        }
      }
    }
  } catch (err) {
    console.error('[pushSubscriptionStore] Error reading storage file:', err);
  }

  return map;
}

function saveToDisk(map: Map<string, PushSubscriptionRecord>): void {
  const filePath = getStorageFilePath();
  try {
    const list = Array.from(map.values());
    const tempPath = `${filePath}.${Date.now()}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(list, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error('[pushSubscriptionStore] Error writing storage file:', err);
  }
}

function getStore(): Map<string, PushSubscriptionRecord> {
  if (!inMemorySubscriptions) {
    inMemorySubscriptions = loadFromDisk();
  }
  return inMemorySubscriptions;
}

export function saveSubscription(params: {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  user_id?: string | null;
  device?: string | null;
  region?: string | null;
  district?: string | null;
}): PushSubscriptionRecord {
  const store = getStore();
  const existing = store.get(params.endpoint);
  const now = new Date().toISOString();

  const record: PushSubscriptionRecord = {
    id: existing ? existing.id : `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    user_id: params.user_id !== undefined ? params.user_id : (existing ? existing.user_id : null),
    endpoint: params.endpoint,
    p256dh: params.keys.p256dh,
    auth: params.keys.auth,
    device: params.device || existing?.device || null,
    region: params.region || existing?.region || null,
    district: params.district || existing?.district || null,
    created_at: existing ? existing.created_at : now,
    updated_at: now,
    active: true,
  };

  store.set(params.endpoint, record);
  saveToDisk(store);
  return record;
}

export function removeSubscription(endpoint: string): boolean {
  const store = getStore();
  const existing = store.get(endpoint);
  if (existing) {
    existing.active = false;
    existing.updated_at = new Date().toISOString();
    store.set(endpoint, existing);
    saveToDisk(store);
    return true;
  }
  return false;
}

export function deactivateSubscription(endpoint: string): void {
  removeSubscription(endpoint);
}

export function getSubscriptions(activeOnly: boolean = true): PushSubscriptionRecord[] {
  const store = getStore();
  const list = Array.from(store.values());
  return activeOnly ? list.filter((item) => item.active) : list;
}

export function getSubscriptionByEndpoint(endpoint: string): PushSubscriptionRecord | undefined {
  const store = getStore();
  return store.get(endpoint);
}
