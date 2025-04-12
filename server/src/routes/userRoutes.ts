import Router from 'koa-router';
import * as userController from '../controllers/userController';
import { extractUser, requireLoginToken } from '../middlewares/auth';

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


export default router;
