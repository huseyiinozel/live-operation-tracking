import mongoose, { Document, Schema } from 'mongoose';

export interface IPax extends Document {
  paxId: string;
  name: string;
  phone: string;
  pickupPoint: {
    lat: number;
    lng: number;
    address: string;
  };
  seatNo?: string;
  status: 'waiting' | 'checked_in' | 'no_show';
  reservationId: string;
  operationId: mongoose.Types.ObjectId;
  notes?: string;
  checkinDetails?: {
    method: 'qr' | 'manual';
    gps?: {
      lat: number;
      lng: number;
    };
    photoUrl?: string;
    timestamp: Date;
    eventId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const paxSchema = new Schema<IPax>(
  {
    paxId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    pickupPoint: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    seatNo: {
      type: String,
    },
    status: {
      type: String,
      enum: ['waiting', 'checked_in', 'no_show'],
      default: 'waiting',
    },
    reservationId: {
      type: String,
      required: true,
    },
    operationId: {
      type: Schema.Types.ObjectId,
      ref: 'Operation',
      required: true,
    },
    notes: {
      type: String,
    },
    checkinDetails: {
      method: {
        type: String,
        enum: ['qr', 'manual'],
      },
      gps: {
        lat: Number,
        lng: Number,
      },
      photoUrl: String,
      timestamp: Date,
      eventId: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for operation queries
paxSchema.index({ operationId: 1 });

export default mongoose.model<IPax>('Pax', paxSchema);

