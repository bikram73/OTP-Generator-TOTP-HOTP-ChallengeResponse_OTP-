# 🔐 OTP Generator (TOTP, HOTP, Challenge Response OTP)

Professional multi-factor authentication system supporting TOTP, HOTP, and Challenge-Response OTP protocols. Built with Next.js 15, TypeScript, and Tailwind CSS.

## ✨ Overview

This project is a full authentication demo and learning platform for OTP-based security. It includes user registration, login, JWT-based sessions, QR code generation, OTP verification, and a challenge-response flow for higher-security use cases.

## 🧩 What's Included

- 🔐 JWT authentication with HTTP-only cookies
- 🧑‍💻 User registration and login flows
- ⏱️ TOTP generation and verification
- 🔢 HOTP generation and verification
- 🧪 Challenge-response OTP workflows
- 📷 QR code generation for authenticator apps
- 🗃️ Supabase Postgres user and challenge data management
- 🎨 Tailwind-based UI pages and layouts
- 🧱 Reusable UI components for visual polish
- 🛡️ Secret encryption and password hashing utilities

## 📱 Main Pages

- `/` - Home / landing page
- `/login` - Login screen
- `/register` - Registration screen
- `/dashboard` - User dashboard after authentication
- `/verify` - OTP verification page
- `/challenge` - Challenge-response authentication page
- `/about` - Project and OTP comparison page
- `/qrcode` - QR code display page
- `/dashboard/settings` - User settings page

## 🛠️ Core Capabilities

### 🔑 Authentication

- JWT token creation and verification
- Secure cookie-based session handling
- Login flow for password-based access
- Auth checks for protected pages and API routes

### ⏳ OTP Support

- TOTP for time-based one-time passwords
- HOTP for counter-based one-time passwords
- Challenge-response OTP for transaction-level validation
- Secret generation and verification helpers

### 🧰 Security Utilities

- Password hashing with bcrypt
- Secret storage encryption helpers
- Token validation helpers
- Challenge lifecycle management

### 🎯 User Experience

- QR code generation for authenticator apps
- Animated and reusable UI components
- Responsive layout built with Tailwind CSS
- Dedicated pages for learning and testing OTP flows

## 🚀 Quick Start

### Installation

```bash
# Install dependencies (use --legacy-peer-deps for React 19 compatibility)
npm install --legacy-peer-deps
powershell -ExecutionPolicy Bypass -Command "npm install --legacy-peer-deps"

# Or use the npm script
npm run install-deps

# Run development server
npm run dev
powershell -ExecutionPolicy Bypass -Command "npm run dev"

```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── otp/          # OTP generation/verification
│   │   ├── challenge/    # Challenge-Response endpoints
│   │   └── user/         # User information endpoints
│   ├── dashboard/        # Dashboard page
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── verify/           # OTP verification page
│   ├── challenge/        # Challenge-Response page
│   ├── about/            # About page with OTP comparisons
│   └── qrcode/           # QR code display
├── lib/
│   ├── otp/              # TOTP/HOTP/Challenge-Response implementations
│   ├── security.ts       # Security utilities
│   ├── user-manager.ts   # User management
│   ├── challenge-manager.ts # Challenge lifecycle management
│   └── supabase-admin.ts # Supabase server client
├── components/
│   └── ui/               # Reusable visual components
└── package.json
```

## 🛡️ Authentication Methods

### TOTP (Time-based One-Time Password)
- **RFC 6238** compliant
- **30-second** time windows
- **Automatic expiration** and refresh
- **Mobile app compatible** (Google Authenticator, Authy)
- **Best for**: Daily user authentication, 2FA

### HOTP (HMAC-based One-Time Password)
- **RFC 4226** compliant
- **Counter-based** generation
- **Manual code generation**
- **No automatic expiration**
- **Best for**: API authentication, event-driven auth

### Challenge-Response OTP (Enterprise Security)
- **Server-generated** unique challenges
- **Transaction-specific** authentication
- **5-minute expiration** window
- **Single-use** challenges
- **Maximum security** for high-value operations
- **Best for**: Financial transactions, administrative actions

## 🚀 Challenge-Response OTP Usage

### Registration
1. Visit `/register`
2. Select "Challenge-Response (Enterprise Security)"
3. Complete registration with username, email, password

### Authentication Flow
1. **Login** with username/password
2. **Redirected** to `/challenge` page
3. **Generate Challenge** - Server creates unique challenge
4. **Get Challenge Code** - Via display or QR code
5. **Generate Response** - Use authenticator with challenge + secret
6. **Verify Response** - Enter 6-digit response code
7. **Access Granted** - Redirect to dashboard

### API Endpoints

#### Generate Challenge
```javascript
POST /api/challenge/generate
{
  "context": "Wire Transfer $10,000 to Account 12345"
}

