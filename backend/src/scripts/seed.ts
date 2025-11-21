import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { addDays, format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Import models
import User from '../models/User';
import Location from '../models/Location';
import Customer from '../models/Customer';
import Vehicle from '../models/Vehicle';
import Operation from '../models/Operation';
import Pax from '../models/Pax';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/live-operation-tracking';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  console.log('🗑️  Clearing existing data...');
  await User.deleteMany({});
  await Location.deleteMany({});
  await Customer.deleteMany({});
  await Vehicle.deleteMany({});
  await Operation.deleteMany({});
  await Pax.deleteMany({});
  console.log('✅ Database cleared');
};

const seedUsers = async () => {
  console.log('👥 Seeding users...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await User.create([
    {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      phone: '+1234567890',
    },
    {
      email: 'ops@example.com',
      password: hashedPassword,
      name: 'Operations Manager',
      role: 'ops_manager',
      phone: '+1234567891',
    },
    {
      email: 'driver1@example.com',
      password: hashedPassword,
      name: 'John Driver',
      role: 'driver',
      phone: '+1234567892',
    },
    {
      email: 'driver2@example.com',
      password: hashedPassword,
      name: 'Jane Driver',
      role: 'driver',
      phone: '+1234567893',
    },
    {
      email: 'guide1@example.com',
      password: hashedPassword,
      name: 'Alice Guide',
      role: 'guide',
      phone: '+1234567894',
    },
    {
      email: 'guide2@example.com',
      password: hashedPassword,
      name: 'Bob Guide',
      role: 'guide',
      phone: '+1234567895',
    },
  ]);
  
  console.log(`✅ Created ${users.length} users`);
  return users;
};

const seedLocations = async () => {
  console.log('📍 Seeding locations...');
  
  // Bangkok coordinates (around the example image area)
  const locations = await Location.create([
    {
      name: 'Grand Palace Hotel',
      coordinates: { lat: 13.750, lng: 100.491 },
      address: 'Na Phra Lan Rd, Phra Borom Maha Ratchawang, Bangkok',
      type: 'hotel',
    },
    {
      name: 'Riverside Resort',
      coordinates: { lat: 13.746, lng: 100.495 },
      address: 'Maharaj Rd, Bangkok',
      type: 'hotel',
    },
    {
      name: 'City Center Inn',
      coordinates: { lat: 13.755, lng: 100.503 },
      address: 'Ratchadamnoen Klang Rd, Bangkok',
      type: 'hotel',
    },
    {
      name: 'Wat Pho Temple',
      coordinates: { lat: 13.7467, lng: 100.4933 },
      address: '2 Sanam Chai Rd, Bangkok',
      type: 'attraction',
    },
    {
      name: 'Saranrom Park',
      coordinates: { lat: 13.752, lng: 100.500 },
      address: 'Saranrom Rd, Bangkok',
      type: 'attraction',
    },
    {
      name: 'Airport Pickup Point',
      coordinates: { lat: 13.740, lng: 100.485 },
      address: 'Near Saphan Taksin Station',
      type: 'pickup_point',
    },
  ]);
  
  console.log(`✅ Created ${locations.length} locations`);
  return locations;
};

const seedCustomers = async (locations: any[]) => {
  console.log('👤 Seeding customers...');
  
  const customers = await Customer.create([
    {
      name: 'Michael Johnson',
      email: 'michael.j@email.com',
      phone: '+1555000001',
      locationId: locations[0]._id,
      notes: 'VIP customer',
    },
    {
      name: 'Sarah Williams',
      email: 'sarah.w@email.com',
      phone: '+1555000002',
      locationId: locations[0]._id,
    },
    {
      name: 'David Brown',
      email: 'david.b@email.com',
      phone: '+1555000003',
      locationId: locations[1]._id,
    },
    {
      name: 'Emma Davis',
      email: 'emma.d@email.com',
      phone: '+1555000004',
      locationId: locations[1]._id,
      notes: 'Requires wheelchair access',
    },
    {
      name: 'James Wilson',
      email: 'james.w@email.com',
      phone: '+1555000005',
      locationId: locations[2]._id,
    },
    {
      name: 'Olivia Martinez',
      email: 'olivia.m@email.com',
      phone: '+1555000006',
      locationId: locations[2]._id,
    },
  ]);
  
  console.log(`✅ Created ${customers.length} customers`);
  return customers;
};

const seedVehicles = async () => {
  console.log('🚐 Seeding vehicles...');
  
  const vehicles = await Vehicle.create([
    {
      plate: 'BKK-1234',
      vehicleModel: 'Mercedes Sprinter 2022',
      capacity: 16,
      status: 'available',
    },
    {
      plate: 'BKK-5678',
      vehicleModel: 'Toyota Commuter 2023',
      capacity: 12,
      status: 'available',
    },
    {
      plate: 'BKK-9012',
      vehicleModel: 'Hyundai H350 2022',
      capacity: 14,
      status: 'available',
    },
  ]);
  
  console.log(`✅ Created ${vehicles.length} vehicles`);
  return vehicles;
};

