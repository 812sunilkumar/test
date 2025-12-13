import { Injectable, BadRequestException } from '@nestjs/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ReservationRepository } from './reservation.repository';
import { VehicleRepository } from '../vehicle/vehicle.repository';

dayjs.extend(utc);

@Injectable()
export class ReservationService {
  constructor(
    private reservationRepo: ReservationRepository,
    private vehicleRepo: VehicleRepository,
  ) {}

  private timeToMin(t: string) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  async schedule(dto: any) {
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
    if (!vehicle.availableDays.map(d => d.toLowerCase()).includes(dayShort))
      throw new BadRequestException('Vehicle not available on that day');

    const fromMin = this.timeToMin(vehicle.availableFromTime);
    const toMin = this.timeToMin(vehicle.availableToTime);
    const startMin = start.utc().hour() * 60 + start.utc().minute();
    const endMin = end.utc().hour() * 60 + end.utc().minute();
    if (!(startMin >= fromMin && endMin <= toMin)) throw new BadRequestException('Requested time outside vehicle availability');

    const conflict = await this.reservationRepo.findConflicting(vehicle.id, start.toISOString(), end.toISOString());
    if (conflict) throw new BadRequestException('Vehicle already booked for that time');

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
      const candidates = [];
      for (const v of vehicles) {
        const dayShort = ['sun','mon','tue','wed','thu','fri','sat'][start.day()];
        if (!v.availableDays.map(d=>d.toLowerCase()).includes(dayShort)) continue;
        const fromMin = this.timeToMin(v.availableFromTime);
        const toMin = this.timeToMin(v.availableToTime);
        const startMin = start.utc().hour()*60 + start.utc().minute();
        const endMin = end.utc().hour()*60 + end.utc().minute();
        if (!(startMin >= fromMin && endMin <= toMin)) continue;
        const conflict = await this.reservationRepo.findConflicting(v.id, start.toISOString(), end.toISOString());
        if (!conflict) candidates.push(v);
      }
      if (candidates.length === 0) return { available: false, reason: 'No available vehicles' };
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
}
