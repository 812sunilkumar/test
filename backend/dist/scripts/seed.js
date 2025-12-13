"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function main() {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/nevo_test_drive';
    await mongoose_1.default.connect(uri);
    console.log('Connected to', uri);
    const vehicleFile = path_1.default.join(process.cwd(), '..', 'data', 'vehicles.json');
    const reservationFile = path_1.default.join(process.cwd(), '..', 'data', 'reservations.json');
    const vehicleData = fs_1.default.existsSync(vehicleFile) ? JSON.parse(fs_1.default.readFileSync(vehicleFile, 'utf8')).vehicles : [];
    const reservationData = fs_1.default.existsSync(reservationFile) ? JSON.parse(fs_1.default.readFileSync(reservationFile, 'utf8')).reservations : [];
    const vehicleColl = mongoose_1.default.connection.collection('vehicles');
    const reservationColl = mongoose_1.default.connection.collection('reservations');
    if (vehicleData.length) {
        console.log('Seeding vehicles:', vehicleData.length);
        await vehicleColl.deleteMany({});
        await vehicleColl.insertMany(vehicleData.map(v => (Object.assign(Object.assign({}, v), { id: v.id }))));
    }
    else {
        console.log('No vehicles.json found at', vehicleFile);
    }
    if (reservationData.length) {
        console.log('Seeding reservations:', reservationData.length);
        await reservationColl.deleteMany({});
        await reservationColl.insertMany(reservationData);
    }
    else {
        console.log('No reservations.json found at', reservationFile);
    }
    console.log('Done seeding');
    await mongoose_1.default.disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
//# sourceMappingURL=seed.js.map