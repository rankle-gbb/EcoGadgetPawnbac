import Router from 'koa-router';
import * as authController from '../controllers/authController';
import { validate } from '../middlewares/validation';
import { registerSchema } from '../utils/validationSchemas';

const router = new Router({
  prefix: '/api/auth',
});

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user
// router.get('/me', authController.getCurrentUser);

export default router;
