

import { useState, useEffect, useRef } from 'react';
import { Ambulance, Incident, AmbulanceStatus, VehicleType, IncidentPriority, IncidentStatus, Location, Hospital } from '../types';
import { calculateETA } from '../services/etaService';
import { getRouteCoordinates, getNextPositionAlongRoute } from '../services/routingService';

const generateInitialAmbulances = (centerLocation: Location): Ambulance[] => {
  const ambulances: Ambulance[] = [];
  const offset = 0.02; // Approx 2km offset at equator
  
  return [
    { id: 'AMB-001', location: { lat: centerLocation.lat + offset, lng: centerLocation.lng }, status: AmbulanceStatus.Available, vehicleType: VehicleType.ALS, capacity: 2, currentPatients: 0 },
    { id: 'AMB-002', location: { lat: centerLocation.lat, lng: centerLocation.lng + offset }, status: AmbulanceStatus.Available, vehicleType: VehicleType.BLS, capacity: 1, currentPatients: 0 },
    { id: 'AMB-003', location: { lat: centerLocation.lat - offset, lng: centerLocation.lng }, status: AmbulanceStatus.AtHospital, vehicleType: VehicleType.ALS, capacity: 2, currentPatients: 0 },
    { id: 'AMB-004', location: { lat: centerLocation.lat, lng: centerLocation.lng - offset }, status: AmbulanceStatus.Available, vehicleType: VehicleType.BLS, capacity: 1, currentPatients: 0 },
    { id: 'AMB-005', location: { lat: centerLocation.lat + offset / 2, lng: centerLocation.lng + offset / 2 }, status: AmbulanceStatus.Available, vehicleType: VehicleType.ALS, capacity: 2, currentPatients: 0 },
    { id: 'AMB-006', location: { lat: centerLocation.lat - offset / 2, lng: centerLocation.lng - offset / 2 }, status: AmbulanceStatus.Available, vehicleType: VehicleType.ALS, capacity: 2, currentPatients: 0 },
  ];
};

const INITIAL_AMBULANCES: Ambulance[] = [
  { id: 'AMB-001', location: { lat: 34.05, lng: -118.25 }, status: AmbulanceStatus.Available, vehicleType: VehicleType.ALS, capacity: 2, currentPatients: 0 },
  { id: 'AMB-002', location: { lat: 34.06, lng: -118.23 }, status: AmbulanceStatus.Available, vehicleType: VehicleType.BLS, capacity: 1, currentPatients: 0 },
  { id: 'AMB-003', location: { lat: 34.04, lng: -118.26 }, status: AmbulanceStatus.AtHospital, vehicleType: VehicleType.ALS, capacity: 2, currentPatients: 0 },
  { id: 'AMB-004', location: { lat: 34.07, lng: -118.28 }, status: AmbulanceStatus.Available, vehicleType: VehicleType.BLS, capacity: 1, currentPatients: 0 },
  { id: 'AMB-005', location: { lat: 34.03, lng: -118.22 }, status: AmbulanceStatus.Available, vehicleType: VehicleType.ALS, capacity: 2, currentPatients: 0 },
  { id: 'AMB-006', location: { lat: 34.08, lng: -118.21 }, status: AmbulanceStatus.Available, vehicleType: VehicleType.ALS, capacity: 2, currentPatients: 0 },
];

const generateHospitals = (centerLocation: Location): Hospital[] => {
  const offset = 0.03; // Approx 3km offset at equator
  return [
    { id: 'H-001', name: 'General Hospital', location: { lat: centerLocation.lat + offset, lng: centerLocation.lng - offset / 2 }, totalBeds: 50, availableBeds: 35 },
    { id: 'H-002', name: 'City Medical Center', location: { lat: centerLocation.lat - offset, lng: centerLocation.lng + offset / 2 }, totalBeds: 40, availableBeds: 28 },
  ];
};

const HOSPITALS: Location[] = [
    { lat: 34.07, lng: -118.24 }, // General Hospital
    { lat: 34.02, lng: -118.27 }, // City Medical Center
];

const generateHospitals2 = (centerLocation: Location): Location[] => {
  const offset = 0.03; // Approx 3km offset at equator
  return [
    { lat: centerLocation.lat + offset, lng: centerLocation.lng - offset / 2 }, // General Hospital
    { lat: centerLocation.lat - offset, lng: centerLocation.lng + offset / 2 }, // City Medical Center
  ];
};

const findClosestHospital = (location: Location, hospitals: Location[]) => {
    let closestHospital = hospitals[0];
    let minDistance = Infinity;
    for (const hospital of hospitals) {
        const distance = Math.sqrt(Math.pow(hospital.lat - location.lat, 2) + Math.pow(hospital.lng - location.lng, 2));
        if (distance < minDistance) {
            minDistance = distance;
            closestHospital = hospital;
        }
    }
    return closestHospital;
};

// Speed in degrees per second (approximate)
const AMBULANCE_SPEED = 0.0005;

// Track which ambulances are fetching routes to avoid duplicate calls
const routeFetchingRef = new Map<string, Promise<Array<{ lat: number; lng: number }>>>(); 

