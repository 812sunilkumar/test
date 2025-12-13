import { VehicleRepository } from './vehicle.repository';
import { IVehicle } from './interfaces/vehicle.interface';
export declare class VehicleService {
    private repo;
    constructor(repo: VehicleRepository);
    listByTypeAndLocation(type: string, location: string): Promise<IVehicle[]>;
    findById(id: string): Promise<IVehicle | null>;
}
