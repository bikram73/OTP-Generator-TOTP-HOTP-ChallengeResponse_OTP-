# OTP Generator (TOTP, HOTP, Challenge Response OTP) Next.js 15 Application

Professional multi-factor authentication system supporting TOTP, HOTP, and Challenge-Response OTP protocols. Built with Next.js 15, TypeScript, and Tailwind CSS.

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
│   ├── challenge-guide/  # Challenge-Response guide
│   ├── about/            # About page with OTP comparisons
│   └── qrcode/           # QR code display
├── lib/
│   ├── otp/              # TOTP/HOTP/Challenge-Response implementations
│   ├── security.ts       # Security utilities
│   ├── user-manager.ts   # User management
│   └── challenge-manager.ts # Challenge lifecycle management
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

## 📝 Environment Variables

Create a `.env.local` file:

```env
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## 🎯 API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/otp/generate` - Generate OTP code
- `POST /api/otp/verify` - Verify OTP code
- `GET /api/qrcode` - Get QR code for mobile app

## 🔒 Security Features

- JWT-based authentication
- HTTP-only cookies
- Password strength validation
- Encrypted secret storage
- Rate limiting (to be implemented)

## 📱 Mobile Authenticator Support

Compatible with:
- Google Authenticator
- Microsoft Authenticator
- Authy
- LastPass Authenticator
- Any TOTP/HOTP compatible app

