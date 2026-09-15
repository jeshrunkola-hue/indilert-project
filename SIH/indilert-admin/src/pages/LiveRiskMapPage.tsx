import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { District, Zone, Road, Sensor, CitizenReport, Infrastructure } from '../types';
import { NERMap } from '../maps/NERMap';
import { ZoneDetailModal } from '../components/ZoneDetailModal';
import { Layers, Search, Filter, RefreshCw, AlertTriangle } from 'lucide-react';

export const LiveRiskMapPage: React.FC = () => {
  const { selectedZone, setSelectedZone, refreshKey, triggerRefresh } = useApp();
  const [districts, setDistricts] = useState<District[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [roads, setRoads] = useState<Road[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [infrastructure, setInfrastructure] = useState<Infrastructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  useEffect(() => {
    const loadMapData = async () => {
      try {
        const [dList, zList, rList, sList, repList, infList] = await Promise.all([
          api.getDistricts(),
          api.getZones(),
          api.getRoads(),
          api.getSensors(),
          api.getReports(),
          api.getInfrastructure()
        ]);
        setDistricts(dList);
        setZones(zList);
        setRoads(rList);
        setSensors(sList);
        setReports(repList);
        setInfrastructure(infList);
      } catch (err) {
        console.error('Error loading GIS map data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMapData();
  }, [refreshKey]);

  const filteredZones = riskFilter === 'ALL'
    ? zones
    : zones.filter(z => z.current_risk_level === riskFilter);

  return (
    <div className="space-y-3">
      {/* Top Map Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-base font-bold text-white flex items-center space-x-2">
            <span>NER Geotechnical & Landslide Hazard GIS Map</span>
          </h1>
          <p className="text-xs text-slate-400">
            Click any colored risk zone, sensor, or road for full multi-factor geotechnical telemetry
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Risk Filter */}
          <div className="flex items-center space-x-1 bg-slate-800 rounded-lg p-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <button
              onClick={() => setRiskFilter('ALL')}
              className={`px-2 py-0.5 rounded font-bold ${riskFilter === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              All ({zones.length})
            </button>
            <button
              onClick={() => setRiskFilter('CRITICAL')}
              className={`px-2 py-0.5 rounded font-bold ${riskFilter === 'CRITICAL' ? 'bg-rose-600 text-white' : 'text-rose-400 hover:text-white'}`}
            >
              Critical
            </button>
            <button
              onClick={() => setRiskFilter('HIGH')}
              className={`px-2 py-0.5 rounded font-bold ${riskFilter === 'HIGH' ? 'bg-orange-600 text-white' : 'text-orange-400 hover:text-white'}`}
            >
              High
            </button>
          </div>

          <button
            onClick={triggerRefresh}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh GIS Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Map */}
      <NERMap
        districts={districts}
        zones={filteredZones}
        roads={roads}
        sensors={sensors}
        reports={reports}
        infrastructure={infrastructure}
        onSelectZone={(z) => setSelectedZone(z)}
        fullHeight={true}
      />

      {/* Detail Modal / Drawer */}
      {selectedZone && (
        <ZoneDetailModal
          zone={selectedZone}
          onClose={() => setSelectedZone(null)}
          roads={roads}
          villages={[]}
          infrastructure={infrastructure}
        />
      )}
    </div>
  );
};
