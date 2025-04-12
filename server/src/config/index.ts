import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },

  // MongoDB configuration
  database: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/eco_gadget_recycle',
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // File upload configuration
  upload: {
    directory: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
  },
};

export default config;
