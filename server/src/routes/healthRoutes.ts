import Router from 'koa-router';

const router = new Router({
  prefix: '/api/health',
});

// Health check endpoint
router.get('/', async (ctx) => {
  ctx.status = 200;
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Server is running',
  };
});

export default router;
