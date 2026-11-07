# Sarahah API

A Node.js and Express REST API for an anonymous messaging platform. It provides
account authentication, email verification, password recovery, OAuth login,
two-factor authentication, profile management, admin operations, and avatar
uploads.

## Features

- JWT access tokens and HttpOnly refresh-token cookies
- Registration, login, logout, token refresh, and authenticated profiles
- Email verification with OTP codes
- Password reset and password management
- Google and GitHub OAuth
- Optional two-factor authentication
- Profile, email, password, and avatar management
- Admin-only user management
- MongoDB persistence and Redis-backed sessions/OTP data
- Request validation with Zod, rate limiting, Helmet, CORS, and centralized errors
- OpenAPI documentation and a downloadable Postman collection

## Stack

- Node.js 18+
- Express 5
- MongoDB with Mongoose
- Redis
- JSON Web Tokens
- Zod
- Argon2
- Nodemailer
- Scalar API Reference

## Requirements

- Node.js 18 or later
- MongoDB
- Redis
- SMTP credentials for email features
- Google and/or GitHub OAuth credentials if social login is needed

## Installation

```bash
git clone https://github.com/Abdelrahman968/sarahah-api.git
cd sarahah-api
npm install
```

Copy the example environment file and replace every placeholder with a
development value:

```bash
cp config/.env.example config/.env.development
```

On Windows PowerShell, use:

```powershell
Copy-Item config/.env.example config/.env.development
```

The application loads `config/.env.development` when `NODE_ENV=development`
and `config/.env.production` when `NODE_ENV=production`. Environment values
are validated during startup. JWT secrets must be at least 32 characters.

## Environment variables

| Group            | Variables                                                                                                                                                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App              | `NODE_ENV`, `PORT`, `API_PREFIX`, `TRUSTED_ORIGINS`                                                                                                                                                                                           |
| Database         | `MONGO_URI`, `MONGO_DB_NAME`, `REDIS_URL`                                                                                                                                                                                                     |
| JWT              | `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_ADMIN_ACCESS_SECRET`, `JWT_ADMIN_ACCESS_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`, `JWT_ADMIN_REFRESH_SECRET`, `JWT_ADMIN_REFRESH_EXPIRES_IN`, `JWT_REFRESH_COOKIE_NAME` |
| OTP and login    | `CODE_CHARACTERS`, `OTP_LENGTH`, `OTP_EXPIRES_IN`, `OTP_MAX_ATTEMPTS`, `LOGIN_MAX_ATTEMPTS`                                                                                                                                                   |
| Email            | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`                                                                                                                                                                           |
| Client and OAuth | `CLIENT_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`                                                                                            |
| Avatars          | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`                                                                                                                                                                        |

`TRUSTED_ORIGINS` accepts a comma-separated list of origins, for example
`http://localhost:3000,http://localhost:5000`.

## Running

Development mode (Node watch mode):

```bash
npm run start:dev
```

Production mode:

```bash
npm run start:node
```

With the example configuration, the API base URL is:

```text
http://localhost:5000/api/v1
```

The server connects to Redis and MongoDB before it starts listening. Make sure
both services are available before running the application.

## Documentation

