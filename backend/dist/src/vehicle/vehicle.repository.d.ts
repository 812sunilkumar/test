import { Model } from 'mongoose';
import { AbstractRepository } from '../common/abstract.repository';
import { VehicleDocument } from './schemas/vehicle.schema';
import { IVehicle } from './interfaces/vehicle.interface';
export declare class VehicleRepository implements AbstractRepository<IVehicle> {
    private model;
    constructor(model: Model<VehicleDocument>);
    create(item: Partial<IVehicle>): Promise<IVehicle>;
    findById(id: string): Promise<IVehicle | null>;
    find(filter?: any): Promise<IVehicle[]>;
    update(id: string, update: Partial<IVehicle>): Promise<IVehicle | null>;
}