export const useAmbulanceData = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [ambulances, setAmbulances] = useState<Ambulance[]>(INITIAL_AMBULANCES);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const hospitalsRef = useRef<Location[]>(HOSPITALS);
  const hospitalsDataRef = useRef<Hospital[]>([]);
  
  // Use a ref to store timers for each ambulance to manage timed state transitions
  // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> for browser compatibility.
  const statusTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Get user location and initialize ambulances
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(userLoc);
        setAmbulances(generateInitialAmbulances(userLoc));
        hospitalsRef.current = generateHospitals2(userLoc);
        const generatedHospitals = generateHospitals(userLoc);
        hospitalsDataRef.current = generatedHospitals;
        setHospitals(generatedHospitals);
        setLoading(false);
      },
      () => {
        // Fallback to LA if geolocation fails
        const fallbackLoc = { lat: 34.0522, lng: -118.2437 };
        setUserLocation(fallbackLoc);
        setAmbulances(generateInitialAmbulances(fallbackLoc));
        hospitalsRef.current = generateHospitals2(fallbackLoc);
        const generatedHospitals = generateHospitals(fallbackLoc);
        hospitalsDataRef.current = generatedHospitals;
        setHospitals(generatedHospitals);
        setLoading(false);
      }
    );
  }, []);
  
  const moveAmbulance = (amb: Ambulance): Ambulance => {
    if (amb.status !== AmbulanceStatus.EnRoute || !amb.destination) {
      return amb;
    }

    // If no route path, use straight line (fallback)
    if (!amb.routePath || amb.routePath.length === 0) {
      const { location, destination } = amb;
      const latDiff = destination.lat - location.lat;
      const lngDiff = destination.lng - location.lng;
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

      if (distance < AMBULANCE_SPEED) {
        return { ...amb, location: destination, routePath: [] }; // Arrived
      }

      const newLat = location.lat + (latDiff / distance) * AMBULANCE_SPEED;
      const newLng = location.lng + (lngDiff / distance) * AMBULANCE_SPEED;
      return { ...amb, location: { lat: newLat, lng: newLng } };
    }

    // Move along the route path
    const { nextLocation, routePath, arrived } = getNextPositionAlongRoute(
      amb.location,
      amb.routePath,
      AMBULANCE_SPEED
    );

    return {
      ...amb,
      location: nextLocation,
      routePath: arrived ? [] : routePath
    };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAmbulances(prevAmbulances =>
        prevAmbulances.map(amb => {
          const movedAmb = moveAmbulance(amb);
          
          // Check for arrival and update status
          if (movedAmb.status === AmbulanceStatus.EnRoute && movedAmb.destination &&
              (!movedAmb.routePath || movedAmb.routePath.length === 0) &&
              movedAmb.location.lat === movedAmb.destination.lat &&
              movedAmb.location.lng === movedAmb.destination.lng) {

            // If it was heading to an incident, it's now busy at the scene
            if (movedAmb.assignedIncidentId) {
              const updatedAmb = { ...movedAmb, status: AmbulanceStatus.Busy };
              
              // Set timer to leave scene and go to hospital
              clearTimeout(statusTimers.current[amb.id]);
              statusTimers.current[amb.id] = setTimeout(() => {
                  setAmbulances(currentAmbs => currentAmbs.map(a => {
                      if (a.id === updatedAmb.id) {
                          const hospital = findClosestHospital(a.location, hospitalsRef.current);
                          return { ...a, status: AmbulanceStatus.EnRoute, destination: hospital, routePath: [] };
                      }
                      return a;
                  }));
                  // Clear the incident once ambulance leaves scene
                  setIncidents(currentIncs => currentIncs.filter(i => i.id !== updatedAmb.assignedIncidentId));
              }, 10000); // 10 seconds at scene

              return updatedAmb;
            } 
            // If it was heading to a hospital, it's now 'At Hospital'
            else {
              const updatedAmb = { ...movedAmb, status: AmbulanceStatus.AtHospital, assignedIncidentId: undefined, destination: undefined, routePath: [] };
              
              // Set timer to become available again
              clearTimeout(statusTimers.current[amb.id]);
              statusTimers.current[amb.id] = setTimeout(() => {
                  setAmbulances(currentAmbs => currentAmbs.map(a => 
                      a.id === updatedAmb.id ? { ...a, status: AmbulanceStatus.Available } : a
                  ));
              }, 15000); // 15 seconds at hospital

              return updatedAmb;
            }
          }
          
          return movedAmb;
        })
      );
    }, 1000); // Update every second for smoother movement

    return () => {
        clearInterval(interval);
        Object.values(statusTimers.current).forEach(clearTimeout);
    };
  }, []);

  // Fetch routes for ambulances when they're dispatched
  useEffect(() => {
    ambulances.forEach(amb => {
      if (
        amb.status === AmbulanceStatus.EnRoute &&
        amb.destination &&
        (!amb.routePath || amb.routePath.length === 0)
      ) {
        const routeKey = `${amb.id}-${amb.destination.lat}-${amb.destination.lng}`;
        
        // Avoid fetching the same route multiple times
        if (!routeFetchingRef.has(routeKey)) {
          const routePromise = getRouteCoordinates(amb.location, amb.destination)
            .then(routePath => {
              setAmbulances(prevAmbs =>
                prevAmbs.map(a =>
                  a.id === amb.id ? { ...a, routePath } : a
                )
              );
              routeFetchingRef.delete(routeKey);
            })
            .catch(error => {
              console.error('Failed to fetch route:', error);
              routeFetchingRef.delete(routeKey);
            });
          
          routeFetchingRef.set(routeKey, routePromise);
        }
      }
    });
  }, [ambulances]);

  return { ambulances, setAmbulances, incidents, setIncidents, loading, hospitals, setHospitals };
};