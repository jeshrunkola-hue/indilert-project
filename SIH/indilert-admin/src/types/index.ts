export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type RoadStatus = 'OPEN' | 'RESTRICTED' | 'PARTIALLY_BLOCKED' | 'BLOCKED';
export type UserRole = 'ADMIN' | 'DISASTER_MANAGEMENT_AUTHORITY' | 'FIELD_OFFICER' | 'CITIZEN';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  district_id?: number;
  phone_number?: string;
  is_active: boolean;
}

export interface District {
  id: number;
  name: string;
  state: string;
  center_lat: number;
  center_lng: number;
  current_risk_score: number;
  current_risk_level: RiskLevel;
  population: number;
  active_incidents_count: number;
  blocked_roads_count: number;
}

export interface FactorDetail {
  weight_percent: number;
  raw_value: string;
  score: number;
  rating: string;
  bar: string;
}

export interface Zone {
  id: number;
  name: string;
  district_id: number;
  district_name: string;
  center_lat: number;
  center_lng: number;
  radius_km: number;
  slope_angle: number;
  elevation: number;
  terrain_type: string;
  land_cover: string;
  current_risk_score: number;
  current_risk_level: RiskLevel;
  soil_moisture: number;
  rainfall_1h: number;
  rainfall_3h: number;
  rainfall_6h: number;
  rainfall_24h: number;
  forecast_rainfall_24h: number;
  historical_incidents_count: number;
  recent_field_reports_count: number;
  contributing_factors?: Record<string, FactorDetail>;
  ai_prediction_summary?: string;
  last_evaluated_at?: string;
}

export interface Road {
  id: number;
  name: string;
  route_number: string;
  district_id: number;
  district_name: string;
  status: RoadStatus;
  blockage_reason?: string;
  coordinates_geojson?: {
    type: string;
    coordinates: [number, number][];
  };
  alternative_route?: string;
  affected_villages?: string[];
  isolated_population: number;
  nearest_emergency_resources?: {
    name: string;
    distance_km: number;
    type: string;
  }[];
}

export interface Village {
  id: number;
  name: string;
  district_id: number;
  latitude: number;
  longitude: number;
  population: number;
  is_isolated: number;
  evacuation_shelter: string;
}

export interface Infrastructure {
  id: number;
  name: string;
  type: string;
  district_id: number;
  latitude: number;
  longitude: number;
  status: string;
  capacity?: string;
}

export interface Sensor {
  id: number;
  sensor_code: string;
  name: string;
  district_id: number;
  district_name: string;
  latitude: number;
  longitude: number;
  status: 'ONLINE' | 'WARNING' | 'OFFLINE';
  soil_moisture: number;
  battery_level: number;
  pore_water_pressure_kpa: number;
  tilt_degrees: number;
  signal_strength_dbm: number;
  last_reading_at?: string;
}

export interface WeatherData {
  district: string;
  current_rainfall_rate_mm_h: number;
  rainfall_intensity: string;
  rainfall_1h_mm: number;
  rainfall_3h_mm: number;
  rainfall_6h_mm: number;
  rainfall_24h_mm: number;
  forecast_24h_mm: number;
  temperature_c: number;
  humidity_percent: number;
  wind_speed_kmh: number;
  weather_warning: string;
  timestamp: string;
}

export interface CitizenReport {
  id: number;
  reporter_name: string;
  reporter_contact?: string;
  reporter_role: string;
  report_type: string;
  latitude: number;
  longitude: number;
  district_name: string;
  description: string;
  media_urls: string[];
  severity: RiskLevel;
  ai_assessed_type?: string;
  ai_assessed_severity?: RiskLevel;
  ai_confidence?: number;
  ai_recommended_action?: string;
  is_verified: boolean;
  is_offline_synced: boolean;
  status: string;
  created_at: string;
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  district_name: string;
  zone_name?: string;
  latitude: number;
  longitude: number;
  severity: RiskLevel;
  status: string;
  report_source: string;
  assigned_team?: string;
  evacuation_required: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AuditLog {
  id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  changed_by: string;
  user_role: string;
  old_state?: string;
  new_state?: string;
  notes?: string;
  timestamp: string;
}

export interface Alert {
  id: number;
  alert_code: string;
  level: 'LEVEL_1_INFO' | 'LEVEL_2_WATCH' | 'LEVEL_3_WARNING' | 'LEVEL_4_EMERGENCY';
  title: string;
  message_en: string;
  message_hi: string;
  message_regional: string;
  regional_language: string;
  district_name: string;
  zone_name?: string;
  cause: string;
  recommended_action: string;
  issued_by: string;
  issued_at: string;
  expires_at?: string;
  is_active: boolean;
  channels: string[];
  acknowledged_count: number;
}

export interface PriorityItem {
  rank: number;
  zone_id: number;
  zone_name: string;
  district_name: string;
  priority_score: number;
  risk_level: RiskLevel;
  risk_score: number;
  population_affected: number;
  key_corridor: string;
  has_blocked_road: boolean;
  expected_window: string;
  nearby_critical_facilities: string[];
  recommended_action: string;
}

export interface RiskFactorConfig {
  factor_name: string;
  weight: number;
  display_name: string;
  description?: string;
}

export interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  type: string;
  state: string;
  district: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  risk_score: number;
  expected_window: string;
  recommended_action: string;
  issued_at: string;
  expires_at?: string;
  source: string;
  sender_role: string;
  status: 'DRAFT' | 'SENDING' | 'SENT' | 'FAILED' | 'EXPIRED' | 'CANCELLED';
  mode: 'LIVE' | 'DEMO';
  recipients_count: number;
  push_sent_count: number;
  opened_count: number;
  acknowledged_count: number;
  translations?: Record<string, any>;
}
