export interface IReservation {
  vehicleId: string;
  startDateTime: string;
  endDateTime: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}
