import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehicleModule } from './vehicle/vehicle.module';
import { ReservationModule } from './reservation/reservation.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/nevo_test_drive'),
    VehicleModule,
    ReservationModule,
  ],
})
export class AppModule {}
