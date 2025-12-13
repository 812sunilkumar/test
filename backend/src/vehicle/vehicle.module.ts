import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { Vehicle, VehicleSchema } from './schemas/vehicle.schema';
import { VehicleRepository } from './vehicle.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Vehicle.name, schema: VehicleSchema }])],
  controllers: [VehicleController],
  providers: [VehicleService, VehicleRepository],
  exports: [VehicleService, VehicleRepository],
})
export class VehicleModule {}
