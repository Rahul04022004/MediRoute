import { Ambulance, Incident, IncidentStatus } from '../types';

export interface AnalyticsMetrics {
  totalIncidents: number;
  resolvedIncidents: number;
  averageResponseTime: number; // in minutes
  incidentResolutionRate: number; // percentage
  dispatchEfficiency: number; // percentage (incidents with assigned ambulance / total)
  averageIncidentDuration: number; // in minutes
  byAmbulance: Record<string, AmbulanceMetrics>;
  peakHours: PeakHourData[];
  incidentHeatmap: HeatmapPoint[];
}

export interface AmbulanceMetrics {
  ambulanceId: string;
  totalDispatches: number;
  averageResponseTime: number;
  incidentsResolved: number;
  totalTravelDistance: number; // in km
  utilizationRate: number; // percentage
}

export interface PeakHourData {
  hour: number; // 0-23
  incidentCount: number;
  averageResponseTime: number;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number; // 0-1, based on incident frequency
}

/**
 * Calculate all analytics metrics
 */
export const calculateAnalytics = (ambulances: Ambulance[], incidents: Incident[]): AnalyticsMetrics => {
  const totalIncidents = incidents.length;
  const resolvedIncidents = incidents.filter(i => i.status === IncidentStatus.Resolved || i.status === IncidentStatus.Archived).length;
  const dispatchedIncidents = incidents.filter(i => i.assignedAmbulanceId).length;

  // Average response time
  const incidentsWithETA = incidents.filter(i => i.etaMinutes !== undefined);
  const averageResponseTime = incidentsWithETA.length > 0
    ? incidentsWithETA.reduce((sum, i) => sum + (i.etaMinutes || 0), 0) / incidentsWithETA.length
    : 0;

  // Incident resolution rate
  const incidentResolutionRate = totalIncidents > 0 ? (resolvedIncidents / totalIncidents) * 100 : 0;

  // Dispatch efficiency
  const dispatchEfficiency = totalIncidents > 0 ? (dispatchedIncidents / totalIncidents) * 100 : 0;

  // Average incident duration
  const resolvedWithDuration = incidents.filter(
    i => (i.status === IncidentStatus.Resolved || i.status === IncidentStatus.Archived) && i.createdAt && i.resolvedAt
  );
  const averageIncidentDuration = resolvedWithDuration.length > 0
    ? resolvedWithDuration.reduce((sum, i) => sum + ((i.resolvedAt || 0) - i.createdAt) / 60000, 0) / resolvedWithDuration.length
    : 0;

  // Per-ambulance metrics
  const byAmbulance: Record<string, AmbulanceMetrics> = {};
  ambulances.forEach(amb => {
    const ambIncidents = incidents.filter(i => i.assignedAmbulanceId === amb.id);
    const resolvedByAmb = ambIncidents.filter(
      i => i.status === IncidentStatus.Resolved || i.status === IncidentStatus.Archived
    );

    const ambWithETA = ambIncidents.filter(i => i.etaMinutes !== undefined);
    const ambAvgResponseTime = ambWithETA.length > 0
      ? ambWithETA.reduce((sum, i) => sum + (i.etaMinutes || 0), 0) / ambWithETA.length
      : 0;

    byAmbulance[amb.id] = {
      ambulanceId: amb.id,
      totalDispatches: ambIncidents.length,
      averageResponseTime: ambAvgResponseTime,
      incidentsResolved: resolvedByAmb.length,
      totalTravelDistance: 0, // Would need distance calculation
      utilizationRate: ambulances.length > 0 ? (ambIncidents.length / totalIncidents) * 100 : 0,
    };
  });

  // Peak hours analysis
  const peakHours: PeakHourData[] = [];
  const hourlyData: Record<number, { count: number; totalETA: number; etaCount: number }> = {};

  incidents.forEach(inc => {
    const hour = new Date(inc.createdAt).getHours();
    if (!hourlyData[hour]) {
      hourlyData[hour] = { count: 0, totalETA: 0, etaCount: 0 };
    }
    hourlyData[hour].count++;
    if (inc.etaMinutes) {
      hourlyData[hour].totalETA += inc.etaMinutes;
      hourlyData[hour].etaCount++;
    }
  });

  for (let hour = 0; hour < 24; hour++) {
    const data = hourlyData[hour];
    peakHours.push({
      hour,
      incidentCount: data?.count || 0,
      averageResponseTime: data && data.etaCount > 0 ? data.totalETA / data.etaCount : 0,
    });
  }

  // Heatmap generation (grid-based incident concentration)
  const incidentHeatmap: HeatmapPoint[] = generateHeatmap(incidents);

  return {
    totalIncidents,
    resolvedIncidents,
    averageResponseTime,
    incidentResolutionRate,
    dispatchEfficiency,
    averageIncidentDuration,
    byAmbulance,
    peakHours,
    incidentHeatmap,
  };
};

/**
 * Generate heatmap data based on incident locations
 */
const generateHeatmap = (incidents: Incident[]): HeatmapPoint[] => {
  if (incidents.length === 0) return [];

  // Create a grid with 0.05 degree cells (roughly 5.5km at equator)
  const gridSize = 0.05;
  const grid: Record<string, number> = {};

  incidents.forEach(inc => {
    const gridLat = Math.floor(inc.location.lat / gridSize) * gridSize;
    const gridLng = Math.floor(inc.location.lng / gridSize) * gridSize;
    const key = `${gridLat},${gridLng}`;
    grid[key] = (grid[key] || 0) + 1;
  });

  // Find max incidents to normalize intensity
  const maxIncidents = Math.max(...Object.values(grid));

  // Convert to heatmap points
  return Object.entries(grid).map(([key, count]) => {
    const [lat, lng] = key.split(',').map(Number);
    return {
      lat: lat + gridSize / 2,
      lng: lng + gridSize / 2,
      intensity: maxIncidents > 0 ? count / maxIncidents : 0,
    };
  });
};

/**
 * Get ambulance performance ranking
 */
export const getAmbulanceRanking = (metrics: AnalyticsMetrics): Array<{ ambulanceId: string; score: number }> => {
  return Object.values(metrics.byAmbulance)
    .map(amb => ({
      ambulanceId: amb.ambulanceId,
      score:
        (amb.incidentsResolved / Math.max(1, amb.totalDispatches)) * 50 + // 50% resolution rate
        Math.max(0, (10 - amb.averageResponseTime) / 10) * 30 + // 30% response time (lower is better)
        (amb.utilizationRate / 100) * 20, // 20% utilization
    }))
    .sort((a, b) => b.score - a.score);
};

/**
 * Get peak incident hours
 */
export const getPeakIncidentHours = (peakHours: PeakHourData[]): PeakHourData[] => {
  return [...peakHours]
    .sort((a, b) => b.incidentCount - a.incidentCount)
    .slice(0, 5);
};

/**
 * Get high-incident zones
 */
export const getHighIncidentZones = (heatmap: HeatmapPoint[]): HeatmapPoint[] => {
  return heatmap
    .filter(p => p.intensity > 0.5)
    .sort((a, b) => b.intensity - a.intensity);
};