Response:
{
  "success": true,
  "challenge": {
    "id": "uuid",
    "challenge": "8-char-hex-string",
    "context": "transaction-details",
    "expiresAt": 1234567890
  }
}
```

#### Verify Response
```javascript
POST /api/challenge/verify
{
  "challengeId": "challenge-uuid",
  "response": "123456"
}

Response:
{
  "success": true,
  "message": "Challenge verified successfully"
}
```

#### Get QR Code
```javascript
GET /api/challenge/qrcode?challengeId=uuid

Response:
{
  "success": true,
  "qrCode": "data:image/png;base64,..."
}
```

### Security Features
- **Unique per request**: Each challenge is cryptographically random
- **Time-limited**: 5-minute expiration window
- **Single-use**: Cannot be reused after verification
- **Context-aware**: Can include transaction-specific data
- **No replay attacks**: Each challenge is unique
- **Transaction binding**: Challenge includes transaction details
- **Server control**: Server initiates each authentication

### Use Cases
- **High-value transactions**: Wire transfers, large purchases
- **Administrative actions**: User management, system configuration
- **API authentication**: Critical operations, data exports
- **Enterprise security**: Maximum protection for sensitive operations

## 🔐 Features

- ✅ **TOTP** (Time-based One-Time Password) - RFC 6238
- ✅ **HOTP** (HMAC-based One-Time Password) - RFC 4226
- ✅ **Secure Authentication** with JWT tokens
- ✅ **AES-256 Encryption** for secret storage
- ✅ **bcrypt Password Hashing**
- ✅ **QR Code Generation** for mobile authenticators
- ✅ **Modern UI** with Tailwind CSS
- ✅ **TypeScript** for type safety

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Modern styling
- **speakeasy** - OTP generation (RFC compliant)
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **qrcode** - QR code generation
- **framer-motion** - Motion and animations
- **lucide-react** - Icons
- **zod** - Schema validation

## 📝 Environment Variables

Create a `.env.local` file:

```env
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### 🔒 Important Note

- Replace `JWT_SECRET` with a long, random value before using the app in production.
- Keep the same secret across restarts if you want existing login tokens to remain valid.
- Do not commit `.env.local` to source control.

## 🎯 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### OTP

- `GET /api/otp/generate` - Generate OTP code
- `GET /api/otp/generate-next` - Generate the next OTP code
- `POST /api/otp/verify` - Verify OTP code

### QR Code

- `GET /api/qrcode` - Get QR code for mobile app

### Challenge Flow

- `GET /api/challenge/active` - View active challenge data
- `POST /api/challenge/generate` - Create a new challenge
- `POST /api/challenge/generate-response` - Generate a challenge response
- `POST /api/challenge/verify` - Verify a challenge response
- `POST /api/challenge/verify-fixed` - Verify using a fixed challenge flow
- `GET /api/challenge/qrcode` - Get a QR code for a challenge
- `POST /api/challenge/quick-solve` - Quick challenge solving helper
- `POST /api/challenge/clear-all` - Clear stored challenges

### User Data

- `GET /api/user/info` - Get authenticated user information
- `GET /api/user/secret` - Access user secret data
- `POST /api/user/convert-to-totp` - Convert a user to TOTP flow

## 🔒 Security Features

- JWT-based authentication
- HTTP-only cookies
- Password strength validation
- Encrypted secret storage
- Session-based OTP access flow
- Challenge replay prevention
- Rate limiting (to be implemented)

## 📱 Mobile Authenticator Support

Compatible with:
- Google Authenticator
- Microsoft Authenticator
- Authy
- LastPass Authenticator
- Any TOTP/HOTP compatible app

## 🧪 Helpful Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production app
- `npm start` - Run the production build
- `npm run install-deps` - Install dependencies with legacy peer dependency support

