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
let ReservationController = class ReservationController {
    constructor(service) {
        this.service = service;
    }
    async create(body) {
        return this.service.schedule(body);
    }
    async availability(location, vehicleType, startDateTime, durationMins) {
        if (!location || !vehicleType || !startDateTime || !durationMins) {
            throw new common_1.BadRequestException('Missing required parameters: location, vehicleType, startDateTime, durationMins');
        }
        const duration = Number(durationMins);
        if (isNaN(duration) || duration <= 0) {
            throw new common_1.BadRequestException('durationMins must be a positive number');
        }
        try {
            return await this.service.checkAvailability(location, vehicleType, startDateTime, duration);
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message || 'Error checking availability');
        }
    }
};
__decorate([
    (0, common_1.Post)('reservations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('availability'),
    __param(0, (0, common_1.Query)('location')),
    __param(1, (0, common_1.Query)('vehicleType')),
    __param(2, (0, common_1.Query)('startDateTime')),
    __param(3, (0, common_1.Query)('durationMins')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReservationController.prototype, "availability", null);
ReservationController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [reservation_service_1.ReservationService])
], ReservationController);
exports.ReservationController = ReservationController;
//# sourceMappingURL=reservation.controller.js.map