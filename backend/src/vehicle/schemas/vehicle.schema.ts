import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VehicleDocument = Vehicle & Document;

@Schema()
export class Vehicle {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  availableFromTime: string;

  @Prop({ required: true })
  availableToTime: string;

  @Prop({ type: [String], default: [] })
  availableDays: string[];

  @Prop({ default: 0 })
  minimumMinutesBetweenBookings: number;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
