import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/nevo_test_drive';
  await mongoose.connect(uri);
  console.log('Connected to', uri);
  // Try multiple paths: backend/data/, backend/, or current directory
  const possiblePaths = [
    path.join(process.cwd(), 'data', 'vehicles.json'),
    path.join(process.cwd(), 'vehicles.json'),
    path.join(__dirname, '..', 'data', 'vehicles.json'),
    path.join(__dirname, '..', 'vehicles.json'),
  ];
  const vehicleFile = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];
  const reservationFile = vehicleFile.replace('vehicles.json', 'reservations.json');

  const vehicleData = fs.existsSync(vehicleFile) ? JSON.parse(fs.readFileSync(vehicleFile, 'utf8')).vehicles : [];
  const reservationData = fs.existsSync(reservationFile) ? JSON.parse(fs.readFileSync(reservationFile, 'utf8')).reservations : [];

  const vehicleColl = mongoose.connection.collection('vehicles');
  const reservationColl = mongoose.connection.collection('reservations');

  if (vehicleData.length) {
    console.log('Seeding vehicles:', vehicleData.length);
    await vehicleColl.deleteMany({});
    await vehicleColl.insertMany(vehicleData.map(v => ({...v, id: v.id})));
  } else {
    console.log('No vehicles.json found at', vehicleFile);
  }

  if (reservationData.length) {
    console.log('Seeding reservations:', reservationData.length);
    await reservationColl.deleteMany({});
    await reservationColl.insertMany(reservationData);
  } else {
    console.log('No reservations.json found at', reservationFile);
  }

  console.log('Done seeding');
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
