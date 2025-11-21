import mongoose, { Document, Schema } from 'mongoose';

export interface IOperation extends Document {
  code: string;
  tourName: string;
  date: Date;
  startTime: string;
  vehicleId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  guideId: mongoose.Types.ObjectId;
  totalPax: number;
  checkedInCount: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  route?: Array<{ lat: number; lng: number }>;
  createdAt: Date;
  updatedAt: Date;
}

const operationSchema = new Schema<IOperation>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    tourName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    guideId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalPax: {
      type: Number,
      default: 0,
    },
    checkedInCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['planned', 'active', 'completed', 'cancelled'],
      default: 'planned',
    },
    route: [
      {
        lat: Number,
        lng: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for date queries
operationSchema.index({ date: 1, status: 1 });

export default mongoose.model<IOperation>('Operation', operationSchema);

