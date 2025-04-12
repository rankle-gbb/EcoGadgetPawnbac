import Router from 'koa-router';
import * as userController from '../controllers/userController';
import { extractUser, requireLoginToken, requireSuperAdmin } from '../middlewares/auth';
import { rateLimiter } from '../middlewares/rateLimit';

const router = new Router({
  prefix: '/api/users',
});

// 公开接口
router.post('/register', userController.register);
router.post('/login', userController.login);

// Get current user profile
router.get('/profile', requireLoginToken, userController.getUserProfile);

// 修改用户信息 - 需要认证
router.put('/:id', requireLoginToken, userController.updateUserInfo);

router.put('/change-password', userController.changePassword);

// 超管接口
router.put('/admin/:id/reset-password',
  requireLoginToken,
  requireSuperAdmin,
  rateLimiter('reset_password', 5, 60 * 1000),
  userController.resetAdminPassword
);


export default router;
