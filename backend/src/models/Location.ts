import mongoose, { Document, Schema } from 'mongoose';

export interface ILocation extends Document {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address?: string;
  type: 'hotel' | 'attraction' | 'pickup_point' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: true,
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    address: {
      type: String,
    },
    type: {
      type: String,
      enum: ['hotel', 'attraction', 'pickup_point', 'other'],
      default: 'pickup_point',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILocation>('Location', locationSchema);

