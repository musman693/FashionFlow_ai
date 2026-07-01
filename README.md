# FashionHub Backend Core

Backend core and authentication module for the FashionHub AI sales assistant project.

## Member 1 Scope

This service implements the backend foundation for Member 1 (Muhammad Usman):
- Express.js service setup
- MongoDB connection with Mongoose
- Admin JWT authentication
- Refresh token support
- Global error handler and request validation
- Redis-based rate limiting middleware
- Webhook signature verification utility

## Setup

1. Copy `.env.example` to `.env`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start a local MongoDB and Redis instance.
4. Run the development server:
   ```bash
   npm run dev
   ```

## Seed admin user

A simple admin seed script is included. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`, then run:

```bash
npm run seed
```

## API Endpoints

- `POST /api/auth/login`
- `POST /api/auth/refresh`

## Notes

- The app is intentionally designed as a plug-in ready core layer.
- Other modules can extend the Express app with additional routes and services.
- The webhook verifier utility is available at `src/utils/webhookVerifier.js`.
