import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { Ambulance, Incident, AmbulanceStatus, IncidentPriority, Location, Hospital } from '../types';
import { AmbulanceIcon } from './icons/AmbulanceIcon';
import { IncidentIcon } from './icons/IncidentIcon';
import { HospitalIcon } from './icons/HospitalIcon';

interface MapProps {
  ambulances: Ambulance[];
  incidents: Incident[];
  hospitals?: Hospital[];
  hospitals?: Location[];
  center: Location;
  isSelectingLocation: boolean;
  onMapClick: (location: Location) => void;
  temporaryMarkerLocation: Location | null;
}

const getStatusTextColor = (status: AmbulanceStatus) => {
    switch (status) {
      case AmbulanceStatus.Available: return '#4ade80';
      case AmbulanceStatus.EnRoute: return '#60a5fa';
      case AmbulanceStatus.Busy: return '#facc15';
      case AmbulanceStatus.AtHospital: return '#c084fc';
      default: return '#8b949e';
    }
};
  
const getPriorityTextColor = (priority: IncidentPriority) => {
    switch (priority) {
      case IncidentPriority.Critical: return '#f87171';
      case IncidentPriority.High: return '#fb923c';
      case IncidentPriority.Medium: return '#facc15';
      case IncidentPriority.Low: return '#60a5fa';
      default: return '#8b949e';
    }
};

