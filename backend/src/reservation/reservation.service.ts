import { Injectable, BadRequestException } from '@nestjs/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ReservationRepository } from './reservation.repository';
import { VehicleRepository } from '../vehicle/vehicle.repository';
import { ScheduleReservationDto } from './dto/schedule-reservation.dto';

dayjs.extend(utc);

interface ValidationResult {
  valid: boolean;
  error?: string;
  vehicle?: any;
}

@Injectable()
export class ReservationService {
  private readonly DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  private readonly DAY_SHORT = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  constructor(
    private reservationRepo: ReservationRepository,
    private vehicleRepo: VehicleRepository,
  ) {}

  private timeToMinutes(time: string): number {
    const parts = time.split(':').map(Number);
    return parts[0] * 60 + (parts[1] || 0);
  }

  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
  }

  private getDayInfo(date: dayjs.Dayjs) {
    const dayIndex = date.day();
    return {
      dayShort: this.DAY_SHORT[dayIndex],
      dayName: this.DAY_NAMES[dayIndex]
    };
  }

  private validateDateTime(startISO: string): ValidationResult {
    if (!startISO || !dayjs.utc(startISO).isValid()) {
      return { valid: false, error: 'Invalid startDateTime format' };
    }

    const start = dayjs.utc(startISO);
    const now = dayjs.utc();

    if (start.isBefore(now)) {
      return { valid: false, error: 'Cannot book in the past' };
    }

    if (start.diff(now, 'day') > 14) {
      return { valid: false, error: 'Bookings allowed up to 14 days in advance' };
    }

    return { valid: true };
  }

  private async validateVehicleAvailability(
    vehicle: any,
    start: dayjs.Dayjs,
    end: dayjs.Dayjs
  ): Promise<ValidationResult> {
    const { dayShort, dayName } = this.getDayInfo(start);

    // Check day availability
    if (!vehicle.availableDays.map(d => d.toLowerCase()).includes(dayShort)) {
      return {
        valid: false,
        error: `Vehicle is not available on ${dayName}. Available days: ${vehicle.availableDays.join(', ').toUpperCase()}`
      };
    }

    // Check time window
    const fromMin = this.timeToMinutes(vehicle.availableFromTime);
    const toMin = this.timeToMinutes(vehicle.availableToTime);
    const startMin = start.utc().hour() * 60 + start.utc().minute();
    const endMin = end.utc().hour() * 60 + end.utc().minute();

    if (startMin < fromMin || endMin > toMin) {
      return {
        valid: false,
        error: `Requested time ${this.formatTime(startMin)}-${this.formatTime(endMin)} is outside vehicle availability window (${vehicle.availableFromTime} - ${vehicle.availableToTime})`
      };
    }

    // Check conflicts
    const hasConflict = await this.reservationRepo.findConflicting(
      vehicle.id,
      start.toISOString(),
      end.toISOString(),
      vehicle.minimumMinutesBetweenBookings
    );

    if (hasConflict) {
      const bufferMsg = vehicle.minimumMinutesBetweenBookings > 0
        ? ` (including ${vehicle.minimumMinutesBetweenBookings} minute buffer between bookings)`
        : '';
      return {
        valid: false,
        error: `Vehicle is already booked for that time${bufferMsg}. Please select a different time slot.`
      };
    }

    return { valid: true, vehicle };
  }

  async checkAvailability(
    location: string,
    vehicleType: string,
    startISO: string,
    durationMins: number
  ) {
    // Validate date/time
    const dateValidation = this.validateDateTime(startISO);
    if (!dateValidation.valid) {
      return { available: false, reason: dateValidation.error };
    }

    const start = dayjs.utc(startISO);
    const end = start.add(durationMins, 'minute');

    // Find vehicles
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

    // Check each vehicle for availability
    for (const vehicle of vehicles) {
      const validation = await this.validateVehicleAvailability(vehicle, start, end);
      if (validation.valid) {
        return { available: true, vehicle };
      }
    }

    return {
      available: false,
      reason: 'No available vehicles for the selected time slot'
    };
  }

  async checkAndBook(
    location: string,
    vehicleType: string,
    startISO: string,
    durationMins: number,
    customerName: string,
    customerEmail: string,
    customerPhone: string
  ) {
    const availability = await this.checkAvailability(location, vehicleType, startISO, durationMins);

    if (!availability.available) {
      throw new BadRequestException(availability.reason || 'No available vehicles for the selected time slot');
    }

    try {
      const reservation = await this.createReservation({
        vehicleId: availability.vehicle.id,
        startDateTime: startISO,
        durationMins,
        customerName,
        customerEmail,
        customerPhone,
      });

      return { available: true, reservation };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Booking failed: ${error.message}`);
    }
  }

  private async createReservation(dto: ScheduleReservationDto) {
    const start = dayjs.utc(dto.startDateTime);
    const end = start.add(dto.durationMins, 'minute');

    return await this.reservationRepo.create({
      vehicleId: dto.vehicleId,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
    });
  }
}