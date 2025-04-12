import mongoose from 'mongoose';
import config from './index';

// 连接数据库
export const connectDatabase = async () => {
  try {
    console.log('Connecting to MongoDB with URI:', config.database.uri);
    await mongoose.connect(config.database.uri);
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
