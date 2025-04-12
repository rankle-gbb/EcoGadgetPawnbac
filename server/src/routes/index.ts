import Router from 'koa-router';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes'

const router = new Router();

router.use(userRoutes.routes());
router.use(userRoutes.allowedMethods());
router.use(authRoutes.routes());
router.use(authRoutes.allowedMethods());

export default router;
