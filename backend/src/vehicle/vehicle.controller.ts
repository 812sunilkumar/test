import { Controller, Get, Query } from '@nestjs/common';
import { VehicleService } from './vehicle.service';

@Controller('vehicles')
export class VehicleController {
  constructor(private service: VehicleService) {}

  @Get()
  async list(@Query('type') type: string, @Query('location') location: string) {
    return this.service.listByTypeAndLocation(type, location);
  }
}
