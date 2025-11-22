import React from 'react';
import { Incident, IncidentPriority, Ambulance } from '../types';
import { IncidentIcon } from './icons/IncidentIcon';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface IncidentListProps {
  incidents: Incident[];
  ambulances: Ambulance[];
  onNewIncident: () => void;
  isDispatching: boolean;
  isSelectingLocation: boolean;
  error: string | null;
}

const getPriorityClass = (priority: IncidentPriority) => {
  switch (priority) {
    case IncidentPriority.Critical: return { text: 'text-priority-critical', bg: 'bg-priority-critical' };
    case IncidentPriority.High: return { text: 'text-priority-high', bg: 'bg-priority-high' };
    case IncidentPriority.Medium: return { text: 'text-priority-medium', bg: 'bg-priority-medium' };
    case IncidentPriority.Low: return { text: 'text-priority-low', bg: 'bg-priority-low' };
    default: return { text: 'text-muted', bg: 'bg-muted' };
  }
};

const IncidentItem: React.FC<{ incident: Incident; assignedAmbulance: Ambulance | undefined }> = ({ incident, assignedAmbulance }) => {
    const priorityClasses = getPriorityClass(incident.priority);

    return (
        <motion.li 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
            className="bg-background-light/50 p-3 rounded-lg transition-all duration-300 border border-transparent hover:border-primary/50 hover:bg-background-light"
        >
            <div className="flex items-start space-x-3">
                <div className={clsx("w-2 h-10 rounded-full flex-shrink-0 mt-0.5", priorityClasses.bg)}></div>
                <div className="flex-grow">
                    <p className="font-semibold text-foreground leading-tight">{incident.description}</p>
                    <p className={clsx("text-sm font-bold", priorityClasses.text)}>{incident.priority}</p>
                </div>
                 <div className="text-right text-xs flex-shrink-0 w-20">
                    {assignedAmbulance ? (
                        <>
                            <p className="font-semibold font-mono text-status-enroute">{assignedAmbulance.id}</p>
                            <p className="text-muted">{assignedAmbulance.status}</p>
                        </>
                    ) : (
                        <p className="font-semibold text-accent animate-pulse">Unassigned</p>
                    )}
                </div>
            </div>
        </motion.li>
    );
};

const IncidentList: React.FC<IncidentListProps> = ({ incidents, ambulances, onNewIncident, isDispatching, isSelectingLocation, error }) => {
  const findAmbulance = (id?: string) => ambulances.find(a => a.id === id);
    
  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}
      className="bg-background-light rounded-xl shadow-2xl p-4 border border-primary/20 shadow-primary/10 flex flex-col h-full"
    >
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary text-shadow-glow-primary">Incidents</h2>
            <button 
                onClick={onNewIncident}
                disabled={isSelectingLocation}
                className="bg-secondary hover:bg-pink-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-secondary/30 transform transition-all text-sm hover:scale-105 focus:outline-none focus:ring-4 focus:ring-secondary/50 disabled:bg-muted/50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSelectingLocation ? 'Selecting...' : 'Report Incident'}
            </button>
        </div>
        
        <AnimatePresence>
          {isDispatching && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-3 bg-primary/10 text-primary rounded-lg mb-4 animate-pulse text-sm">
              AI is dispatching the optimal ambulance...
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-3 bg-secondary/10 text-secondary rounded-lg mb-4 text-sm">
              <strong>Dispatch Failed:</strong> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-grow max-h-80 overflow-y-auto pr-2 -mr-2">
            {incidents.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                    <p className="text-center text-muted py-4">No active incidents.</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    <AnimatePresence>
                        {incidents.slice().reverse().map(incident => (
                            <IncidentItem key={incident.id} incident={incident} assignedAmbulance={findAmbulance(incident.assignedAmbulanceId)} />
                        ))}
                    </AnimatePresence>
                </ul>
            )}
        </div>
    </motion.div>
  );
};

export default IncidentList;
