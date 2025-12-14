import { ReservationService } from './reservation.service';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { ScheduleReservationDto } from './dto/schedule-reservation.dto';
export declare class ReservationController {
    private service;
    constructor(service: ReservationService);
    status(): {
        status: string;
    };
    create(body: ScheduleReservationDto): Promise<import("./interfaces/reservation.interface").IReservation>;
    availability(query: CheckAvailabilityDto): Promise<{
        available: boolean;
        reason: string;
        vehicle?: undefined;
    } | {
        available: boolean;
        vehicle: any;
        reason?: undefined;
    }>;
}
