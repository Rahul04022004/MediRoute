import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Ambulance, Incident, IncidentPriority, AmbulanceStatus, Location, IncidentStatus } from './types';
import { getDispatchDecision } from './services/geminiService';
import { calculateETA } from './services/etaService';
import Header from './components/Header';
import Map from './components/Map';
import AmbulanceList from './components/AmbulanceList';
import IncidentList from './components/IncidentList';
import NewIncidentForm from './components/NewIncidentForm';
import IncidentHistory from './components/IncidentHistory';
import FilterBar from './components/FilterBar';
import { useAmbulanceData } from './hooks/useAmbulanceData';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import DriverView from './components/DriverView';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { NotificationProvider } from './contexts/NotificationContext';
import ToastContainer from './components/ToastContainer';
import NotificationHistory from './components/NotificationHistory';
import { useNotification } from './contexts/NotificationContext';
import { NotificationType } from './services/notificationService';

type View = 'map' | 'dashboard' | 'analytics';
type Mode = 'dispatcher' | 'driver';

const AppContent: React.FC = () => {
  const { addNotification } = useNotification();
  const { ambulances, incidents, setAmbulances, setIncidents, hospitals, setHospitals } = useAmbulanceData();
  const [isDispatching, setIsDispatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [activeView, setActiveView] = useState<View>('map');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mode, setMode] = useState<Mode>('dispatcher');
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [selectedIncidentLocation, setSelectedIncidentLocation] = useState<Location | null>(null);
  const [incidentPriorityFilter, setIncidentPriorityFilter] = useState<IncidentPriority | 'all'>('all');
  const [ambulanceStatusFilter, setAmbulanceStatusFilter] = useState<AmbulanceStatus | 'all'>('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<any>('all');
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  
  // Use refs to avoid stale closures
  const hospitalsRef = useRef<any[]>([]);
  
  useEffect(() => {
    hospitalsRef.current = hospitals;
  }, [hospitals]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        // Fallback to LA
        setUserLocation({ lat: 34.0522, lng: -118.2437 });
      }
    );
  }, []);

  // Auto-generate incidents for simulation
  useEffect(() => {
    if (!isAuthenticated || !userLocation || !isSimulationRunning) return;

    const simulationInterval = setInterval(() => {
      // Randomly decide if a new incident should occur (30% chance every 5 seconds)
      if (Math.random() < 0.3) {
        const priorities = Object.values(IncidentPriority);
        const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
        
        // Generate random location near user location
        const offset = 0.02; // ~2km radius
        const randomLat = userLocation.lat + (Math.random() - 0.5) * offset;
        const randomLng = userLocation.lng + (Math.random() - 0.5) * offset;
        
        const descriptions = [
          'Chest pain - possible cardiac event',
          'Traumatic injury - vehicle accident',
          'Difficulty breathing - respiratory distress',
          'Loss of consciousness',
          'Severe allergic reaction',
          'Fall with head injury',
          'Abdominal pain - acute abdomen',
        ];
        
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];
        
        const newIncident: Incident = {
          id: `INC-${Date.now()}`,
          location: { lat: randomLat, lng: randomLng },
          priority: randomPriority,
          description,
          status: IncidentStatus.Pending,
          createdAt: Date.now(),
        };

        // Auto-dispatch to nearest available ambulance
        const availableAmb = ambulances.find(a => a.status === AmbulanceStatus.Available);
        if (availableAmb) {
          const dispatchedIncident = { ...newIncident, status: IncidentStatus.Dispatched };
          setIncidents(prev => [...prev, dispatchedIncident]);
          
          setAmbulances(prev =>
            prev.map(a =>
              a.id === availableAmb.id
                ? {
                    ...a,
                    status: AmbulanceStatus.EnRoute,
                    destination: newIncident.location,
                    assignedIncidentId: newIncident.id,
                    routePath: [],
                  }
                : a
            )
          );

          addNotification(
            NotificationType.Info,
            `Incident: ${randomPriority.toUpperCase()}`,
            description,
            4000
          );
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(simulationInterval);
  }, [isAuthenticated, userLocation, isSimulationRunning, ambulances, addNotification]);

  // Continuous ambulance movement simulation
  useEffect(() => {
    if (!isAuthenticated || !isSimulationRunning) return;

    const movementInterval = setInterval(() => {
      setAmbulances(prevAmbulances =>
        prevAmbulances.map(ambulance => {
          // Skip if not moving
          if (!ambulance.destination || ambulance.status === AmbulanceStatus.Available || ambulance.status === AmbulanceStatus.AtHospital) {
            return ambulance;
          }

          const destination = ambulance.destination;
          const distance = Math.sqrt(
            Math.pow(ambulance.location.lat - destination.lat, 2) +
            Math.pow(ambulance.location.lng - destination.lng, 2)
          );

          // Reached destination
          if (distance < 0.003) {
            if (ambulance.status === AmbulanceStatus.EnRoute) {
              // Reached incident - now go to hospital
              const hospitalsList = hospitalsRef.current;
              const hospital = hospitalsList.length > 0 
                ? hospitalsList[Math.floor(Math.random() * hospitalsList.length)]
                : { location: { lat: 34.0522, lng: -118.2437 } };
              
              // Notify
              setTimeout(() => {
                setIncidents(prev =>
                  prev.map(inc =>
                    inc.id === ambulance.assignedIncidentId
                      ? { ...inc, status: IncidentStatus.OnScene }
                      : inc
                  )
                );
                addNotification(NotificationType.Success, '📍 On Scene - Occupied', `${ambulance.id} heading to hospital`, 3000);
              }, 0);

              // Return with new destination
              return {
                ...ambulance,
                status: AmbulanceStatus.Busy,
                destination: hospital.location,
              };
            } else if (ambulance.status === AmbulanceStatus.Busy) {
              // Reached hospital
              setTimeout(() => {
                setIncidents(prev =>
                  prev.map(inc =>
                    inc.id === ambulance.assignedIncidentId
                      ? { ...inc, status: IncidentStatus.Resolved, resolvedAt: Date.now() }
                      : inc
                  )
                );
                addNotification(NotificationType.Success, '🏥 Arrived at Hospital', `${ambulance.id} dropping off patient`, 3000);
                
                // Return to available after 5 seconds
                setTimeout(() => {
                  setAmbulances(prev =>
                    prev.map(a =>
                      a.id === ambulance.id
                        ? { ...a, status: AmbulanceStatus.Available, destination: undefined, assignedIncidentId: undefined }
                        : a
                    )
                  );
                  addNotification(NotificationType.Info, '✓ Back in Service', `${ambulance.id} ready for calls`, 2000);
                }, 5000);
              }, 0);

              return {
                ...ambulance,
                status: AmbulanceStatus.AtHospital,
              };
            }
          }

          // Move towards destination
          const moveDistance = 0.0015;
          const angle = Math.atan2(
            destination.lng - ambulance.location.lng,
            destination.lat - ambulance.location.lat
          );

          return {
            ...ambulance,
            location: {
              lat: ambulance.location.lat + moveDistance * Math.cos(angle),
              lng: ambulance.location.lng + moveDistance * Math.sin(angle),
            },
          };
        })
      );
    }, 800);

    return () => clearInterval(movementInterval);
  }, [isAuthenticated, isSimulationRunning, addNotification]);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);
  const toggleMode = () => setMode(prev => (prev === 'dispatcher' ? 'driver' : 'dispatcher'));

  const handleStartNewIncident = () => {
    setIsSelectingLocation(true);
    setError(null);
  };

  const handleMapClick = (location: Location) => {
    setSelectedIncidentLocation(location);
    setIsSelectingLocation(false);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedIncidentLocation(null);
    setIsSelectingLocation(false);
  };

  const handleNewIncident = useCallback(async (description: string, priority: IncidentPriority, location: Location) => {
    setIsDispatching(true);
    setError(null);
    setShowForm(false);
    
    const newIncident: Omit<Incident, 'id' | 'assignedAmbulanceId'> = { 
      location, 
      priority, 
      description,
      status: IncidentStatus.Pending,
      createdAt: Date.now(),
    };

    try {
      const availableAmbulances = ambulances.filter(a => a.status === AmbulanceStatus.Available);
      if (availableAmbulances.length === 0) throw new Error("No ambulances available for dispatch.");

      const decision = await getDispatchDecision(newIncident, availableAmbulances);
      const assignedAmbulance = ambulances.find(a => a.id === decision.bestAmbulanceId);
      const etaMinutes = assignedAmbulance ? calculateETA(assignedAmbulance.location, location) : 0;
      
      const incidentWithId: Incident = { 
        ...newIncident, 
        id: `INC-${Date.now()}`, 
        assignedAmbulanceId: decision.bestAmbulanceId,
        status: IncidentStatus.Dispatched,
        etaMinutes,
      };
      setIncidents(prev => [...prev, incidentWithId]);

      setAmbulances(prev => prev.map(amb =>
        amb.id === decision.bestAmbulanceId
          ? { ...amb, status: AmbulanceStatus.EnRoute, destination: incidentWithId.location, assignedIncidentId: incidentWithId.id }
          : amb
      ));

      // Send notifications
      addNotification(
        NotificationType.Success,
        'Incident Dispatched',
        `${decision.bestAmbulanceId} dispatched to incident. ETA: ${etaMinutes} minutes`,
        5000
      );
      addNotification(
        NotificationType.Info,
        'AI Dispatch Decision',
        decision.reasoning || 'Optimal ambulance selected',
        4000
      );

      if (priority === IncidentPriority.Critical) {
        addNotification(
          NotificationType.Critical,
          'CRITICAL INCIDENT',
          `Critical priority incident reported at ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
          0,
          true
        );
      }
    } catch (err) {
      console.error("Dispatch Error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during dispatch.");
      
      addNotification(
        NotificationType.Error,
        'Dispatch Failed',
        err instanceof Error ? err.message : "An unknown error occurred",
        5000
      );

      const incidentWithId: Incident = { 
        ...newIncident, 
        id: `INC-${Date.now()}`,
        status: IncidentStatus.Pending,
      };
      setIncidents(prev => [...prev, incidentWithId]);
    } finally {
      setIsDispatching(false);
      setSelectedIncidentLocation(null);
    }
  }, [ambulances, setAmbulances, setIncidents, addNotification]);

  // Filter incidents and ambulances
  const filteredIncidents = incidents.filter(inc => 
    incidentPriorityFilter === 'all' ? true : inc.priority === incidentPriorityFilter
  );

  const filteredAmbulances = ambulances.filter(amb =>
    (ambulanceStatusFilter === 'all' ? true : amb.status === ambulanceStatusFilter) &&
    (vehicleTypeFilter === 'all' ? true : amb.vehicleType === vehicleTypeFilter)
  );

  if (!isAuthenticated) return <LandingPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header 
        onLogout={handleLogout} 
        onToggleMode={toggleMode} 
        currentMode={mode} 
        onReportIncident={handleStartNewIncident}
        onToggleSimulation={() => setIsSimulationRunning(!isSimulationRunning)}
        isSimulationRunning={isSimulationRunning}
      />
      
      <ToastContainer />
      <NotificationHistory />
      
      <AnimatePresence>
        {isSelectingLocation && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 bg-blue-500/20 backdrop-blur-md border border-blue-400/50 text-blue-300 font-semibold py-4 px-8 rounded-xl shadow-lg shadow-blue-500/20 z-[1001] flex items-center gap-3"
          >
            <span className="text-2xl animate-pulse">📍</span>
            <span>Click on the map to select incident location</span>
            <button 
              onClick={() => setIsSelectingLocation(false)} 
              className="ml-4 text-blue-300/60 hover:text-blue-300 font-bold text-xl transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="p-6 lg:p-8 bg-gradient-to-br from-black/50 to-black/20">
        {mode === 'dispatcher' ? (
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }} className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">Dispatch Control</h2>
                  <p className="text-gray-400">Manage ambulances and incidents in real-time</p>
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {(['map', 'dashboard', 'analytics'] as View[]).map((view, idx) => {
                  const icons = { map: '🗺️', dashboard: '📊', analytics: '📈' };
                  return (
                    <motion.button 
                      key={view}
                      onClick={() => setActiveView(view)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={clsx(
                        'px-6 py-2.5 text-sm font-semibold rounded-lg transition-all border',
                        activeView === view 
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-lg shadow-cyan-400/20' 
                          : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20'
                      )}
                    >
                      <span className="mr-2">{icons[view as keyof typeof icons]}</span>
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {activeView === 'map' ? (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <motion.div className="xl:col-span-8" variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}>
                  {userLocation ? (
                    <Map 
                      ambulances={ambulances} 
                      incidents={incidents}
                      hospitals={hospitals}
                      center={userLocation}
                      isSelectingLocation={isSelectingLocation}
                      onMapClick={handleMapClick}
                      temporaryMarkerLocation={selectedIncidentLocation}
                    />
                  ) : (
                    <div className="aspect-video bg-background-light rounded-lg flex items-center justify-center"><p>Loading map...</p></div>
                  )}
                </motion.div>
                
                <div className="xl:col-span-4 space-y-8">
                  <FilterBar 
                    incidentPriorityFilter={incidentPriorityFilter}
                    setIncidentPriorityFilter={setIncidentPriorityFilter}
                    ambulanceStatusFilter={ambulanceStatusFilter}
                    setAmbulanceStatusFilter={setAmbulanceStatusFilter}
                    vehicleTypeFilter={vehicleTypeFilter}
                    setVehicleTypeFilter={setVehicleTypeFilter}
                  />
                  
                  <IncidentHistory incidents={incidents} />
                  
                  <AmbulanceList ambulances={filteredAmbulances} />
                </div>
              </div>
            ) : activeView === 'dashboard' ? (
              <Dashboard ambulances={ambulances} incidents={incidents} />
            ) : (
              <AnalyticsDashboard ambulances={ambulances} incidents={incidents} />
            )}
          </motion.div>
        ) : (
          <DriverView ambulances={ambulances} setAmbulances={setAmbulances} />
        )}
      </main>

      <AnimatePresence>
        {showForm && mode === 'dispatcher' && selectedIncidentLocation && (
          <NewIncidentForm
            onSubmit={handleNewIncident}
            onClose={handleCloseForm}
            isLoading={isDispatching}
            incidentLocation={selectedIncidentLocation}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
};

export default App;
