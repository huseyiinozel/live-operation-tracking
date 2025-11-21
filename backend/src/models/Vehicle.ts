import mongoose, { Document, Schema } from 'mongoose';

export interface IVehicle extends Document {
  plate: string;
  vehicleModel: string;
  capacity: number;
  status: 'available' | 'in_use' | 'maintenance';
  lastPing?: {
    lat: number;
    lng: number;
    heading: number;
    speed: number;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    plate: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    vehicleModel: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'in_use', 'maintenance'],
      default: 'available',
    },
    lastPing: {
      lat: Number,
      lng: Number,
      heading: Number,
      speed: Number,
      timestamp: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IVehicle>('Vehicle', vehicleSchema);

