import { Injectable } from '@nestjs/common';
import { VehicleRepository } from './vehicle.repository';
import { IVehicle } from './interfaces/vehicle.interface';

@Injectable()
export class VehicleService {
  constructor(private repo: VehicleRepository) {}

  async listByTypeAndLocation(type: string, location: string): Promise<IVehicle[]> {
    return this.repo.find({ type: type.toLowerCase(), location: location.toLowerCase() });
  }

  async findById(id: string): Promise<IVehicle | null> {
    return this.repo.findById(id);
  }
}
