# Backend API (MERN - User Module)

Node.js + Express backend for user authentication, profile management, file uploads, and channel-related user data.

## Overview

This project provides:

- User registration with avatar and optional cover image upload
- Login and logout with JWT tokens and HTTP-only cookies
- Protected user profile endpoints
- Password change endpoint
- Channel profile aggregation (subscribers and subscriptions count)
- Watch history aggregation (work in progress)

The app uses MongoDB (Mongoose), Cloudinary for media uploads, Multer for local upload handling, and a custom API response/error pattern.

## Tech Stack

- Node.js
- Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Bcrypt
- Multer
- Cloudinary
- Cookie Parser
- CORS

## Project Structure

```text
Backend/
  public/
    uploads/
  src/
    app.js
    constant.js
    index.js
    controllers/
      user.controller.js
    db/
      index.js
    middlewares/
      auth.middleware.js
      multer.js
    models/
      user.models.js
      subscription.models.js
      video.models.js
    routes/
      user.routes.js
    utils/
      ApiError.js
      ApiResponse.js
      asyncHandler.js
      cloudinary.js
  package.json
```

## Getting Started

### 1. Prerequisites

- Node.js 18+ (recommended)
- npm
- MongoDB Atlas URI or local MongoDB server
- Cloudinary account

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Set the required environment variables in your local environment configuration.

Required keys:

- `PORT`
- `MONGO_URL`
- `CORS_ORIGIN`
- `ACCESS_TOKEN_SECRET`
- `ACCESS_TOKEN_EXPIRES_IN`
- `REFRESH_TOKEN_SECRET`
- `REFRESH_TOKEN_EXPIRES_IN`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Notes:

- Database name is appended in code from `src/constant.js` (`videotube`).
- Uploaded files are first stored locally in `public/uploads`, then uploaded to Cloudinary.

### 4. Run in Development

```bash
npm run dev
```

Server starts at:

```text
http://localhost:5000
```

## Scripts

- `npm run dev`: starts server with nodemon and dotenv config

## API Base URL

```text
/api/v1/user
```

## Authentication

Protected routes use `verifyJWT` middleware.

Token sources supported:

- Cookie: `accessToken`
- Authorization header: `Bearer <token>`

Login also sets:

- `accessToken` cookie
- `refreshToken` cookie

## User Endpoints

### Public

1. `POST /register`
- Content-Type: `multipart/form-data`
- Required fields:
  - `fullname`
  - `username`
  - `email`
  - `password`
  - `avatar` (file, required)
- Optional:
  - `coverImage` (file)

2. `POST /login`
- Body (JSON):
  - `username` or `email`
  - `password`

### Protected

1. `POST /logout`
2. `PUT /change-password`
- Body (JSON):
  - `currentPassword`
  - `newPassword`

3. `GET /current-user`
4. `PATCH /update-profile`
- Body (JSON):
  - `fullname`
  - `username`

5. `PATCH /avatar`
- Content-Type: `multipart/form-data`
- Field:
  - `avatar` (file)

6. `PUT /cover-image`
- Content-Type: `multipart/form-data`
- Field:
  - `coverImage` (file)

7. `GET /c/:username`
8. `GET /c/history`

## Response Format

Successful responses use:

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success",
  "success": true
}
```

Error handling is based on custom `ApiError` and async wrapper utility.

## Data Models

- `User`
  - username, email, password, fullname
  - avatar, coverImage
  - watchHistory (Video refs)
  - refreshToken

- `Subscription`
  - subscriber (User ref)
  - channel (User ref)

- `Video`
  - video metadata + owner ref
  - aggregate paginate plugin enabled

## Security Notes

- Never commit secrets or API keys to source control.
- Keep credentials only in local/private environment configuration.
- In production, keep `secure: true` cookies and use HTTPS.

## Known Issues (Current Code)

These are present in the current source and may affect runtime behavior:

1. Token generation methods in `src/models/user.models.js` do not return JWT strings.
2. Password pre-save hook references `next()` but does not define `next` parameter.
3. `updateUserProfile` responds with `user` variable that is not defined.
4. `getWatchHistory` uses `mongoose` without import and has aggregation stage typos.
5. Refresh token controller exists but no route is registered for it.

## Suggested Next Improvements

1. Add global error-handling middleware in `src/app.js`.
2. Add request validation (e.g., Zod/Joi/express-validator).
3. Add test coverage (unit + integration).
4. Add `README` examples for Postman/cURL requests.
5. Add Docker setup for consistent local development.
