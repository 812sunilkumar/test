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
exports.VehicleController = void 0;
const common_1 = require("@nestjs/common");
const vehicle_service_1 = require("./vehicle.service");
const vehicle_repository_1 = require("./vehicle.repository");
let VehicleController = class VehicleController {
    constructor(service, vehicleRepo) {
        this.service = service;
        this.vehicleRepo = vehicleRepo;
    }
    async getLocations() {
        return { locations: await this.service.findAllLocations() };
    }
    async getVehicleTypes(location) {
        return { types: await this.service.findAllVehicleTypes(location) };
    }
    async list(type, location) {
        if (type && location) {
            return this.service.listByTypeAndLocation(type, location);
        }
        if (location) {
            return this.service.listByLocation(location);
        }
        return this.vehicleRepo.find();
    }
};
__decorate([
    (0, common_1.Get)('locations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "getLocations", null);
__decorate([
    (0, common_1.Get)('types'),
    __param(0, (0, common_1.Query)('location')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "getVehicleTypes", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('location')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VehicleController.prototype, "list", null);
VehicleController = __decorate([
    (0, common_1.Controller)('vehicles'),
    __metadata("design:paramtypes", [vehicle_service_1.VehicleService,
        vehicle_repository_1.VehicleRepository])
], VehicleController);
exports.VehicleController = VehicleController;
//# sourceMappingURL=vehicle.controller.js.map