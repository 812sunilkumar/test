"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationService = void 0;
const common_1 = require("@nestjs/common");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const reservation_repository_1 = require("./reservation.repository");
const vehicle_repository_1 = require("../vehicle/vehicle.repository");
dayjs_1.default.extend(utc_1.default);
let ReservationService = class ReservationService {
    constructor(reservationRepo, vehicleRepo) {
        this.reservationRepo = reservationRepo;
        this.vehicleRepo = vehicleRepo;
    }
    timeToMin(t) {
        const parts = t.split(':').map(Number);
        return parts[0] * 60 + (parts[1] || 0);
    }
    async schedule(dto) {
        const vehicle = await this.vehicleRepo.findById(dto.vehicleId);
        if (!vehicle)
            throw new common_1.BadRequestException('Vehicle not found');
        const start = dayjs_1.default.utc(dto.startDateTime);
        const end = start.add(dto.durationMins, 'minute');
        const now = dayjs_1.default.utc();
        if (start.isBefore(now)) {
            throw new common_1.BadRequestException('Cannot book in the past');
        }
        if (start.diff(now, 'day') > 14) {
            throw new common_1.BadRequestException('Bookings allowed up to 14 days in advance');
        }
        const dayShort = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][start.day()];
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][start.day()];
        if (!vehicle.availableDays.map(d => d.toLowerCase()).includes(dayShort))
            throw new common_1.BadRequestException(`Vehicle is not available on ${dayName}. Available days: ${vehicle.availableDays.join(', ').toUpperCase()}`);
        const fromMin = this.timeToMin(vehicle.availableFromTime);
        const toMin = this.timeToMin(vehicle.availableToTime);
        const startMin = start.utc().hour() * 60 + start.utc().minute();
        const endMin = end.utc().hour() * 60 + end.utc().minute();
        if (!(startMin >= fromMin && endMin <= toMin)) {
            const startTime = `${Math.floor(startMin / 60).toString().padStart(2, '0')}:${(startMin % 60).toString().padStart(2, '0')}`;
            const endTime = `${Math.floor(endMin / 60).toString().padStart(2, '0')}:${(endMin % 60).toString().padStart(2, '0')}`;
            throw new common_1.BadRequestException(`Requested time ${startTime}-${endTime} is outside vehicle availability window (${vehicle.availableFromTime} - ${vehicle.availableToTime})`);
        }
        const conflict = await this.reservationRepo.findConflicting(vehicle.id, start.toISOString(), end.toISOString(), vehicle.minimumMinutesBetweenBookings);
        if (conflict) {
            const bufferMsg = vehicle.minimumMinutesBetweenBookings > 0
                ? ` (including ${vehicle.minimumMinutesBetweenBookings} minute buffer between bookings)`
                : '';
            throw new common_1.BadRequestException(`Vehicle is already booked for that time${bufferMsg}. Please select a different time slot.`);
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
    async checkAvailability(location, vehicleType, startISO, durationMins) {
        if (!startISO || !dayjs_1.default.utc(startISO).isValid()) {
            return { available: false, reason: 'Invalid startDateTime format' };
        }
        const start = dayjs_1.default.utc(startISO);
        const end = start.add(durationMins, 'minute');
        const now = dayjs_1.default.utc();
        if (start.isBefore(now)) {
            return { available: false, reason: 'Cannot book in the past' };
        }
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
            const dayShort = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][start.day()];
            const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][start.day()];
            const candidates = [];
            const reasons = [];
            for (const v of vehicles) {
                if (!v.availableDays.map(d => d.toLowerCase()).includes(dayShort)) {
                    reasons.push(`Vehicle ${v.id}: Not available on ${dayName}`);
                    continue;
                }
                const fromMin = this.timeToMin(v.availableFromTime);
                const toMin = this.timeToMin(v.availableToTime);
                const startMin = start.utc().hour() * 60 + start.utc().minute();
                const endMin = end.utc().hour() * 60 + end.utc().minute();
                if (!(startMin >= fromMin && endMin <= toMin)) {
                    const startTime = `${Math.floor(startMin / 60).toString().padStart(2, '0')}:${(startMin % 60).toString().padStart(2, '0')}`;
                    const endTime = `${Math.floor(endMin / 60).toString().padStart(2, '0')}:${(endMin % 60).toString().padStart(2, '0')}`;
                    reasons.push(`Vehicle ${v.id}: Requested time ${startTime}-${endTime} outside availability window ${v.availableFromTime}-${v.availableToTime}`);
                    continue;
                }
                const conflict = await this.reservationRepo.findConflicting(v.id, start.toISOString(), end.toISOString(), v.minimumMinutesBetweenBookings);
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
            const stats = [];
            for (const v of candidates) {
                const reservations = await this.reservationRepo.find({ vehicleId: v.id });
                const totalBookedMins = reservations
                    .filter(r => {
                    return new Date(r.startDateTime).toISOString().slice(0, 10) === start.toISOString().slice(0, 10);
                })
                    .reduce((sum, r) => {
                    const rs = new Date(r.startDateTime);
                    const re = new Date(r.endDateTime);
                    return sum + Math.max(0, Math.floor((re.getTime() - rs.getTime()) / 60000));
                }, 0);
                stats.push({ vehicle: v, totalBookedMins });
            }
            stats.sort((a, b) => a.totalBookedMins - b.totalBookedMins);
            const chosen = stats[0].vehicle;
            return { available: true, vehicle: chosen };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error checking availability: ${error.message}`);
        }
    }
    async getAvailableTimeSlots(vehicleId, date, durationMins) {
        const vehicle = await this.vehicleRepo.findById(vehicleId);
        if (!vehicle)
            throw new common_1.BadRequestException('Vehicle not found');
        const selectedDate = dayjs_1.default.utc(date);
        const dayShort = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][selectedDate.day()];
        if (!vehicle.availableDays.map(d => d.toLowerCase()).includes(dayShort)) {
            return [];
        }
        const fromMin = this.timeToMin(vehicle.availableFromTime);
        const toMin = this.timeToMin(vehicle.availableToTime);
        const availableSlots = [];
        const reservations = await this.reservationRepo.find({ vehicleId });
        const dayReservations = reservations.filter(r => {
            const resDate = dayjs_1.default.utc(r.startDateTime);
            return resDate.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD');
        });
        for (let slotMin = fromMin; slotMin + durationMins <= toMin; slotMin += 15) {
            const slotStart = dayjs_1.default.utc(date).startOf('day').add(slotMin, 'minute');
            const slotEnd = slotStart.add(durationMins, 'minute');
            let hasConflict = false;
            for (const reservation of dayReservations) {
                const resStart = dayjs_1.default.utc(reservation.startDateTime);
                const resEnd = dayjs_1.default.utc(reservation.endDateTime);
                const slotStartWithBuffer = slotStart.subtract(vehicle.minimumMinutesBetweenBookings, 'minute');
                const slotEndWithBuffer = slotEnd.add(vehicle.minimumMinutesBetweenBookings, 'minute');
                if ((slotStartWithBuffer.isBefore(resEnd) && slotEndWithBuffer.isAfter(resStart))) {
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
};
ReservationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reservation_repository_1.ReservationRepository,
        vehicle_repository_1.VehicleRepository])
], ReservationService);
exports.ReservationService = ReservationService;
//# sourceMappingURL=reservation.service.js.map