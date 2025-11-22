import { Location } from '../types';

// Calculate distance between two points using Haversine formula
export const calculateDistance = (loc1: Location, loc2: Location): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Average urban ambulance speed: 50 km/h (accounting for traffic)
const AVERAGE_AMBULANCE_SPEED_KMH = 50;

/**
 * Calculate estimated time of arrival in minutes
 * @param ambulanceLocation - Current location of the ambulance
 * @param incidentLocation - Location of the incident
 * @returns Estimated time of arrival in minutes
 */
export const calculateETA = (ambulanceLocation: Location, incidentLocation: Location): number => {
  const distanceKm = calculateDistance(ambulanceLocation, incidentLocation);
  const timeHours = distanceKm / AVERAGE_AMBULANCE_SPEED_KMH;
  const timeMinutes = Math.ceil(timeHours * 60);
  return Math.max(1, timeMinutes); // Minimum 1 minute
};

/**
 * Calculate ETA considering ambulance speed reduction during en route
 * Used for real-time ETA updates
 */
export const calculateRealtimeETA = (
  ambulanceLocation: Location,
  destination: Location,
  currentSpeed: number = AVERAGE_AMBULANCE_SPEED_KMH
): number => {
  const distanceKm = calculateDistance(ambulanceLocation, destination);
  const timeHours = distanceKm / currentSpeed;
  const timeMinutes = Math.ceil(timeHours * 60);
  return Math.max(1, timeMinutes);
};

/**
 * Get ETA description string
 */
export const getETADescription = (etaMinutes: number): string => {
  if (etaMinutes < 1) return 'Arriving now';
  if (etaMinutes === 1) return '1 minute away';
  if (etaMinutes <= 5) return `${etaMinutes} minutes away`;
  if (etaMinutes <= 15) return `~${etaMinutes} minutes`;
  return `${etaMinutes} minutes`;
};
