import React, { useMemo } from 'react';
import { Ambulance, Incident } from '../types';
import { calculateAnalytics, getAmbulanceRanking, getPeakIncidentHours, getHighIncidentZones } from '../services/analyticsService';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface AnalyticsDashboardProps {
  ambulances: Ambulance[];
  incidents: Incident[];
}

const MetricCard: React.FC<{ label: string; value: string | number; unit?: string; icon: string; trend?: number; accentColor?: string }> = ({
  label,
  value,
  unit,
  icon,
  trend,
  accentColor = 'text-cyan-400',
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, y: -4 }}
    className="bg-white/5 backdrop-blur-sm rounded-lg p-5 border border-white/10 hover:border-white/20 transition-all"
  >
    <div className="flex justify-between items-start mb-3">
      <span className="text-3xl">{icon}</span>
      {trend !== undefined && (
        <span className={clsx('text-xs font-bold px-2 py-1 rounded', trend > 0 ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20')}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">{label}</p>
    <div className="flex items-baseline gap-2">
      <p className={clsx('text-3xl font-bold', accentColor)}>{typeof value === 'number' ? value.toFixed(1) : value}</p>
      {unit && <span className="text-gray-400 text-sm">{unit}</span>}
    </div>
  </motion.div>
);

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ ambulances, incidents }) => {
  const metrics = useMemo(() => calculateAnalytics(ambulances, incidents), [ambulances, incidents]);
  const ambulanceRanking = useMemo(() => getAmbulanceRanking(metrics), [metrics]);
  const peakHours = useMemo(() => getPeakIncidentHours(metrics.peakHours), [metrics.peakHours]);
  const highIncidentZones = useMemo(() => getHighIncidentZones(metrics.incidentHeatmap), [metrics.incidentHeatmap]);

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Total Incidents"
            value={metrics.totalIncidents}
            icon="📊"
            accentColor="text-blue-400"
          />
          <MetricCard
            label="Resolution Rate"
            value={metrics.incidentResolutionRate}
            unit="%"
            icon="✓"
            accentColor="text-green-400"
            trend={metrics.incidentResolutionRate > 50 ? 15 : -5}
          />
          <MetricCard
            label="Avg Response Time"
            value={metrics.averageResponseTime}
            unit="min"
            icon="⏱"
            accentColor="text-orange-400"
          />
          <MetricCard
            label="Dispatch Efficiency"
            value={metrics.dispatchEfficiency}
            unit="%"
            icon="🚨"
            accentColor="text-cyan-400"
          />
        </div>
      </section>

      {/* Ambulance Performance */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Top Performers</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ambulanceRanking.slice(0, 6).map((ranking, idx) => {
            const ambMetrics = metrics.byAmbulance[ranking.ambulanceId];
            return (
              <motion.div
                key={ranking.ambulanceId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cyan-500/30 rounded-full flex items-center justify-center text-xs font-bold text-cyan-400">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-white">{ranking.ambulanceId}</p>
                      <p className="text-xs text-gray-400">Performance Score</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">{ranking.score.toFixed(1)}</p>
                </div>

                <div className="space-y-2 text-sm mb-3 border-t border-white/10 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dispatches:</span>
                    <span className="text-white font-semibold">{ambMetrics.totalDispatches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Resolved:</span>
                    <span className="text-green-400 font-semibold">{ambMetrics.incidentsResolved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Response:</span>
                    <span className="text-white font-semibold">{ambMetrics.averageResponseTime.toFixed(1)} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Utilization:</span>
                    <span className="text-cyan-400 font-semibold">{ambMetrics.utilizationRate.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ranking.score * 10)}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Peak Hours & High Incident Zones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Peak Incident Hours</h2>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 space-y-3 max-h-80 overflow-y-auto">
            {peakHours.length > 0 ? (
              peakHours.map((hour, idx) => (
                <motion.div
                  key={hour.hour}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-12 text-sm font-bold text-cyan-400 flex-shrink-0">
                    {hour.hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="flex-grow">
                    <div className="w-full bg-white/10 rounded-full h-5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (hour.incidentCount / Math.max(1, peakHours[0].incidentCount)) * 100)}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.05 }}
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-end pr-2"
                      >
                        {hour.incidentCount > 0 && (
                          <span className="text-xs font-bold text-white">{hour.incidentCount}</span>
                        )}
                      </motion.div>
                    </div>
                  </div>
                  <div className="text-right w-20 flex-shrink-0">
                    <p className="text-xs text-gray-400">{hour.averageResponseTime.toFixed(1)}m</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-6">No incident data</p>
            )}
          </div>
        </section>

        {/* High Incident Zones */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">High-Risk Zones</h2>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 space-y-2 max-h-80 overflow-y-auto">
            {highIncidentZones.length > 0 ? (
              highIncidentZones.map((zone, idx) => (
                <motion.div
                  key={`${zone.lat}-${zone.lng}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-2 p-2 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: `rgba(255, 0, 127, ${zone.intensity})`,
                      boxShadow: `0 0 ${zone.intensity * 8}px rgba(255, 0, 127, ${zone.intensity * 0.6})`,
                    }}
                  />
                  <div className="flex-grow min-w-0">
                    <p className="text-xs text-gray-300 font-mono truncate">
                      {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}
                    </p>
                    <p className="text-xs text-gray-500">Risk: {(zone.intensity * 100).toFixed(0)}%</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-10 h-4 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${zone.intensity * 100}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-pink-500"
                      />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-6">No high-risk zones</p>
            )}
          </div>
        </section>
      </div>

      {/* Additional Stats */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">Summary Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg p-5 border border-white/10"
          >
            <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Avg Incident Duration</p>
            <p className="text-3xl font-bold text-orange-400">{metrics.averageIncidentDuration.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">minutes</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg p-5 border border-white/10"
          >
            <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Resolved Incidents</p>
            <p className="text-3xl font-bold text-green-400">{metrics.resolvedIncidents}</p>
            <p className="text-xs text-gray-500 mt-1">of {metrics.totalIncidents} total</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg p-5 border border-white/10"
          >
            <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Active Ambulances</p>
            <p className="text-3xl font-bold text-cyan-400">{ambulances.length}</p>
            <p className="text-xs text-gray-500 mt-1">in service</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsDashboard;
