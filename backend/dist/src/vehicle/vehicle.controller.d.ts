import { VehicleService } from './vehicle.service';
export declare class VehicleController {
    private service;
    constructor(service: VehicleService);
    list(type: string, location: string): Promise<import("./interfaces/vehicle.interface").IVehicle[]>;
}
