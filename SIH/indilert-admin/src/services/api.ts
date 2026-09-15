import {
  District, Zone, Road, Village, Infrastructure,
  Sensor, WeatherData, CitizenReport, Incident,
  AuditLog, Alert, PriorityItem, RiskFactorConfig, User, EmergencyAlert
} from '../types';

export const BACKEND_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
export const API_BASE = import.meta.env.VITE_API_BASE_URL || (BACKEND_URL ? (BACKEND_URL.endsWith('/api') ? BACKEND_URL : `${BACKEND_URL}/api`) : '/api');

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('ner_safe_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async login(email: string, password: string):Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  // Geospatial
  async getDistricts(): Promise<District[]> {
    const res = await fetch(`${API_BASE}/districts`);
    return res.json();
  },

  async getZones(): Promise<Zone[]> {
    const res = await fetch(`${API_BASE}/zones`);
    return res.json();
  },

  async getVillages(): Promise<Village[]> {
    const res = await fetch(`${API_BASE}/villages`);
    return res.json();
  },

  async getInfrastructure(): Promise<Infrastructure[]> {
    const res = await fetch(`${API_BASE}/infrastructure`);
    return res.json();
  },

  // Weather
  async getCurrentWeather(district = 'East Khasi Hills'): Promise<WeatherData> {
    const res = await fetch(`${API_BASE}/weather/current?district=${encodeURIComponent(district)}`);
    return res.json();
  },

  async getWeatherForecast(district = 'East Khasi Hills'): Promise<any[]> {
    const res = await fetch(`${API_BASE}/weather/forecast?district=${encodeURIComponent(district)}`);
    return res.json();
  },

  async getRainfallSummary(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/weather/rainfall`);
    return res.json();
  },

  // Sensors
  async getSensors(): Promise<Sensor[]> {
    const res = await fetch(`${API_BASE}/sensors`);
    return res.json();
  },

  // Predictions & Risk
  async predictLandslide(features: any): Promise<any> {
    const res = await fetch(`${API_BASE}/predictions/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features)
    });
    return res.json();
  },

  async getRiskWeights(): Promise<RiskFactorConfig[]> {
    const res = await fetch(`${API_BASE}/risk/weights`);
    return res.json();
  },

  async updateRiskWeights(weights: Record<string, number>): Promise<any> {
    const res = await fetch(`${API_BASE}/risk/weights`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ weights })
    });
    return res.json();
  },

  // Citizen & Field Reports
  async getReports(): Promise<CitizenReport[]> {
    const res = await fetch(`${API_BASE}/reports`);
    return res.json();
  },

  async submitReport(formData: FormData): Promise<CitizenReport> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to submit report');
    return res.json();
  },

  async verifyReport(reportId: number): Promise<CitizenReport> {
    const res = await fetch(`${API_BASE}/reports/${reportId}/verify`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to verify report');
    return res.json();
  },

  // Incidents
  async getIncidents(): Promise<Incident[]> {
    const res = await fetch(`${API_BASE}/incidents`);
    return res.json();
  },

  async updateIncidentStatus(id: number, status: string, notes?: string, assigned_team?: string): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status, notes, assigned_team })
    });
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/incidents/audit-logs`);
    return res.json();
  },

  // Roads
  async getRoads(): Promise<Road[]> {
    const res = await fetch(`${API_BASE}/roads`);
    return res.json();
  },

  async updateRoadStatus(id: number, status: string, blockage_reason?: string, alternative_route?: string): Promise<Road> {
    const res = await fetch(`${API_BASE}/roads/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status, blockage_reason, alternative_route })
    });
    return res.json();
  },

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    const res = await fetch(`${API_BASE}/alerts`);
    return res.json();
  },

  async createAlert(data: any): Promise<Alert> {
    const res = await fetch(`${API_BASE}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async acknowledgeAlert(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/alerts/${id}/acknowledge`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return res.json();
  },

  async triggerEmergencyBroadcast(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/alerts/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Response Prioritization
  async getPriorities(): Promise<PriorityItem[]> {
    const res = await fetch(`${API_BASE}/prioritization`);
    return res.json();
  },

  // Analytics
  async getAnalytics(): Promise<any> {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    return res.json();
  },

  // Simulation (Demo Mode)
  async getSimulationStatus(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/status`);
    return res.json();
  },

  async advanceSimulation(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/advance`, { method: 'POST' });
    return res.json();
  },

  async resetSimulation(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/reset`, { method: 'POST' });
    return res.json();
  },

  // Emergency Alerts & Indilert Integration
  async getVapidPublicKey(): Promise<{ publicKey: string }> {
    const res = await fetch(`${API_BASE}/emergency-alerts/vapid-public-key`);
    return res.json();
  },

  async subscribePush(subData: any): Promise<any> {
    const res = await fetch(`${API_BASE}/emergency-alerts/push-subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subData)
    });
    return res.json();
  },

  async sendEmergencyAlert(alertData: any): Promise<EmergencyAlert> {
    const res = await fetch(`${API_BASE}/emergency-alerts/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(alertData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to send emergency alert');
    }
    return res.json();
  },

  async getActiveEmergencyAlerts(district?: string, mode?: string): Promise<EmergencyAlert[]> {
    let url = `${API_BASE}/emergency-alerts/active`;
    const params = new URLSearchParams();
    if (district) params.append('district', district);
    if (mode) params.append('mode', mode);
    if (params.toString()) url += `?${params.toString()}`;
    const res = await fetch(url);
    return res.json();
  },

  async getEmergencyAlertHistory(mode?: string): Promise<EmergencyAlert[]> {
    let url = `${API_BASE}/emergency-alerts/history`;
    if (mode) url += `?mode=${encodeURIComponent(mode)}`;
    const res = await fetch(url);
    return res.json();
  },

  async getEmergencyAlert(alertId: string): Promise<EmergencyAlert> {
    const res = await fetch(`${API_BASE}/emergency-alerts/${alertId}`);
    return res.json();
  },

  async trackAlertOpen(alertId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/emergency-alerts/${alertId}/open`, { method: 'POST' });
    return res.json();
  },

  async trackAlertAcknowledge(alertId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/emergency-alerts/${alertId}/acknowledge`, { method: 'POST' });
    return res.json();
  }
};
