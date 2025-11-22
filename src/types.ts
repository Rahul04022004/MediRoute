
export interface Location {
  lat: number;
  lng: number;
}

export enum AmbulanceStatus {
  Available = 'Available',
  Busy = 'Busy',
  EnRoute = 'En Route',
  AtHospital = 'At Hospital',
}

export enum VehicleType {
  ALS = 'Advanced Life Support',
  BLS = 'Basic Life Support',
}

export interface Ambulance {
  id: string;
  location: Location;
  status: AmbulanceStatus;
  vehicleType: VehicleType;
  destination?: Location;
  assignedIncidentId?: string;
  capacity: number; // Total patient capacity
  currentPatients: number; // Current number of patients
  routePath?: Array<{ lat: number; lng: number }>; // Array of coordinates representing the road route
}

export enum IncidentPriority {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum IncidentStatus {
  Pending = 'Pending',
  Dispatched = 'Dispatched',
  OnScene = 'On Scene',
  Resolved = 'Resolved',
  Archived = 'Archived',
}

export interface Incident {
  id: string;
  location: Location;
  priority: IncidentPriority;
  description: string;
  assignedAmbulanceId?: string;
  status: IncidentStatus;
  createdAt: number; // Timestamp
  resolvedAt?: number; // Timestamp when resolved
  etaMinutes?: number; // Estimated time of arrival in minutes
}

export interface Hospital {
  id: string;
  name: string;
  location: Location;
  totalBeds: number;
  availableBeds: number;
}