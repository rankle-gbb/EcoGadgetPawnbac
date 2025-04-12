import { connectDatabase } from '../config/database';
import User from '../models/User';
import * as bcrypt from 'bcryptjs';
import { config } from 'dotenv';

// 加载环境变量
config();
async function createSuperAdmin() {
  try {
    await connectDatabase();

    // 检查是否已存在超级管理员
    const existingSuperAdmin = await User.findOne({role: 'superAdmin' });
    if (existingSuperAdmin) {
       console.log('超级管理员已存在，用户名:', existingSuperAdmin.username);
      process.exit(0);
    }

    // 从环境变量获取超级管理员信息，如果没有则使用默认值
    const superAdminData = {
      username: process.env.SUPER_ADMIN_USERNAME || 'superAdmin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@ecogadget.com',
      password: await bcrypt.hash(
        process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@2024',
        10
      ),
      nickname: process.env.SUPER_ADMIN_NICKNAME || '超级管理员',
      mobile: process.env.SUPER_ADMIN_MOBILE || '13800000000',
      role: 'superAdmin',
      isAdmin: true,
      isSuperAdmin: true
    };

    // 创建超级管理员
    const superAdmin = await User.create(superAdminData);
    console.log('超级管理员创建成功:', {
      username: superAdmin.username,
      email: superAdmin.email,
      role: superAdmin.role
    });

    // 记录初始密码（仅在首次创建时显示）
    if (!process.env.SUPER_ADMIN_PASSWORD) {
      console.log('请记录默认密码: SuperAdmin@2024');
      console.log('建议立即登录系统修改默认密码');
    }
    process.exit(0);
  } catch (error) {
    console.error('创建超级管理员失败:', error);
    process.exit(1);
  } finally {
    // 断开数据库连接
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }
}

createSuperAdmin();