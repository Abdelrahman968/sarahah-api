# Sarahah API

A Node.js + Express backend for a Sarahah-style anonymous messaging platform. The project includes user authentication, password recovery, refresh-token flow, OAuth login support, admin authorization, and a generated API documentation page.

## Features

- User registration and login
- JWT access and refresh token handling
- Password reset flow via email
- Google and GitHub OAuth login
- Admin-only protected routes
- Rate limiting for public and auth endpoints
- MongoDB integration with Mongoose
- OpenAPI/Scalar API docs at `/api/v1/docs`
- Health check endpoint for service status

## Tech Stack

- Node.js
- Express 5
- MongoDB + Mongoose
- JWT
- Argon2 for password hashing
- Nodemailer for email delivery
- CORS, cookie parsing, and rate limiting
- Zod for validation
- Scalar API reference for documentation

## Project Structure

```text
.
├── config/
│   ├── .env.example
│   ├── .env.development
│   ├── .env.production
│   ├── env.config.js
│   └── env.zod.js
├── src/
│   ├── app.js
│   ├── db/
│   ├── docs/
│   ├── middleware/
│   ├── modules/
│   ├── services/
│   └── utils/
├── package.json
├── server.js
└── README.md
```

## Prerequisites

- Node.js 18 or later
- MongoDB running locally or reachable via a MongoDB URI
- SMTP service credentials for password reset emails
- Google and/or GitHub OAuth credentials if you want social login

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Abdelrahman968/sarahah-api.git
cd sarahah-api
```

2. Install dependencies:

```bash
npm install
```

3. Create your environment file:

```bash
cp config/.env.example config/.env.development
```

Then update the values in `config/.env.development` with your own configuration.

## Environment Variables

The application reads environment variables from `config/.env.development` or `config/.env.production`, depending on `NODE_ENV`.

Key variables include:

- `PORT`
- `API_PREFIX`
- `TRUSTED_ORIGINS`
- `MONGO_URI`
- `MONGO_DB_NAME`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ADMIN_ACCESS_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`

## Running the Project

Development mode:

```bash
npm run start:dev
```

Production mode:

```bash
npm run start:node
```

The API starts on the configured port and exposes its base route at `/api/v1`.

## API Documentation

After starting the server, open:

```text
http://localhost:5000/api/v1/docs
```

This route serves the Scalar API reference for the project.

## Default Routes Overview

- `GET /api/v1/system/health` — health check
- `POST /api/v1/auth/register` — create user account
- `POST /api/v1/auth/login` — authenticate user
- `POST /api/v1/auth/logout` — logout current user
- `POST /api/v1/auth/forgot-password` — request reset token
- `POST /api/v1/auth/reset-password` — set a new password
- `GET /api/v1/user/profile` — access authenticated user profile
- `GET /api/v1/admin/*` — admin-only endpoints (when authorized)

## Notes

- `NODE_ENV` must be either `development` or `production`.
- The project uses the `config` directory for environment files and validation.
- API response formatting is centralized through custom middleware.

## License

This project is for educational and personal development use.
