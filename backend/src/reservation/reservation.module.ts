import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { Reservation, ReservationSchema } from './schemas/reservation.schema';
import { ReservationRepository } from './reservation.repository';
import { VehicleModule } from '../vehicle/vehicle.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Reservation.name, schema: ReservationSchema }]), VehicleModule],
  controllers: [ReservationController],
  providers: [ReservationService, ReservationRepository],
  exports: [ReservationService],
})
export class ReservationModule {}
