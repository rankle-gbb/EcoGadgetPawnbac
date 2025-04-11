# EcoGadgetPawnbac Server

Backend server for the EcoGadgetPawnbac application, built with Koa2, TypeScript, and MongoDB.

## Technology Stack

- **Core Framework**: Koa2 + TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + koa-jwt
- **File Upload**: koa-body + koa-multer
- **API Validation**: Joi
- **Error Handling**: Custom Koa middleware

## Project Structure

```
server/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # API controllers
│   ├── middlewares/    # Custom middlewares
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── app.ts          # Main application file
├── tests/              # Test files
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript configuration
├── .env                # Environment variables
└── .gitignore          # Git ignore file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on the provided example
4. Start the development server:
   ```
   npm run dev
   ```

### Available Scripts

- `npm run dev`: Start the development server with hot-reloading
- `npm run build`: Build the project for production
- `npm start`: Start the production server
- `npm test`: Run tests
- `npm run lint`: Run linting

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login a user
- `GET /api/auth/me`: Get current user information

### Health Check

- `GET /api/health`: Check server health

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development, production)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT
- `JWT_EXPIRES_IN`: JWT expiration time
- `UPLOAD_DIR`: Directory for file uploads
- `MAX_FILE_SIZE`: Maximum file size for uploads