const seedOperations = async (vehicles: any[], drivers: any[], guides: any[], locations: any[]) => {
  console.log('🎯 Seeding operations...');
  
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  const operations = await Operation.create([
    {
      code: 'BKK-001-TODAY',
      tourName: 'Bangkok Grand Palace & Temple Tour',
      date: today,
      startTime: '09:00',
      vehicleId: vehicles[0]._id,
      driverId: drivers[0]._id,
      guideId: guides[0]._id,
      totalPax: 0,
      checkedInCount: 0,
      status: 'planned',
      route: [
        { lat: 13.750, lng: 100.491 },
        { lat: 13.7467, lng: 100.4933 },
        { lat: 13.752, lng: 100.500 },
      ],
    },
    {
      code: 'BKK-002-TODAY',
      tourName: 'Chao Phraya River Cruise',
      date: today,
      startTime: '14:00',
      vehicleId: vehicles[1]._id,
      driverId: drivers[1]._id,
      guideId: guides[1]._id,
      totalPax: 0,
      checkedInCount: 0,
      status: 'planned',
      route: [
        { lat: 13.746, lng: 100.495 },
        { lat: 13.740, lng: 100.485 },
      ],
    },
    {
      code: 'BKK-003-TMR',
      tourName: 'Bangkok City Highlights',
      date: tomorrow,
      startTime: '08:30',
      vehicleId: vehicles[2]._id,
      driverId: drivers[0]._id,
      guideId: guides[0]._id,
      totalPax: 0,
      checkedInCount: 0,
      status: 'planned',
      route: [
        { lat: 13.755, lng: 100.503 },
        { lat: 13.752, lng: 100.500 },
        { lat: 13.750, lng: 100.491 },
      ],
    },
  ]);
  
  console.log(`✅ Created ${operations.length} operations`);
  return operations;
};

const seedPax = async (operations: any[], locations: any[]) => {
  console.log('🎫 Seeding passengers...');
  
  const paxList = [];
  
  // Operation 1 passengers
  for (let i = 1; i <= 6; i++) {
    paxList.push({
      paxId: `PAX-${uuidv4().substring(0, 8)}`,
      name: `Passenger ${i}`,
      phone: `+1555${String(i).padStart(6, '0')}`,
      pickupPoint: {
        lat: locations[i % 3].coordinates.lat + (Math.random() * 0.002 - 0.001),
        lng: locations[i % 3].coordinates.lng + (Math.random() * 0.002 - 0.001),
        address: locations[i % 3].address,
      },
      seatNo: `A${i}`,
      status: 'waiting',
      reservationId: `RES-OP1-${i}`,
      operationId: operations[0]._id,
    });
  }
  
  // Operation 2 passengers
  for (let i = 1; i <= 5; i++) {
    paxList.push({
      paxId: `PAX-${uuidv4().substring(0, 8)}`,
      name: `Guest ${i}`,
      phone: `+1666${String(i).padStart(6, '0')}`,
      pickupPoint: {
        lat: locations[i % 3].coordinates.lat + (Math.random() * 0.002 - 0.001),
        lng: locations[i % 3].coordinates.lng + (Math.random() * 0.002 - 0.001),
        address: locations[i % 3].address,
      },
      seatNo: `B${i}`,
      status: 'waiting',
      reservationId: `RES-OP2-${i}`,
      operationId: operations[1]._id,
    });
  }
  
  // Operation 3 passengers
  for (let i = 1; i <= 8; i++) {
    paxList.push({
      paxId: `PAX-${uuidv4().substring(0, 8)}`,
      name: `Tourist ${i}`,
      phone: `+1777${String(i).padStart(6, '0')}`,
      pickupPoint: {
        lat: locations[i % 3].coordinates.lat + (Math.random() * 0.002 - 0.001),
        lng: locations[i % 3].coordinates.lng + (Math.random() * 0.002 - 0.001),
        address: locations[i % 3].address,
      },
      seatNo: `C${i}`,
      status: 'waiting',
      reservationId: `RES-OP3-${i}`,
      operationId: operations[2]._id,
    });
  }
  
  const passengers = await Pax.create(paxList);
  
  // Update operation totalPax counts
  await Operation.findByIdAndUpdate(operations[0]._id, { totalPax: 6 });
  await Operation.findByIdAndUpdate(operations[1]._id, { totalPax: 5 });
  await Operation.findByIdAndUpdate(operations[2]._id, { totalPax: 8 });
  
  console.log(`✅ Created ${passengers.length} passengers`);
  return passengers;
};

const runSeed = async () => {
  console.log('🌱 Starting database seed...\n');
  
  try {
    await connectDB();
    await clearDatabase();
    
    const users = await seedUsers();
    const drivers = users.filter(u => u.role === 'driver');
    const guides = users.filter(u => u.role === 'guide');
    
    const locations = await seedLocations();
    const customers = await seedCustomers(locations);
    const vehicles = await seedVehicles();
    const operations = await seedOperations(vehicles, drivers, guides, locations);
    const passengers = await seedPax(operations, locations);
    
    console.log('\n✅ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Locations: ${locations.length}`);
    console.log(`   Customers: ${customers.length}`);
    console.log(`   Vehicles: ${vehicles.length}`);
    console.log(`   Operations: ${operations.length}`);
    console.log(`   Passengers: ${passengers.length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Email: guide1@example.com');
    console.log('   Email: driver1@example.com');
    console.log('   Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

runSeed();

