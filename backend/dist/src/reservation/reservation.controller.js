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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationController = void 0;
const common_1 = require("@nestjs/common");
const reservation_service_1 = require("./reservation.service");
const check_availability_dto_1 = require("./dto/check-availability.dto");
const schedule_reservation_dto_1 = require("./dto/schedule-reservation.dto");
let ReservationController = class ReservationController {
    constructor(service) {
        this.service = service;
    }
    status() {
        return { status: 'ok' };
    }
    async create(body) {
        return this.service.schedule(body);
    }
    async availability(query) {
        try {
            const result = await this.service.checkAvailability(query.location, query.vehicleType, query.startDateTime, query.durationMins);
            return result;
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message || 'Error checking availability');
        }
    }
};
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReservationController.prototype, "status", null);
__decorate([
    (0, common_1.Post)('reservations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [schedule_reservation_dto_1.ScheduleReservationDto]),
    __metadata("design:returntype", Promise)
], ReservationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('availability'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [check_availability_dto_1.CheckAvailabilityDto]),
    __metadata("design:returntype", Promise)
], ReservationController.prototype, "availability", null);
ReservationController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [reservation_service_1.ReservationService])
], ReservationController);
exports.ReservationController = ReservationController;
//# sourceMappingURL=reservation.controller.js.map