import Router from 'koa-router';
import { AuthController } from '../controllers/authController';
import { extractUser } from '../middlewares/auth';

const router = new Router({
  prefix: '/api/auth'
});

// Token相关路由
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', extractUser, AuthController.logout);

export default router;