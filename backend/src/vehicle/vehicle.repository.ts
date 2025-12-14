import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractRepository } from '../common/abstract.repository';
import { Vehicle, VehicleDocument } from './schemas/vehicle.schema';
import { IVehicle } from './interfaces/vehicle.interface';

@Injectable()
export class VehicleRepository implements AbstractRepository<IVehicle> {
  constructor(@InjectModel(Vehicle.name) private model: Model<VehicleDocument>) {}

  async create(item: Partial<IVehicle>): Promise<IVehicle> {
    const created = await this.model.create(item);
    return created.toObject();
  }

  async findById(id: string): Promise<IVehicle | null> {
    const res = await this.model.findOne({ id }).lean();
    return res as IVehicle | null;
  }

  async find(filter: any = {}, projection: any = {}): Promise<IVehicle[] | any[]> {
    return this.model.find(filter, projection).lean();
  }

  async update(id: string, update: Partial<IVehicle>): Promise<IVehicle | null> {
    return this.model.findOneAndUpdate({ id }, update, { new: true }).lean();
  }
}
