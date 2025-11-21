import mongoose, { Document, Schema } from 'mongoose';

export interface IVehicleTelemetry extends Document {
  vehicleId: mongoose.Types.ObjectId;
  operationId?: mongoose.Types.ObjectId;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  timestamp: Date;
  createdAt: Date;
}

const vehicleTelemetrySchema = new Schema<IVehicleTelemetry>(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    operationId: {
      type: Schema.Types.ObjectId,
      ref: 'Operation',
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    heading: {
      type: Number,
      required: true,
    },
    speed: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for vehicle queries and automatic cleanup
vehicleTelemetrySchema.index({ vehicleId: 1, timestamp: -1 });
vehicleTelemetrySchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 }); // Auto-delete after 24 hours

export default mongoose.model<IVehicleTelemetry>('VehicleTelemetry', vehicleTelemetrySchema);

