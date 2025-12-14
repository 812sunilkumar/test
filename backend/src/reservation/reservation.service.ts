import { Injectable, BadRequestException } from '@nestjs/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ReservationRepository } from './reservation.repository';
import { VehicleRepository } from '../vehicle/vehicle.repository';
import { ScheduleReservationDto } from './dto/schedule-reservation.dto';

dayjs.extend(utc);

@Injectable()
export class ReservationService {
  constructor(
    private reservationRepo: ReservationRepository,
    private vehicleRepo: VehicleRepository,
  ) {}

  private timeToMin(t: string) {
    // Handle both "08:00" and "08:00:00" formats
    const parts = t.split(':').map(Number);
    return parts[0] * 60 + (parts[1] || 0);
  }

  private formatTime(minutes: number): string {
    return `${Math.floor(minutes / 60).toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;
  }

  private getDayInfo(date: dayjs.Dayjs) {
    const dayShort = ['sun','mon','tue','wed','thu','fri','sat'][date.day()];
    const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.day()];
    return { dayShort, dayName };
  }

  // Validate basic booking constraints (past, 14-day limit)
  private validateBookingDates(start: dayjs.Dayjs): string | null {
    const now = dayjs.utc();
    if (start.isBefore(now)) return 'Cannot book in the past';
    if (start.diff(now, 'day') > 14) return 'Bookings allowed up to 14 days in advance';
    return null;
  }

  // Validate vehicle availability for a specific time slot
  private async validateVehicleSlot(vehicle: any, start: dayjs.Dayjs, end: dayjs.Dayjs): Promise<string | null> {
    const { dayShort, dayName } = this.getDayInfo(start);

    // Check day availability
    if (!vehicle.availableDays.map(d => d.toLowerCase()).includes(dayShort)) {
      return `Vehicle is not available on ${dayName}. Available days: ${vehicle.availableDays.join(', ').toUpperCase()}`;
    }

    // Check time window
    const fromMin = this.timeToMin(vehicle.availableFromTime);
    const toMin = this.timeToMin(vehicle.availableToTime);
    const startMin = start.utc().hour() * 60 + start.utc().minute();
    const endMin = end.utc().hour() * 60 + end.utc().minute();

    if (!(startMin >= fromMin && endMin <= toMin)) {
      const startTime = this.formatTime(startMin);
      const endTime = this.formatTime(endMin);
      return `Requested time ${startTime}-${endTime} is outside vehicle availability window (${vehicle.availableFromTime} - ${vehicle.availableToTime})`;
    }

    // Check conflicts with existing bookings
    const conflict = await this.reservationRepo.findConflicting(
      vehicle.id,
      start.toISOString(),
      end.toISOString(),
      vehicle.minimumMinutesBetweenBookings
    );

    if (conflict) {
      const bufferMsg = vehicle.minimumMinutesBetweenBookings > 0
        ? ` (including ${vehicle.minimumMinutesBetweenBookings} minute buffer between bookings)`
        : '';
      return `Vehicle is already booked for that time${bufferMsg}. Please select a different time slot.`;
    }

    return null;
  }

  async schedule(dto: ScheduleReservationDto) {
    const vehicle = await this.vehicleRepo.findById(dto.vehicleId);
    if (!vehicle) throw new BadRequestException('Vehicle not found');

    const start = dayjs.utc(dto.startDateTime);
    const end = start.add(dto.durationMins, 'minute');

    // Create reservation (validation already done by controller/checkAvailability)
    const reservation = {
      vehicleId: vehicle.id,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
    };

    return await this.reservationRepo.create(reservation);
  }

  // Validate booking dates and vehicle slot
  async validateBooking(vehicleId: string, startISO: string, durationMins: number): Promise<string | null> {
    const vehicle = await this.vehicleRepo.findById(vehicleId);
    if (!vehicle) return 'Vehicle not found';

    const start = dayjs.utc(startISO);
    const end = start.add(durationMins, 'minute');

    const dateError = this.validateBookingDates(start);
    if (dateError) return dateError;

    const slotError = await this.validateVehicleSlot(vehicle, start, end);
    return slotError || null;
  }

  async checkAvailability(location: string, vehicleType: string, startISO: string, durationMins: number) {
    if (!startISO || !dayjs.utc(startISO).isValid()) {
      return { available: false, reason: 'Invalid startDateTime format' };
    }

    const start = dayjs.utc(startISO);
    const end = start.add(durationMins, 'minute');

    // Validate dates
    const dateError = this.validateBookingDates(start);
    if (dateError) return { available: false, reason: dateError };

    try {
      const vehicles = await this.vehicleRepo.find({
        type: vehicleType.toLowerCase(),
        location: location.toLowerCase()
      });

      if (vehicles.length === 0) {
        return {
          available: false,
          reason: `No vehicles found for type '${vehicleType}' at location '${location}'`
        };
      }

      const availableCars = [];

      for (const vehicle of vehicles) {
        const error = await this.validateVehicleSlot(vehicle, start, end);
        if (!error) {
          availableCars.push(vehicle);
        }
      }

      if (availableCars.length === 0) {
        return {
          available: false,
          reason: `No available vehicles for the selected time slot`
        };
      }

      return { available: true, vehicle: availableCars[0] };
    } catch (error) {
      throw new BadRequestException(`Error checking availability: ${error.message}`);
    }
  }

  async checkAndBook(location: string, vehicleType: string, startISO: string, durationMins: number, customerName: string, customerEmail: string, customerPhone: string) {
    const avail = await this.checkAvailability(location, vehicleType, startISO, durationMins);

    if (!avail.available) {
      return avail;
    }

    try {
      const reservation = await this.schedule({
        vehicleId: avail.vehicle!.id,
        startDateTime: startISO,
        durationMins,
        customerName,
        customerEmail,
        customerPhone,
      });
      return { available: true, reservation };
    } catch (error) {
      return { available: false, reason: `Booking failed: ${error.message}` };
    }
  }
}
