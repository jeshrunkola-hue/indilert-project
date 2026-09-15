import Dexie, { type EntityTable } from 'dexie';

export interface OfflineReport {
  id?: number;
  reporter_name: string;
  reporter_contact?: string;
  reporter_role: string;
  report_type: string;
  latitude: number;
  longitude: number;
  district_name: string;
  description: string;
  severity: string;
  media_urls?: string[];
  created_at: string;
  synced: boolean;
  sync_error?: string;
}

const db = new Dexie('NERSafeOfflineDB') as Dexie & {
  offline_reports: EntityTable<OfflineReport, 'id'>;
};

db.version(1).stores({
  offline_reports: '++id, reporter_name, report_type, district_name, synced, created_at'
});

export { db };
