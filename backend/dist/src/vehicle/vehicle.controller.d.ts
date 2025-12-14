import { VehicleService } from './vehicle.service';
import { VehicleRepository } from './vehicle.repository';
export declare class VehicleController {
    private service;
    private vehicleRepo;
    constructor(service: VehicleService, vehicleRepo: VehicleRepository);
    getLocations(): Promise<{
        locations: string[];
    }>;
    getVehicleTypes(location?: string): Promise<{
        types: string[];
    }>;
    list(type: string, location: string): Promise<import("./interfaces/vehicle.interface").IVehicle[]>;
}
