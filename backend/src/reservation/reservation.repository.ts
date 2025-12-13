import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractRepository } from '../common/abstract.repository';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';
import { IReservation } from './interfaces/reservation.interface';

@Injectable()
export class ReservationRepository implements AbstractRepository<IReservation> {
  constructor(@InjectModel(Reservation.name) private model: Model<ReservationDocument>) {}

  async create(item: Partial<IReservation>): Promise<IReservation> {
    const created = await this.model.create(item);
    return created.toObject();
  }

  async findById(id: string): Promise<IReservation | null> {
    const res = await this.model.findById(id).lean();
    return res as IReservation | null;
  }

  async find(filter: any = {}): Promise<IReservation[]> {
    return this.model.find(filter).lean();
  }

  async update(id: string, update: Partial<IReservation>): Promise<IReservation | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true }).lean();
  }

  async findConflicting(vehicleId: string, startISO: string, endISO: string): Promise<boolean> {
    const start = new Date(startISO);
    const end = new Date(endISO);
    const conflicts = await this.model.find({
      vehicleId,
      $or: [
        { $and: [{ startDateTime: { $lte: start.toISOString() } }, { endDateTime: { $gt: start.toISOString() } }] },
        { $and: [{ startDateTime: { $lt: end.toISOString() } }, { endDateTime: { $gte: end.toISOString() } }] },
        { $and: [{ startDateTime: { $gte: start.toISOString() } }, { endDateTime: { $lte: end.toISOString() } }] }
      ]
    }).lean();
    return conflicts.length > 0;
  }
}
