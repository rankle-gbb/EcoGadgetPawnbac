import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

// User interface
export interface IUser extends Document {
  username: string;
  nickname: string;
  mobile: string;
  email: string;
  password: string;
  salt: string;
  isAdmin: boolean;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  setPassword(password: string): void;
  validatePassword(password: string): boolean;
}

// User schema
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 30,
    },
    nickname: {
      type: String,
      required: true,
      unique: true,
      maxlength: 8,
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
      minlength: 6,
    },
    salt: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Method to set password
UserSchema.methods.setPassword = function (password: string): void {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.password = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
};

// Method to validate password
UserSchema.methods.validatePassword = function (password: string): boolean {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
  return this.password === hash;
};

// Create and export User model
export default mongoose.model<IUser>('User', UserSchema);
