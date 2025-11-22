import { Location } from '../types';

interface RoutePoint {
  lat: number;
  lng: number;
}

interface RouteResponse {
  routes: Array<{
    geometry: {
      coordinates: Array<[number, number]>;
    };
    distance: number;
    duration: number;
  }>;
}

// Cache for routes to avoid excessive API calls
const routeCache = new Map<string, RoutePoint[]>();

const getCacheKey = (start: Location, end: Location): string => {
  return `${start.lat.toFixed(5)},${start.lng.toFixed(5)}-${end.lat.toFixed(5)},${end.lng.toFixed(5)}`;
};

/**
 * Fetch route coordinates from OSRM (Open Source Routing Machine)
 * Returns array of coordinates representing the actual road route
 */
export const getRouteCoordinates = async (
  start: Location,
  end: Location
): Promise<RoutePoint[]> => {
  const cacheKey = getCacheKey(start, end);
  
  // Check cache first
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  try {
    // Use OSRM API - free public service
    // Format: lng,lat (note the order!)
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    const data = (await response.json()) as RouteResponse;

    if (data.routes && data.routes.length > 0) {
      const coordinates = data.routes[0].geometry.coordinates.map(coord => ({
        lat: coord[1],
        lng: coord[0]
      }));
      
      // Cache the result
      routeCache.set(cacheKey, coordinates);
      return coordinates;
    }
  } catch (error) {
    console.warn('Failed to fetch route from OSRM, using straight line:', error);
  }

  // Fallback: return straight line if API fails
  return [start, end];
};

/**
 * Calculate next position along a route path
 * Returns the next location and whether we've reached the destination
 */
export const getNextPositionAlongRoute = (
  currentLocation: Location,
  routePath: RoutePoint[],
  speed: number
): { nextLocation: Location; routePath: RoutePoint[]; arrived: boolean } => {
  if (routePath.length < 2) {
    return {
      nextLocation: currentLocation,
      routePath,
      arrived: true
    };
  }

  // Find closest point on route to current location
  let closestIndex = 0;
  let closestDistance = Infinity;

  for (let i = 0; i < routePath.length; i++) {
    const dx = routePath[i].lng - currentLocation.lng;
    const dy = routePath[i].lat - currentLocation.lat;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = i;
    }
  }

  // Move to next waypoint
  const nextWaypoint = routePath[closestIndex + 1] || routePath[closestIndex];
  const currentWaypoint = routePath[closestIndex];

  const dx = nextWaypoint.lng - currentWaypoint.lng;
  const dy = nextWaypoint.lat - currentWaypoint.lat;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < speed) {
    // Move to next point and continue with remaining speed
    const remainingSpeed = speed - distance;
    const remainingPath = routePath.slice(closestIndex + 1);
    
    if (remainingPath.length === 0) {
      return {
        nextLocation: nextWaypoint,
        routePath: [],
        arrived: true
      };
    }

    return getNextPositionAlongRoute(nextWaypoint, remainingPath, remainingSpeed);
  }

  // Move along current segment
  const nextLocation = {
    lat: currentWaypoint.lat + (dy / distance) * speed,
    lng: currentWaypoint.lng + (dx / distance) * speed
  };

  return {
    nextLocation,
    routePath,
    arrived: false
  };
};
