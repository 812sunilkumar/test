import { Vehicle, AvailabilityResponse, ReservationPayload, ReservationResponse } from '../types';

export interface ApiClient {
  getLocations: () => Promise<string[]>;
  getVehicles: (location: string) => Promise<Vehicle[]>;
  checkAvailability: (params: { location: string; vehicleType: string; startDateTime: string; durationMins: number; }) => Promise<AvailabilityResponse>;
  createReservation: (payload: ReservationPayload) => Promise<{ response: Response; data: ReservationResponse; }>;
}

export const createApiClient = (apiBase: string): ApiClient => {
  const getLocations = async (): Promise<string[]> => {
    const res = await fetch(`${apiBase}/vehicles/locations`);
    const data = await res.json();
    return data.locations || [];
  };

  const getVehicles = async (location: string): Promise<Vehicle[]> => {
    const res = await fetch(`${apiBase}/vehicles?location=${encodeURIComponent(location)}`);
    const data: Vehicle[] = await res.json();
    return data || [];
  };

  const checkAvailability = async (params: { location: string; vehicleType: string; startDateTime: string; durationMins: number; }): Promise<AvailabilityResponse> => {
    const { location, vehicleType, startDateTime, durationMins } = params;
    const res = await fetch(
      `${apiBase}/availability?location=${encodeURIComponent(location)}&vehicleType=${encodeURIComponent(vehicleType)}&startDateTime=${encodeURIComponent(startDateTime)}&durationMins=${durationMins}`
    );
    return res.json();
  };

  const createReservation = async (payload: ReservationPayload): Promise<{ response: Response; data: ReservationResponse; }> => {
    const response = await fetch(`${apiBase}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data: ReservationResponse = await response.json();
    return { response, data };
  };

  return {
    getLocations,
    getVehicles,
    checkAvailability,
    createReservation,
  };
};

