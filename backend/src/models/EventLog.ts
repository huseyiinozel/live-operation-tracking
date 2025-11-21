import mongoose, { Document, Schema } from 'mongoose';

export interface IEventLog extends Document {
  eventId: string;
  type: 'checkin' | 'operation_start' | 'operation_complete' | 'alert' | 'other';
  operationId?: mongoose.Types.ObjectId;
  paxId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  message: string;
  data?: any;
  createdAt: Date;
}

const eventLogSchema = new Schema<IEventLog>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['checkin', 'operation_start', 'operation_complete', 'alert', 'other'],
      required: true,
    },
    operationId: {
      type: Schema.Types.ObjectId,
      ref: 'Operation',
    },
    paxId: {
      type: Schema.Types.ObjectId,
      ref: 'Pax',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for queries
eventLogSchema.index({ operationId: 1, createdAt: -1 });
eventLogSchema.index({ type: 1, createdAt: -1 });

export default mongoose.model<IEventLog>('EventLog', eventLogSchema);

