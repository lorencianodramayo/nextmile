import 'dotenv/config';
import mongoose from 'mongoose';
import { Trip } from '../models/Trip.js';
import { User } from '../models/User.js';

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Connected to MongoDB');

  // Get all employee users with trucks
  const employees = await User.find({ role: 'employee', truck: { $ne: null } });
  console.log(`Found ${employees.length} employees with trucks`);

  for (const emp of employees) {
    const result = await Trip.updateMany(
      { truck: emp.truck, createdBy: null },
      { $set: { createdBy: emp._id } }
    );
    console.log(`Updated ${result.modifiedCount} trips for ${emp.displayName} (truck: ${emp.truck})`);
  }

  // Set admin as createdBy for remaining null trips
  const admin = await User.findOne({ role: 'admin' });
  if (admin) {
    const result = await Trip.updateMany(
      { createdBy: null },
      { $set: { createdBy: admin._id } }
    );
    console.log(`Updated ${result.modifiedCount} remaining trips assigned to admin`);
  }

  await mongoose.disconnect();
  console.log('Migration complete!');
}

migrate().catch(console.error);
