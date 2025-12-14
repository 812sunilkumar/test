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

  async schedule(dto: ScheduleReservationDto) {
    const vehicle = await this.vehicleRepo.findById(dto.vehicleId);
    if (!vehicle) throw new BadRequestException('Vehicle not found');

    const start = dayjs.utc(dto.startDateTime);
    const end = start.add(dto.durationMins, 'minute');
    const now = dayjs.utc();

    // Validate not in the past
    if (start.isBefore(now)) {
      throw new BadRequestException('Cannot book in the past');
    }

    // Validate 14-day limit
    if (start.diff(now, 'day') > 14) {
      throw new BadRequestException('Bookings allowed up to 14 days in advance');
    }

    // validate day
    const dayShort = ['sun','mon','tue','wed','thu','fri','sat'][start.day()];
    const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][start.day()];
    if (!vehicle.availableDays.map(d => d.toLowerCase()).includes(dayShort))
      throw new BadRequestException(`Vehicle is not available on ${dayName}. Available days: ${vehicle.availableDays.join(', ').toUpperCase()}`);

    const fromMin = this.timeToMin(vehicle.availableFromTime);
    const toMin = this.timeToMin(vehicle.availableToTime);
    const startMin = start.utc().hour() * 60 + start.utc().minute();
    const endMin = end.utc().hour() * 60 + end.utc().minute();
    if (!(startMin >= fromMin && endMin <= toMin)) {
      const startTime = `${Math.floor(startMin/60).toString().padStart(2,'0')}:${(startMin%60).toString().padStart(2,'0')}`;
      const endTime = `${Math.floor(endMin/60).toString().padStart(2,'0')}:${(endMin%60).toString().padStart(2,'0')}`;
      throw new BadRequestException(`Requested time ${startTime}-${endTime} is outside vehicle availability window (${vehicle.availableFromTime} - ${vehicle.availableToTime})`);
    }

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
      throw new BadRequestException(`Vehicle is already booked for that time${bufferMsg}. Please select a different time slot.`);
    }

    const reservation = {
      vehicleId: vehicle.id,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
    };

    const saved = await this.reservationRepo.create(reservation);
    return saved;
  }

  // simple availability check to assist frontend
  async checkAvailability(location: string, vehicleType: string, startISO: string, durationMins: number) {
    if (!startISO || !dayjs.utc(startISO).isValid()) {
      return { available: false, reason: 'Invalid startDateTime format' };
    }

    const start = dayjs.utc(startISO);
    const end = start.add(durationMins, 'minute');
    const now = dayjs.utc();

    // Validate not in the past
    if (start.isBefore(now)) {
      return { available: false, reason: 'Cannot book in the past' };
    }

    // Validate 14-day limit
    if (start.diff(now, 'day') > 14) {
      return { available: false, reason: 'Bookings allowed up to 14 days' };
    }
    
    try {
      const vehicles = await this.vehicleRepo.find({ type: vehicleType.toLowerCase(), location: location.toLowerCase() });
      
      if (vehicles.length === 0) {
        return { 
          available: false, 
          reason: `No vehicles found for type '${vehicleType}' at location '${location}'` 
        };
      }

      const dayShort = ['sun','mon','tue','wed','thu','fri','sat'][start.day()];
      const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][start.day()];
      const candidates = [];
      const reasons: string[] = [];
      
      for (const v of vehicles) {
        // Check day availability
        if (!v.availableDays.map(d=>d.toLowerCase()).includes(dayShort)) {
          reasons.push(`Vehicle ${v.id}: Not available on ${dayName}`);
          continue;
        }
        
        // Check time window
        const fromMin = this.timeToMin(v.availableFromTime);
        const toMin = this.timeToMin(v.availableToTime);
        const startMin = start.utc().hour()*60 + start.utc().minute();
        const endMin = end.utc().hour()*60 + end.utc().minute();
        
        if (!(startMin >= fromMin && endMin <= toMin)) {
          const startTime = `${Math.floor(startMin/60).toString().padStart(2,'0')}:${(startMin%60).toString().padStart(2,'0')}`;
          const endTime = `${Math.floor(endMin/60).toString().padStart(2,'0')}:${(endMin%60).toString().padStart(2,'0')}`;
          reasons.push(`Vehicle ${v.id}: Requested time ${startTime}-${endTime} outside availability window ${v.availableFromTime}-${v.availableToTime}`);
          continue;
        }
        
        // Check conflicts
        const conflict = await this.reservationRepo.findConflicting(
          v.id, 
          start.toISOString(), 
          end.toISOString(),
          v.minimumMinutesBetweenBookings
        );
        
        if (conflict) {
          reasons.push(`Vehicle ${v.id}: Already booked or conflicts with minimum ${v.minimumMinutesBetweenBookings} minutes between bookings`);
          continue;
        }
        
        candidates.push(v);
      }
      
      if (candidates.length === 0) {
        return { 
          available: false, 
          reason: `No available vehicles. Details: ${reasons.join('; ')}` 
        };
      }
      // compute total booked minutes for each candidate on the same day, to pick the least loaded vehicle
      const stats = [];
      for (const v of candidates) {
        const reservations = await this.reservationRepo.find({ vehicleId: v.id });
        const totalBookedMins = reservations
          .filter(r => {
            return new Date(r.startDateTime).toISOString().slice(0,10) === start.toISOString().slice(0,10);
          })
          .reduce((sum, r) => {
            const rs = new Date(r.startDateTime);
            const re = new Date(r.endDateTime);
            return sum + Math.max(0, Math.floor((re.getTime() - rs.getTime())/60000));
          }, 0);
        stats.push({ vehicle: v, totalBookedMins });
      }
      stats.sort((a,b) => a.totalBookedMins - b.totalBookedMins);
      const chosen = stats[0].vehicle;
      return { available: true, vehicle: chosen };
    } catch (error) {
      throw new BadRequestException(`Error checking availability: ${error.message}`);
    }
  }

  async getAvailableTimeSlots(vehicleId: string, date: string, durationMins: number): Promise<string[]> {
    const vehicle = await this.vehicleRepo.findById(vehicleId);
    if (!vehicle) throw new BadRequestException('Vehicle not found');

    const selectedDate = dayjs.utc(date);
    const dayShort = ['sun','mon','tue','wed','thu','fri','sat'][selectedDate.day()];
    
    // Check if vehicle is available on this day
    if (!vehicle.availableDays.map(d => d.toLowerCase()).includes(dayShort)) {
      return [];
    }

    const fromMin = this.timeToMin(vehicle.availableFromTime);
    const toMin = this.timeToMin(vehicle.availableToTime);
    const availableSlots: string[] = [];

    // Get all existing reservations for this vehicle on this date
    const reservations = await this.reservationRepo.find({ vehicleId });
    const dayReservations = reservations.filter(r => {
      const resDate = dayjs.utc(r.startDateTime);
      return resDate.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD');
    });

    // Generate time slots in 15-minute intervals
    for (let slotMin = fromMin; slotMin + durationMins <= toMin; slotMin += 15) {
      const slotStart = dayjs.utc(date).startOf('day').add(slotMin, 'minute');
      const slotEnd = slotStart.add(durationMins, 'minute');
      
      // Check if this slot conflicts with existing reservations (including buffer)
      let hasConflict = false;
      for (const reservation of dayReservations) {
        const resStart = dayjs.utc(reservation.startDateTime);
        const resEnd = dayjs.utc(reservation.endDateTime);
        
        // Check for overlap with buffer
        const slotStartWithBuffer = slotStart.subtract(vehicle.minimumMinutesBetweenBookings, 'minute');
        const slotEndWithBuffer = slotEnd.add(vehicle.minimumMinutesBetweenBookings, 'minute');
        
        if (
          (slotStartWithBuffer.isBefore(resEnd) && slotEndWithBuffer.isAfter(resStart))
        ) {
          hasConflict = true;
          break;
        }
      }
      
      if (!hasConflict) {
        availableSlots.push(slotStart.format('HH:mm'));
      }
    }

    return availableSlots;
  }
}
