import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { District, Zone, Road, Sensor, CitizenReport, Infrastructure, RiskLevel } from '../types';
import { useApp } from '../context/AppContext';
import {
  Layers,
  MapPin,
  AlertTriangle,
  Radio,
  Car,
  Hospital,
  Droplets,
  Mountain,
  ChevronRight,
  TrendingUp,
  Search,
  Compass
} from 'lucide-react';

interface NERMapProps {
  districts: District[];
  zones: Zone[];
  roads: Road[];
  sensors: Sensor[];
  reports: CitizenReport[];
  infrastructure: Infrastructure[];
  onSelectZone?: (zone: Zone) => void;
  fullHeight?: boolean;
}

// Custom DivIcons for crisp styling
const createDivIcon = (colorClass: string, symbol: string) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${colorClass}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 13px; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);">${symbol}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const NERMap: React.FC<NERMapProps> = ({
  districts,
  zones,
  roads,
  sensors,
  reports,
  infrastructure,
  onSelectZone,
  fullHeight = false
}) => {
  const { setSelectedZone, setActiveTab } = useApp();
  const [activeLayers, setActiveLayers] = useState({
    zones: true,
    roads: true,
    sensors: true,
    reports: true,
    infrastructure: true,
  });

  const [mapCenter, setMapCenter] = useState<[number, number]>([25.8, 92.8]); // Centered on North East India
  const [mapZoom, setMapZoom] = useState<number>(7);
  const [searchQuery, setSearchQuery] = useState('');
  const [tileProvider, setTileProvider] = useState<'topo' | 'satellite' | 'street' | 'dark'>('dark');

  const getRiskColor = (level: RiskLevel | string) => {
    switch (level) {
      case 'CRITICAL': return '#EF4444';
      case 'HIGH': return '#F97316';
      case 'MODERATE': return '#EAB308';
      case 'LOW': default: return '#10B981';
    }
  };

  const getRoadColor = (status: string) => {
    switch (status) {
      case 'BLOCKED': return '#EF4444';
      case 'PARTIALLY_BLOCKED': return '#F97316';
      case 'RESTRICTED': return '#EAB308';
      case 'OPEN': default: return '#10B981';
    }
  };

  const tileUrls = {
    dark: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    topo: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = districts.find(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  zones.find(z => z.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (match) {
      setMapCenter([match.center_lat, match.center_lng]);
      setMapZoom(10);
    }
  };

  const handleZoneClick = (z: Zone) => {
    if (onSelectZone) onSelectZone(z);
    setSelectedZone(z);
  };

  return (
    <div className={`relative w-full ${fullHeight ? 'h-[calc(100vh-8rem)]' : 'h-[540px]'} rounded-xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950`}>
      {/* Search & Basemap bar */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search district or slope..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900/90 backdrop-blur border border-slate-700 text-xs text-white pl-8 pr-3 py-1.5 rounded-lg w-56 focus:outline-none focus:ring-1 focus:ring-rose-500 shadow-lg"
          />
        </form>

        <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-1 flex items-center space-x-1 shadow-lg text-[11px]">
          <button
            onClick={() => setTileProvider('dark')}
            className={`px-2 py-1 rounded font-semibold transition ${tileProvider === 'dark' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Tactical Dark
          </button>
          <button
            onClick={() => setTileProvider('topo')}
            className={`px-2 py-1 rounded font-semibold transition ${tileProvider === 'topo' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Terrain DEM
          </button>
          <button
            onClick={() => setTileProvider('satellite')}
            className={`px-2 py-1 rounded font-semibold transition ${tileProvider === 'satellite' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Layer Visibility Toggle Panel */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-2.5 shadow-lg text-xs space-y-1.5">
        <div className="flex items-center space-x-1 font-bold text-slate-200 mb-1 border-b border-slate-800 pb-1">
          <Layers className="w-3.5 h-3.5 text-rose-400" />
          <span>GIS Layers</span>
        </div>
        <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={activeLayers.zones}
            onChange={(e) => setActiveLayers(p => ({ ...p, zones: e.target.checked }))}
            className="rounded text-rose-600 focus:ring-0"
          />
          <span>Slope Risk Zones</span>
        </label>
        <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={activeLayers.roads}
            onChange={(e) => setActiveLayers(p => ({ ...p, roads: e.target.checked }))}
            className="rounded text-rose-600 focus:ring-0"
          />
          <span>Lifeline Highways (NH)</span>
        </label>
        <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={activeLayers.sensors}
            onChange={(e) => setActiveLayers(p => ({ ...p, sensors: e.target.checked }))}
            className="rounded text-rose-600 focus:ring-0"
          />
          <span>IoT Geotech Sensors</span>
        </label>
        <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={activeLayers.reports}
            onChange={(e) => setActiveLayers(p => ({ ...p, reports: e.target.checked }))}
            className="rounded text-rose-600 focus:ring-0"
          />
          <span>Field & Citizen Alerts</span>
        </label>
        <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={activeLayers.infrastructure}
            onChange={(e) => setActiveLayers(p => ({ ...p, infrastructure: e.target.checked }))}
            className="rounded text-rose-600 focus:ring-0"
          />
          <span>Critical Facilities</span>
        </label>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-2.5 shadow-lg text-[11px] space-y-1">
        <span className="font-bold text-slate-300 block mb-1">Risk Classification</span>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="text-slate-300">CRITICAL (≥ 80%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-slate-300">HIGH (60–79%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-300">MODERATE (35–59%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-300">LOW (&lt; 35%)</span>
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        <TileLayer url={tileUrls[tileProvider]} />

        {/* 1. Slope Risk Zones */}
        {activeLayers.zones && zones.map((z) => {
          const color = getRiskColor(z.current_risk_level);
          return (
            <React.Fragment key={`zone-${z.id}`}>
              {/* Outer halo */}
              <CircleMarker
                center={[z.center_lat, z.center_lng]}
                radius={24}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: z.current_risk_level === 'CRITICAL' ? 0.4 : 0.25,
                  weight: z.current_risk_level === 'CRITICAL' ? 3 : 1.5,
                  dashArray: z.current_risk_level === 'CRITICAL' ? '4, 4' : undefined
                }}
                eventHandlers={{
                  click: () => handleZoneClick(z)
                }}
              >
                <Popup className="custom-popup">
                  <div className="text-slate-900 p-2 min-w-[240px]">
                    <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                      <span className="font-bold text-sm text-slate-950">{z.name}</span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-black text-white"
                        style={{ backgroundColor: color }}
                      >
                        {z.current_risk_level} ({z.current_risk_score}%)
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-2">
                      <strong>District:</strong> {z.district_name} | <strong>Slope:</strong> {z.slope_angle}°
                    </p>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-100 p-1.5 rounded mb-2">
                      <div>Rainfall 24h: <strong>{z.rainfall_24h} mm</strong></div>
                      <div>Soil Saturation: <strong>{z.soil_moisture}%</strong></div>
                      <div>Elevation: <strong>{z.elevation} m</strong></div>
                      <div>Past Slides: <strong>{z.historical_incidents_count}</strong></div>
                    </div>

                    {z.ai_prediction_summary && (
                      <p className="text-[11px] text-rose-800 font-semibold mb-2 bg-rose-50 p-1.5 rounded border border-rose-200">
                        ⚡ AI Window: {z.ai_prediction_summary}
                      </p>
                    )}

                    <button
                      onClick={() => handleZoneClick(z)}
                      className="w-full py-1 rounded bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 flex items-center justify-center space-x-1"
                    >
                      <span>View Detailed Analysis</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}

        {/* 2. Road Network Corridors */}
        {activeLayers.roads && roads.map((r) => {
          if (!r.coordinates_geojson?.coordinates) return null;
          const coords = r.coordinates_geojson.coordinates as [number, number][];
          const color = getRoadColor(r.status);
          return (
            <Polyline
              key={`road-${r.id}`}
              positions={coords}
              pathOptions={{
                color: color,
                weight: r.status === 'BLOCKED' ? 6 : 4,
                opacity: 0.9,
                dashArray: r.status === 'BLOCKED' ? '6, 6' : undefined
              }}
            >
              <Popup>
                <div className="p-1 text-slate-900 text-xs">
                  <div className="font-bold text-sm text-slate-950 flex items-center justify-between mb-1">
                    <span>{r.route_number}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: color }}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-1">{r.name}</p>
                  {r.blockage_reason && (
                    <p className="text-rose-700 font-semibold mb-1">
                      Reason: {r.blockage_reason}
                    </p>
                  )}
                  {r.alternative_route && (
                    <p className="text-slate-700 bg-amber-50 p-1 rounded border border-amber-200 text-[11px]">
                      <strong>Detour:</strong> {r.alternative_route}
                    </p>
                  )}
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* 3. IoT Sensors */}
        {activeLayers.sensors && sensors.map((s) => {
          const sensorIcon = createDivIcon(
            s.status === 'ONLINE' ? '#10B981' : s.status === 'WARNING' ? '#F59E0B' : '#EF4444',
            '📡'
          );
          return (
            <Marker
              key={`sensor-${s.id}`}
              position={[s.latitude, s.longitude]}
              icon={sensorIcon}
            >
              <Popup>
                <div className="p-1 text-slate-900 text-xs">
                  <div className="font-bold text-slate-950 flex items-center justify-between mb-1">
                    <span>{s.name}</span>
                    <span className="text-[10px] font-bold text-slate-600">{s.status}</span>
                  </div>
                  <p className="text-slate-500 font-mono text-[10px] mb-1">{s.sensor_code}</p>
                  <div className="bg-slate-100 p-1.5 rounded space-y-0.5 text-[11px]">
                    <div>Soil Moisture: <strong>{s.soil_moisture}%</strong></div>
                    <div>Battery: <strong>{s.battery_level}%</strong></div>
                    <div>Pore Pressure: <strong>{s.pore_water_pressure_kpa} kPa</strong></div>
                    <div>Tilt Angle: <strong>{s.tilt_degrees}°</strong></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 4. Citizen & Field Incident Reports */}
        {activeLayers.reports && reports.map((rep) => {
          const reportIcon = createDivIcon(
            rep.severity === 'CRITICAL' ? '#EF4444' : '#F97316',
            '⚠️'
          );
          return (
            <Marker
              key={`report-${rep.id}`}
              position={[rep.latitude, rep.longitude]}
              icon={reportIcon}
            >
              <Popup>
                <div className="p-1 text-slate-900 text-xs max-w-[220px]">
                  <div className="font-bold text-slate-950 flex items-center justify-between mb-1">
                    <span>{rep.report_type}</span>
                    <span className="text-[10px] font-bold text-rose-600">{rep.severity}</span>
                  </div>
                  <p className="text-slate-700 italic mb-1.5 line-clamp-3">"{rep.description}"</p>
                  {rep.ai_assessed_type && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded p-1 text-[10px] text-indigo-900 mb-1">
                      <strong>AI Diagnosis:</strong> {rep.ai_assessed_type}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500">By {rep.reporter_name} ({rep.reporter_role})</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 5. Critical Infrastructure */}
        {activeLayers.infrastructure && infrastructure.map((inf) => {
          const infraIcon = createDivIcon('#3B82F6', inf.type === 'HOSPITAL' ? '🏥' : '🌉');
          return (
            <Marker
              key={`infra-${inf.id}`}
              position={[inf.latitude, inf.longitude]}
              icon={infraIcon}
            >
              <Popup>
                <div className="p-1 text-slate-900 text-xs">
                  <div className="font-bold text-slate-950 mb-0.5">{inf.name}</div>
                  <p className="text-slate-600 text-[11px] mb-1">{inf.type} • {inf.status}</p>
                  {inf.capacity && <p className="text-[11px] text-slate-700">Capacity: {inf.capacity}</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
