import { Vehicle } from '../types';

export interface BookingPayload {
  location: string;
  vehicleType: string;
  startDateTime: string;
  durationMins: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface BookingResponse {
  reservation?: {
    _id?: string;
    id?: string;
  };
  _id?: string;
  id?: string;
  // Error response fields (from NestJS BadRequestException)
  message?: string | string[];
  reason?: string;
  statusCode?: number;
}

export interface ApiClient {
  getLocations: () => Promise<string[]>;
  getVehicles: (location: string) => Promise<Vehicle[]>;
  book: (payload: BookingPayload) => Promise<{ response: Response; data: BookingResponse }>;
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

  const book = async (payload: BookingPayload): Promise<{ response: Response; data: BookingResponse }> => {
    const response = await fetch(`${apiBase}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data: BookingResponse = await response.json();
    return { response, data };
  };

  return {
    getLocations,
    getVehicles,
    book,
  };
};

