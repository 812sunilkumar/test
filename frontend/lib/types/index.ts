export interface Location {
  locations: string[];
}

export interface Vehicle {
  id: string;
  type: string;
  location: string;
  availableFromTime: string;
  availableToTime: string;
  availableDays: string[];
}

export interface BookingFormData {
  date: string;
  time: string;
  duration: number;
  name: string;
  email: string;
  phone: string;
}

export interface AvailabilityResponse {
  available: boolean;
  reason?: string;
  vehicle?: Vehicle;
}

export interface ReservationPayload {
  vehicleId: string;
  startDateTime: string;
  durationMins: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface ReservationResponse {
  _id?: string;
  id?: string;
  message?: string | string[];
}

