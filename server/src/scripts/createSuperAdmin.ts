import { connectDatabase } from '../config/database';
import User from '../models/User';
import * as bcrypt from 'bcryptjs';

async function createSuperAdmin() {
  try {
    await connectDatabase();

    const superAdminData = {
      username: 'superAdmin',
      email: 'superadmin@example.com',
      password: await bcrypt.hash('InitialPassword123!', 10),
      role: 'superAdmin',
      isAdmin: true,
      isSuperAdmin: true,
      // 其他必要字段
    };

    const existingSuperAdmin = await User.findOne({ role: 'superAdmin' });
    if (existingSuperAdmin) {
      console.log('超级管理员已存在');
      process.exit(0);
    }

    await User.create(superAdminData);
    console.log('超级管理员创建成功');
    process.exit(0);
  } catch (error) {
    console.error('创建超级管理员失败:', error);
    process.exit(1);
  }
}

createSuperAdmin();