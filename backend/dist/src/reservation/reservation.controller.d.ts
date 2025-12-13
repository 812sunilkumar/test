import { ReservationService } from './reservation.service';
export declare class ReservationController {
    private service;
    constructor(service: ReservationService);
    create(body: any): Promise<import("./interfaces/reservation.interface").IReservation>;
    availability(location: string, vehicleType: string, startDateTime: string, durationMins: string): Promise<{
        available: boolean;
        reason: string;
        vehicle?: undefined;
    } | {
        available: boolean;
        vehicle: any;
        reason?: undefined;
    }>;
}
