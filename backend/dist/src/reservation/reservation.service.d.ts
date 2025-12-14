import { ReservationRepository } from './reservation.repository';
import { VehicleRepository } from '../vehicle/vehicle.repository';
import { ScheduleReservationDto } from './dto/schedule-reservation.dto';
export declare class ReservationService {
    private reservationRepo;
    private vehicleRepo;
    constructor(reservationRepo: ReservationRepository, vehicleRepo: VehicleRepository);
    private timeToMin;
    schedule(dto: ScheduleReservationDto): Promise<import("./interfaces/reservation.interface").IReservation>;
    checkAvailability(location: string, vehicleType: string, startISO: string, durationMins: number): Promise<{
        available: boolean;
        reason: string;
        vehicle?: undefined;
    } | {
        available: boolean;
        vehicle: any;
        reason?: undefined;
    }>;
    getAvailableTimeSlots(vehicleId: string, date: string, durationMins: number): Promise<string[]>;
}
