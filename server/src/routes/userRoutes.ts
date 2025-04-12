import Router from 'koa-router';
import * as userController from '../controllers/userController';
import { extractUser } from '../middlewares/auth';

const router = new Router({
  prefix: '/api/users',
});

// 公开接口
router.post('/register', userController.register);
router.post('/login', userController.login);

// Get current user profile
router.get('/profile', userController.getUserProfile);

// 修改用户信息 - 需要认证
router.put('/:id', userController.updateUserInfo);


export default router;
