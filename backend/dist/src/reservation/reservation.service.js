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
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
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
        if (!vehicle.availableDays.map(d => d.toLowerCase()).includes(dayShort))
            throw new common_1.BadRequestException('Vehicle not available on that day');
        const fromMin = this.timeToMin(vehicle.availableFromTime);
        const toMin = this.timeToMin(vehicle.availableToTime);
        const startMin = start.utc().hour() * 60 + start.utc().minute();
        const endMin = end.utc().hour() * 60 + end.utc().minute();
        if (!(startMin >= fromMin && endMin <= toMin))
            throw new common_1.BadRequestException('Requested time outside vehicle availability');
        const conflict = await this.reservationRepo.findConflicting(vehicle.id, start.toISOString(), end.toISOString());
        if (conflict)
            throw new common_1.BadRequestException('Vehicle already booked for that time');
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
            const candidates = [];
            for (const v of vehicles) {
                const dayShort = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][start.day()];
                if (!v.availableDays.map(d => d.toLowerCase()).includes(dayShort))
                    continue;
                const fromMin = this.timeToMin(v.availableFromTime);
                const toMin = this.timeToMin(v.availableToTime);
                const startMin = start.utc().hour() * 60 + start.utc().minute();
                const endMin = end.utc().hour() * 60 + end.utc().minute();
                if (!(startMin >= fromMin && endMin <= toMin))
                    continue;
                const conflict = await this.reservationRepo.findConflicting(v.id, start.toISOString(), end.toISOString());
                if (!conflict)
                    candidates.push(v);
            }
            if (candidates.length === 0)
                return { available: false, reason: 'No available vehicles' };
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
};
ReservationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reservation_repository_1.ReservationRepository,
        vehicle_repository_1.VehicleRepository])
], ReservationService);
exports.ReservationService = ReservationService;
//# sourceMappingURL=reservation.service.js.map