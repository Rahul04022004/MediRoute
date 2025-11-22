import { GoogleGenAI, Type } from "@google/genai";
import { Ambulance, Incident } from '../types';

const getAiInstance = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY has not been provided. Please check your .env file.");
  }
  return new GoogleGenAI({ apiKey });
};

export const getDispatchDecision = async (
  incident: Omit<Incident, 'id' | 'assignedAmbulanceId'>,
  availableAmbulances: Ambulance[]
): Promise<{ bestAmbulanceId: string; reason: string }> => {
  const ai = getAiInstance();
  
  const prompt = `
    You are an Automated Ambulance Dispatch System. Your task is to select the best ambulance to respond to an emergency incident.
    
    Analyze the following incident and the list of available ambulances.
    
    **Incident Details:**
    - Location (Lat/Lng): ${incident.location.lat}, ${incident.location.lng}
    - Priority: ${incident.priority}
    - Description: "${incident.description}"
    
    **Available Ambulances:**
    ${JSON.stringify(availableAmbulances.map(a => ({ id: a.id, location: a.location, vehicleType: a.vehicleType })), null, 2)}
    
    **Decision Criteria (in order of importance):**
    1.  **Proximity:** Choose the closest ambulance.
    2.  **Vehicle Type:** For 'Critical' or 'High' priority incidents, an 'Advanced Life Support' (ALS) unit is strongly preferred if available nearby. For 'Medium' or 'Low', a 'Basic Life Support' (BLS) unit is acceptable.
    3.  **Assume standard urban traffic conditions.**
    
    Based on these criteria, determine the single best ambulance to dispatch and provide a brief reason for your choice.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bestAmbulanceId: {
              type: Type.STRING,
              description: "The ID of the recommended ambulance.",
            },
            reason: {
              type: Type.STRING,
              description: "A brief justification for the choice.",
            },
          },
          required: ["bestAmbulanceId", "reason"],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
      throw new Error("No response text from Gemini API");
    }
    const decision = JSON.parse(jsonText);
    
    // Validate that the chosen ambulance exists
    if (!availableAmbulances.some(a => a.id === decision.bestAmbulanceId)) {
        console.warn("Gemini chose an invalid or unavailable ambulance ID. Falling back to the closest one.");
        return fallbackToClosest(incident, availableAmbulances);
    }

    return decision;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    console.log("Falling back to simple distance-based dispatch.");
    return fallbackToClosest(incident, availableAmbulances);
  }
};


// Haversine formula to calculate distance between two lat/lng points
const calculateDistance = (loc1: { lat: number, lng: number }, loc2: { lat: number, lng: number }) => {
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

// Fallback logic if AI fails
const fallbackToClosest = (incident: Omit<Incident, 'id' | 'assignedAmbulanceId'>, ambulances: Ambulance[]) => {
    if (ambulances.length === 0) {
        throw new Error("No ambulances available for fallback dispatch.");
    }
    const sortedAmbulances = [...ambulances].sort((a, b) => {
        const distA = calculateDistance(a.location, incident.location);
        const distB = calculateDistance(b.location, incident.location);
        return distA - distB;
    });

    const bestAmbulance = sortedAmbulances[0];
    return {
        bestAmbulanceId: bestAmbulance.id,
        reason: `AI dispatch failed. Fallback: Dispatched closest unit (${bestAmbulance.id}).`
    };
};