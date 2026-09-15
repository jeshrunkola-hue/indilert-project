import { db, OfflineReport } from './db';

export async function saveOfflineReport(report: Omit<OfflineReport, 'id' | 'synced'>): Promise<number> {
  const id = await db.offline_reports.add({
    ...report,
    synced: false
  });
  return id as number;
}

export async function getUnsyncedReports(): Promise<OfflineReport[]> {
  return await db.offline_reports.where('synced').equals(0 as any).toArray();
}

export async function syncOfflineReports(
  onReportSynced?: (report: OfflineReport) => void
): Promise<{ syncedCount: number; failedCount: number }> {
  if (!navigator.onLine) {
    return { syncedCount: 0, failedCount: 0 };
  }

  const unsynced = await db.offline_reports.filter(r => !r.synced).toArray();
  let syncedCount = 0;
  let failedCount = 0;

  for (const report of unsynced) {
    try {
      const formData = new FormData();
      formData.append('reporter_name', report.reporter_name);
      if (report.reporter_contact) formData.append('reporter_contact', report.reporter_contact);
      formData.append('reporter_role', report.reporter_role);
      formData.append('report_type', report.report_type);
      formData.append('latitude', report.latitude.toString());
      formData.append('longitude', report.longitude.toString());
      formData.append('district_name', report.district_name);
      formData.append('description', report.description);
      formData.append('severity', report.severity);
      formData.append('is_offline_synced', 'true');

      const response = await fetch('/api/reports', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        if (report.id) {
          await db.offline_reports.update(report.id, { synced: true });
        }
        syncedCount++;
        if (onReportSynced) onReportSynced(report);
      } else {
        failedCount++;
      }
    } catch (err: any) {
      failedCount++;
      if (report.id) {
        await db.offline_reports.update(report.id, { sync_error: err.message || 'Sync failed' });
      }
    }
  }

  return { syncedCount, failedCount };
}
