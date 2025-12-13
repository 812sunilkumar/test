import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReservationDocument = Reservation & Document;

@Schema()
export class Reservation {
  @Prop({ required: true })
  vehicleId: string;

  @Prop({ required: true })
  startDateTime: string;

  @Prop({ required: true })
  endDateTime: string;

  @Prop()
  customerName: string;

  @Prop()
  customerEmail: string;

  @Prop()
  customerPhone: string;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