> ### 🚀 Explore the Hosted Postman Documentation
>
> Test the Sarahah API instantly with the complete hosted Postman collection:
>
> **[📚 Open Sarahah API Documentation](https://documenter.getpostman.com/view/34579966/2sBYHYuJ5N)**

Open the interactive Scalar API reference at:

```text
http://localhost:5000/api/v1/docs
```

Download the Postman collection at:

```text
http://localhost:5000/api/v1/docs/postman
```

The OpenAPI document covers system, authentication, OAuth, OTP/2FA, user, and
admin endpoints. The Postman collection includes ready-to-use requests; set
its variables for your local API and account, then use Login to obtain an
access token.

## API overview

All paths below are relative to `/api/v1`.

### System

| Method | Path                | Purpose                                |
| ------ | ------------------- | -------------------------------------- |
| `GET`  | `/system/health`    | Check API and database health          |
| `GET`  | `/system/get-users` | List users through the system endpoint |

### Authentication

| Method | Path                     | Purpose                                          |
| ------ | ------------------------ | ------------------------------------------------ |
| `POST` | `/auth/register`         | Create an account                                |
| `POST` | `/auth/login`            | Log in with username or email                    |
| `POST` | `/auth/login/verify-2fa` | Complete a 2FA login challenge                   |
| `POST` | `/auth/refresh-token`    | Issue a new access token from the refresh cookie |
| `POST` | `/auth/logout`           | Revoke the current session                       |
| `GET`  | `/auth/profile`          | Get the authenticated profile                    |
| `GET`  | `/auth/activate-request` | Send an email verification OTP                   |
| `POST` | `/auth/activate-email`   | Verify an email OTP                              |
| `POST` | `/auth/resend-otp`       | Resend an email or 2FA OTP                       |
| `POST` | `/auth/forgot-password`  | Request a password reset                         |
| `POST` | `/auth/reset-password`   | Set a password with a reset token                |
| `POST` | `/auth/set-password`     | Set a password for an OAuth account              |
| `GET`  | `/auth/2fa-enable`       | Start 2FA setup                                  |
| `POST` | `/auth/2fa-verify`       | Verify and enable 2FA                            |
| `GET`  | `/auth/2fa-disable`      | Disable 2FA                                      |
| `GET`  | `/auth/google`           | Start Google OAuth                               |
| `GET`  | `/auth/google/callback`  | Complete Google OAuth                            |
| `GET`  | `/auth/github`           | Start GitHub OAuth                               |
| `GET`  | `/auth/github/callback`  | Complete GitHub OAuth                            |

### Users

| Method   | Path                    | Purpose                                 |
| -------- | ----------------------- | --------------------------------------- |
| `GET`    | `/user/profile`         | Get the current user's profile          |
| `PATCH`  | `/user/update-profile`  | Update profile fields                   |
| `PATCH`  | `/user/update-email`    | Change email address                    |
| `PATCH`  | `/user/update-password` | Change password                         |
| `PATCH`  | `/user/update-avatar`   | Upload an avatar as multipart form data |
| `DELETE` | `/user/delete/me`       | Delete the current account              |

### Messaging

Messaging routes require an authenticated user with a verified email address.
Pagination uses `page` (default `1`) and `limit` (default `20`, maximum `100`).

| Method   | Path                                                | Purpose                                                  |
| -------- | --------------------------------------------------- | -------------------------------------------------------- |
| `POST`   | `/messaging/messages`                               | Send an anonymous text message                           |
| `GET`    | `/messaging/messages/received`                      | List received anonymous messages without sender identity |
| `GET`    | `/messaging/messages/sent`                          | List sent anonymous messages                             |
| `DELETE` | `/messaging/messages/:id`                           | Delete a message sent by the current user                |
| `POST`   | `/messaging/messages/:messageId/identity-requests`  | Request the sender identity of a received message        |
| `GET`    | `/messaging/identity-requests`                      | List requests for messages sent by the current user      |
| `PATCH`  | `/messaging/identity-requests/:requestId`           | Accept or reject a sender identity request               |
| `GET`    | `/messaging/conversations`                          | List conversations and participant profiles              |
| `GET`    | `/messaging/conversations/:id`                      | Get conversation details                                 |
| `PATCH`  | `/messaging/conversations/:id/read`                 | Mark the current user's conversation as read             |
| `DELETE` | `/messaging/conversations/:id`                      | Hide the conversation for the current user               |
| `POST`   | `/messaging/conversations/:conversationId/messages` | Send a conversation message                              |
| `GET`    | `/messaging/conversations/:conversationId/messages` | Get conversation participants and paginated messages     |

### Blocking

Blocking routes require an authenticated user with a verified email address.
Blocking either user prevents anonymous messages and conversation access in both directions until the block is removed. Existing conversations remain stored.

| Method   | Path                | Purpose            |
| -------- | ------------------- | ------------------ |
| `POST`   | `/blocking/:userId` | Block a user       |
| `DELETE` | `/blocking/:userId` | Unblock a user     |
| `GET`    | `/blocking`         | List blocked users |

### Reporting

Users can report a received message or another user with a reason (`spam`, `harassment`, `inappropriate`, `threats`, or `other`) and optional details. Reports require an authenticated, verified account. Admin review routes require the `admin` role.

| Method  | Path                             | Purpose                                           |
| ------- | -------------------------------- | ------------------------------------------------- |
| `POST`  | `/reporting/messages/:messageId` | Report a message received by the current user     |
| `POST`  | `/reporting/users/:userId`       | Report another user                               |
| `GET`   | `/reporting/mine`                | Track the current user's paginated reports        |
| `GET`   | `/admin/reports`                 | List reports, optionally filtered by status       |
| `GET`   | `/admin/reports/:reportId`       | Review a report and its target details            |
| `PATCH` | `/admin/reports/:reportId`       | Set review status, action outcome, and admin note |

### Admin

Admin routes require an authenticated user with the `admin` role.

| Method   | Path                       | Purpose                       |
| -------- | -------------------------- | ----------------------------- |
| `GET`    | `/admin/users`             | List all users                |
| `GET`    | `/admin/user?userName=...` | Find a user by username query |
| `GET`    | `/admin/user/:userName`    | Find a user by username path  |
| `POST`   | `/admin/edit/user/:id`     | Update a user                 |
| `DELETE` | `/admin/delete/user/:id`   | Delete a user                 |

## Authentication notes

- Send the access token with `Authorization: Bearer <token>`.
- Refresh tokens are stored in the `refreshToken` HttpOnly cookie by default.
- Email verification is required for protected user features and 2FA setup.
- Keep OAuth client secrets, JWT secrets, SMTP passwords, and database
  credentials out of source control.

## Project structure

```text
.
├── config/       # Environment loading and validation
├── src/
│   ├── db/       # MongoDB, Redis, models, and repositories
│   ├── docs/     # OpenAPI registration and Postman collection
│   ├── middleware/
│   ├── modules/  # Auth, users, admins, and system routes
│   ├── services/
│   └── utils/
├── server.js
└── package.json
```

## License

This project is for educational and personal development use.
