// import { Context } from 'koa';
// import Router from 'koa-router';
// import authRoutes from './authRoutes';
// import healthRoutes from './healthRoutes';

// const router = new Router();

// // Root endpoint
// router.get('/', async (ctx: Context) => {
//   ctx.body = {
//     message: 'Welcome to EcoGadgetPawnbac API',
//     version: '1.0.0',
//     documentation: '/api/docs',
//   };
// });

// // Register all routes
// const registerRoutes = (app: Router) => {
//   app.use(authRoutes.routes()).use(authRoutes.allowedMethods());
//   app.use(healthRoutes.routes()).use(healthRoutes.allowedMethods());
  
//   return app;
// };

// export default registerRoutes(router);

import Router from 'koa-router';
import authRoutes from './authRoutes';

const router = new Router();

router.use(authRoutes.routes());
router.use(authRoutes.allowedMethods());

export default router;
