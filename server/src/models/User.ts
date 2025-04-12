import mongoose, { Document, Schema } from 'mongoose';
import * as bcrypt from 'bcryptjs';

// User interface
export interface IUser extends Document {
  username: string;
  userId: string;
  nickname: string;
  mobile: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  role: 'user' | 'admin' | 'superAdmin';
  createdAt: Date;
  updatedAt: Date;
  validatePassword(password: string): Promise<boolean>;
}

// User schema
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxLength: 30,
    },
    nickname: {
      type: String,
      required: true,
      unique: true,
      maxLength: 8,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superAdmin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Method to validate password
UserSchema.methods.validatePassword = async function(password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// Create and export User model
export default mongoose.model<IUser>('User', UserSchema);