const Map: React.FC<MapProps> = ({ ambulances, incidents, hospitals, center, isSelectingLocation, onMapClick, temporaryMarkerLocation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const ambulanceLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const incidentLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const hospitalLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const tempMarkerLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const routeLayerRef = useRef<L.LayerGroup>(L.layerGroup());

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
          zoomControl: false,
      }).setView([center.lat, center.lng], 13);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);
      
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
      ambulanceLayerRef.current.addTo(map);
      routeLayerRef.current.addTo(map);
      hospitalLayerRef.current.addTo(map);
      incidentLayerRef.current.addTo(map);
      tempMarkerLayerRef.current.addTo(map);
    }
  }, [center]);

  // Handle location selection mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    const mapContainer = mapContainerRef.current;

    if (!map || !mapContainer) return;

    if (isSelectingLocation) {
      mapContainer.style.cursor = 'crosshair';
      const clickHandler = (e: L.LeafletMouseEvent) => {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      };
      map.on('click', clickHandler);

      return () => {
        map.off('click', clickHandler);
        mapContainer.style.cursor = '';
      };
    } else {
      mapContainer.style.cursor = '';
    }
  }, [isSelectingLocation, onMapClick]);
  
  // Update temporary marker
  useEffect(() => {
    const layer = tempMarkerLayerRef.current;
    layer.clearLayers();
    if (temporaryMarkerLocation) {
       const iconHtml = `<div class="w-6 h-6 rounded-full bg-secondary border-2 border-white animate-pulse shadow-glow-secondary"></div>`;
       const icon = L.divIcon({
        html: iconHtml,
        className: 'bg-transparent border-none',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker([temporaryMarkerLocation.lat, temporaryMarkerLocation.lng], { icon }).addTo(layer);
    }
  }, [temporaryMarkerLocation]);

  // Update ambulance routes
  useEffect(() => {
    const layer = routeLayerRef.current;
    layer.clearLayers();

    ambulances.forEach(amb => {
      if (amb.status === AmbulanceStatus.EnRoute && amb.destination) {
        // Use actual route path if available, otherwise use straight line
        const latLngs: L.LatLngExpression[] = amb.routePath && amb.routePath.length > 0
          ? amb.routePath.map(point => [point.lat, point.lng] as L.LatLngExpression)
          : [
              [amb.location.lat, amb.location.lng],
              [amb.destination.lat, amb.destination.lng]
            ];

        // Main glowing polyline with animation
        const polyline = L.polyline(latLngs, {
          color: '#60a5fa',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 5',
          lineCap: 'round',
          lineJoin: 'round',
          className: 'animate-pulse'
        });

        polyline.addTo(layer);
      }
    });
  }, [ambulances]);

  // Update ambulance markers
  useEffect(() => {
    const layer = ambulanceLayerRef.current;
    layer.clearLayers();

    ambulances.forEach(amb => {
      const iconHtml = ReactDOMServer.renderToString(
          <AmbulanceIcon style={{ color: getStatusTextColor(amb.status), width: '32px', height: '32px' }} />
      );
      const icon = L.divIcon({
        html: iconHtml,
        className: 'bg-transparent border-none',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([amb.location.lat, amb.location.lng], { icon });

      const popupContent = `
        <div class="text-base font-bold text-white">${amb.id}</div>
        <ul class="mt-2 space-y-1 text-foreground">
          <li><strong>Status:</strong> <span style="color:${getStatusTextColor(amb.status)}">${amb.status}</span></li>
          <li><strong>Type:</strong> ${amb.vehicleType}</li>
          <li class="font-mono text-xs text-muted"><strong>Loc:</strong> ${amb.location.lat.toFixed(4)}, ${amb.location.lng.toFixed(4)}</li>
        </ul>
      `;
      marker.bindPopup(popupContent);
      layer.addLayer(marker);
    });
  }, [ambulances]);

  // Update incident markers
  useEffect(() => {
    const layer = incidentLayerRef.current;
    layer.clearLayers();

    incidents.forEach(inc => {
       const iconHtml = ReactDOMServer.renderToString(
          <IncidentIcon style={{ color: getPriorityTextColor(inc.priority), width: '28px', height: '28px' }} className={inc.assignedAmbulanceId ? '' : 'animate-pulse'}/>
      );
       const icon = L.divIcon({
        html: iconHtml,
        className: 'bg-transparent border-none',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      
      const marker = L.marker([inc.location.lat, inc.location.lng], { icon });

      const popupContent = `
        <div class="text-base font-bold text-white">${inc.id}</div>
        <ul class="mt-2 space-y-1 text-foreground">
          <li><strong>Priority:</strong> <span style="color:${getPriorityTextColor(inc.priority)}">${inc.priority}</span></li>
          <li class="break-words"><strong>Desc:</strong> ${inc.description}</li>
          ${inc.assignedAmbulanceId ? `<li><strong>Assigned:</strong> ${inc.assignedAmbulanceId}</li>` : `<li style="color:#facc15" class="font-bold">Unassigned</li>`}
        </ul>
      `;
      marker.bindPopup(popupContent);
      layer.addLayer(marker);
    });
  }, [incidents]);

  // Update hospital markers
  useEffect(() => {
    const layer = hospitalLayerRef.current;
    layer.clearLayers();

    if (hospitals && hospitals.length > 0) {
      hospitals.forEach((hospital, idx) => {
        const iconHtml = ReactDOMServer.renderToString(
          <HospitalIcon style={{ color: '#8b5cf6', width: '32px', height: '32px' }} />
        );
        const icon = L.divIcon({
          html: iconHtml,
          className: 'bg-transparent border-none',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([hospital.location.lat, hospital.location.lng], { icon });

        const bedStatus = hospital.availableBeds > 0 ? `text-success` : `text-danger`;
        const popupContent = `
          <div class="text-base font-bold text-white">${hospital.name}</div>
          <ul class="mt-2 space-y-1 text-foreground text-xs">
            <li><strong>Available Beds:</strong> <span class="${bedStatus}">${hospital.availableBeds}/${hospital.totalBeds}</span></li>
            <li class="font-mono text-muted"><strong>Location:</strong> ${hospital.location.lat.toFixed(4)}, ${hospital.location.lng.toFixed(4)}</li>
          </ul>
        `;
        marker.bindPopup(popupContent);
        layer.addLayer(marker);
      });
    }
  }, [hospitals]);

  return (
    <div className="relative">
      <div 
        ref={mapContainerRef} 
        className="w-full aspect-[4/3] bg-background rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg shadow-primary/10 z-10"
      />
      {isSelectingLocation && (
        <div className="absolute inset-0 rounded-lg border-2 border-dashed border-secondary pointer-events-none flex items-center justify-center z-20">
          <div className="bg-secondary/10 backdrop-blur-sm px-4 py-2 rounded-lg text-secondary font-semibold text-sm">
            Click to select location
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;