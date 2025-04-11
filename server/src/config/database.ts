import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// 从环境变量获取连接信息
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eco_gadget_recycle';
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_DB = process.env.MONGO_DB || 'eco_gadget_recycle';

// 连接选项
const options: mongoose.ConnectOptions = {
  // 如果使用用户名和密码
  ...(MONGO_USER && MONGO_PASSWORD
    ? {
        auth: {
          username: MONGO_USER,
          password: MONGO_PASSWORD
        }
      }
    : {})
};

// 连接数据库
export const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI, options);
    console.log('MongoDB连接成功');
  } catch (error) {
    console.error('MongoDB连接失败:', error);
    process.exit(1);
  }
};

// 监听连接事件
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB连接断开，尝试重新连接...');
  setTimeout(connectDatabase, 5000);
});

export default mongoose;
