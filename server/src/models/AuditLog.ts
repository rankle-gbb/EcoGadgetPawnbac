import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  operationType: string;
  operatorId: mongoose.Types.ObjectId;
  operatorRole: string;
  targetId?: string;
  targetType: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  status: 'success' | 'failure';
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  operationType: {
    type: String,
    required: true,
    enum: ['user', 'admin', 'system']
  },
  operatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  operatorRole: {
    type: String,
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  targetType: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  details: {
    type: Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    required: true
  }
}, {
  timestamps: true
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);