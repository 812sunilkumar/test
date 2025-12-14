import { Model } from 'mongoose';
import { AbstractRepository } from '../common/abstract.repository';
import { ReservationDocument } from './schemas/reservation.schema';
import { IReservation } from './interfaces/reservation.interface';
export declare class ReservationRepository implements AbstractRepository<IReservation> {
    private model;
    constructor(model: Model<ReservationDocument>);
    create(item: Partial<IReservation>): Promise<IReservation>;
    findById(id: string): Promise<IReservation | null>;
    find(filter?: any): Promise<IReservation[]>;
    update(id: string, update: Partial<IReservation>): Promise<IReservation | null>;
    findConflicting(vehicleId: string, startISO: string, endISO: string, minimumMinutesBetween?: number): Promise<boolean>;
}
