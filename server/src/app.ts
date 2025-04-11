import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import path from 'path';
import fs from 'fs';
import router from './routes';
import { connectDatabase } from './config/database';
import { errorHandler } from './middlewares/errorHandler';
import { jwtMiddleware, extractUser } from './middlewares/auth';
import config from './config';
import cors from '@koa/cors';

// Create Koa application
const app = new Koa();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', config.upload.directory);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect to MongoDB
connectDatabase();

// Middleware
app.use(cors());
app.use(bodyParser());
app.use(errorHandler);
app.use(jwtMiddleware);
app.use(extractUser);

// Routes
app.use(router.routes());
app.use(router.allowedMethods());

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`服务器运行在  ${PORT}`);
  console.log(`Environment: ${config.server.env}`);
});

export default app;
