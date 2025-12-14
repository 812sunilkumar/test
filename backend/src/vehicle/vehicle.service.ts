import { Injectable } from '@nestjs/common';
import { VehicleRepository } from './vehicle.repository';
import { IVehicle } from './interfaces/vehicle.interface';

@Injectable()
export class VehicleService {
  constructor(private repo: VehicleRepository) {}

  async listByTypeAndLocation(type: string, location: string): Promise<IVehicle[]> {
    return this.repo.find({ type: type.toLowerCase(), location: location.toLowerCase() });
  }

  async listByLocation(location: string): Promise<IVehicle[]> {
    return this.repo.find({ location: location.toLowerCase() });
  }

  async findAllLocations(): Promise<string[]> {
    const vehicles = await this.repo.find({}, {_id: 0, location: 1});
    return [...new Set(vehicles.map(v => v.location))].sort();
  }


  async findAllVehicleTypes(location?: string): Promise<string[]> {
    const filter = location ? { location: location.toLowerCase() } : {};
    const vehicles = await this.repo.find(filter);
    const types = [...new Set(vehicles.map(v => v.type.toLowerCase()))];
    return types.sort();
  }

  async findById(id: string): Promise<IVehicle | null> {
    return this.repo.findById(id);
  }
}
