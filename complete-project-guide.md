# Complete Project Guide - OTP Generator

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Project Structure](#2-project-structure)
3. [System Requirements](#3-system-requirements)
4. [Installation Guide](#4-installation-guide)
5. [Data Pipeline](#5-data-pipeline)
6. [Model Training](#6-model-training)
7. [Project Working](#7-project-working)
8. [Web Application](#8-web-application)
9. [API Documentation](#9-api-documentation)
10. [Testing Guide](#10-testing-guide)
11. [Performance Metrics](#11-performance-metrics)
12. [Troubleshooting](#12-troubleshooting)
13. [Security Features](#13-security-features)
14. [Deployment Guide](#14-deployment-guide)
15. [Contributing Guidelines](#15-contributing-guidelines)

---

## 1. Project Overview

### 1.1 Description
The OTP Generator is a professional-grade authentication system built with Next.js 15, implementing both TOTP (Time-based One-Time Password) and HOTP (HMAC-based One-Time Password) standards. The application provides secure two-factor authentication with modern web technologies and enterprise-level security features.

### 1.2 Key Features
- **RFC Compliant**: Full compliance with RFC 6238 (TOTP) and RFC 4226 (HOTP)
- **Dual Authentication**: Support for both time-based and counter-based OTP
- **Enterprise Security**: AES-256 encryption, bcrypt hashing, JWT tokens
- **Mobile Compatibility**: QR code generation for authenticator apps
- **Replay Attack Prevention**: Advanced security measures against code reuse
- **User Management**: Complete user registration, authentication, and management
- **Modern UI**: Responsive design with Tailwind CSS and Framer Motion

### 1.3 Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Security**: bcryptjs, jsonwebtoken, crypto-js, speakeasy
- **UI Components**: Radix UI, Lucide React, Framer Motion
- **Development**: ESLint, TypeScript, PostCSS

---

## 2. Project Structure

```
otp-generator-nextjs/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/route.ts    # User login
│   │   │   └── register/route.ts # User registration
│   │   ├── otp/                  # OTP operations
│   │   │   ├── generate/route.ts # Generate OTP codes
│   │   │   └── verify/route.ts   # Verify OTP codes
│   │   └── qrcode/route.ts       # QR code generation
│   ├── dashboard/                # User dashboard
│   │   └── page.tsx              # Dashboard interface
│   ├── login/                    # Login page
│   │   └── page.tsx              # Login form
│   ├── register/                 # Registration page
│   │   └── page.tsx              # Registration form
│   ├── verify/                   # OTP verification
│   │   └── page.tsx              # Verification interface
│   ├── qrcode/                   # QR code display
│   │   └── page.tsx              # QR code viewer
│   ├── about/                    # About page
│   │   └── page.tsx              # Project information
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # Reusable components
│   └── ui/                       # UI components
│       ├── dot-pattern.tsx       # Background pattern
│       └── text-animate.tsx      # Text animations
├── lib/                          # Core libraries
│   ├── otp/                      # OTP implementations
│   │   ├── totp.ts               # TOTP generator
│   │   └── hotp.ts               # HOTP generator
│   ├── auth.ts                   # Authentication utilities
│   ├── security.ts               # Security manager
│   ├── user-manager.ts           # User management
│   └── utils.ts                  # Utility functions
├── .env.local                    # Environment variables
├── users.json                    # User database (JSON)
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind configuration
├── next.config.js                # Next.js configuration
└── README.md                     # Project documentation
```

### 2.1 Core Modules

#### Authentication Module (`lib/auth.ts`)
- JWT token management
- Cookie-based authentication
- User session verification

#### Security Module (`lib/security.ts`)
- Password hashing with bcrypt
- AES-256 data encryption
- Rate limiting and lockout protection
- Backup code generation
- Password strength validation

#### User Management (`lib/user-manager.ts`)
- User registration and authentication
- OTP secret management
- Backup code handling
- Account security features

#### OTP Generators (`lib/otp/`)
- **TOTP**: Time-based codes with 30-second intervals
- **HOTP**: Counter-based codes with synchronization

---

## 3. System Requirements

### 3.1 Development Environment
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **Operating System**: Windows, macOS, or Linux
- **Memory**: Minimum 4GB RAM
- **Storage**: 500MB free space

### 3.2 Browser Compatibility
- **Chrome**: Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+

### 3.3 Mobile Authenticator Apps
- Google Authenticator
- Microsoft Authenticator
- Authy
- LastPass Authenticator
- Any RFC-compliant TOTP/HOTP app

---

## 4. Installation Guide

### 4.1 Clone Repository
```bash
git clone <repository-url>
cd otp-generator-nextjs
```

### 4.2 Install Dependencies
```bash
# Standard installation
npm install

# For React 19 compatibility (recommended)
npm install --legacy-peer-deps

# Or use the npm script
npm run install-deps
```

### 4.3 Environment Setup
Create `.env.local` file:
```env
JWT_SECRET=your-super-secure-jwt-secret-key-here
NODE_ENV=development
```

### 4.4 Start Development Server
```bash
npm run dev
```
Access the application at `http://localhost:3000`

### 4.5 Production Build
```bash
npm run build
npm start
```

---

## 5. Data Pipeline

### 5.1 User Data Flow
```
Registration → Password Hashing → Secret Generation → Encryption → Storage
     ↓
Authentication → Secret Decryption → OTP Generation → Verification
```

### 5.2 Data Storage Structure
```json
{
  "username": {
    "username": "string",
    "email": "string",
    "passwordHash": "bcrypt_hash",
    "otpType": "totp|hotp",
    "otpSecretEncrypted": "aes_encrypted_secret",
    "encryptionSalt": "hex_salt",
    "counter": "number (HOTP only)",
    "backupCodes": [
      {
        "hash": "bcrypt_hash",
        "used": "boolean"
      }
    ],
    "createdAt": "timestamp",
    "locked": "boolean",
    "usedTotpCodes": [
      {
        "code": "string",
        "timeStep": "number",
        "usedAt": "timestamp"
      }
    ]
  }
}
```

### 5.3 Security Pipeline
1. **Input Validation**: Zod schema validation
2. **Rate Limiting**: Failed attempt tracking
3. **Encryption**: AES-256 for secrets, bcrypt for passwords
4. **Authentication**: JWT token verification
5. **Authorization**: User session management

---

## 6. Model Training

*Note: This project doesn't use machine learning models. Instead, it implements cryptographic algorithms.*

### 6.1 Cryptographic Models Used

#### HMAC-SHA1 Algorithm
- **Purpose**: Generate OTP codes
- **Implementation**: speakeasy library
- **Standards**: RFC 4226 (HOTP), RFC 6238 (TOTP)

#### AES-256 Encryption
- **Purpose**: Encrypt OTP secrets
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Salt**: 16-byte random salt per user

#### bcrypt Hashing
- **Purpose**: Password storage
- **Rounds**: 12 (configurable)
- **Salt**: Automatic per-password salt

---

## 7. Project Working

### 7.1 Application Flow

#### User Registration
1. User provides username, password, email
2. Password strength validation
3. Password hashing with bcrypt
4. OTP secret generation
5. Secret encryption with user password
6. Backup codes generation
7. User data storage

#### Authentication Process
1. User login with credentials
2. Password verification
3. JWT token generation
4. Secure cookie setting
5. Dashboard access

#### OTP Generation
1. Secret decryption using user password
2. TOTP: Time-based calculation (30-second window)
3. HOTP: Counter-based calculation
4. 6-digit code generation
5. QR code creation for mobile apps

#### OTP Verification
1. User submits OTP code
2. Secret retrieval and decryption
3. Code validation against current time/counter
4. Replay attack prevention (TOTP)
5. Success/failure response

### 7.2 Security Mechanisms

#### Replay Attack Prevention
- **TOTP**: Track used codes per time step
- **HOTP**: Counter synchronization
- **Cleanup**: Automatic removal of old tracking data

#### Rate Limiting
- **Failed Attempts**: Maximum 5 attempts
- **Lockout Duration**: 5 minutes
- **Reset**: Automatic on successful login

#### Data Protection
- **Encryption**: All secrets encrypted at rest
- **Hashing**: Passwords never stored in plaintext
- **Tokens**: HTTP-only secure cookies

---

## 8. Web Application

### 8.1 User Interface Components

#### Home Page (`app/page.tsx`)
- Welcome interface
- Feature overview
- Navigation to registration/login

#### Registration (`app/register/page.tsx`)
- User account creation
- Password strength validation
- OTP type selection (TOTP/HOTP)

#### Login (`app/login/page.tsx`)
- User authentication
- Remember me functionality
- Error handling

#### Dashboard (`app/dashboard/page.tsx`)
- OTP code display
- QR code access
- Account management
- Logout functionality

#### QR Code Viewer (`app/qrcode/page.tsx`)
- Mobile app setup
- Provisioning URI display
- Setup instructions

### 8.2 UI Features
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: System preference detection
- **Animations**: Framer Motion transitions
- **Accessibility**: ARIA labels and keyboard navigation
- **Loading States**: Skeleton loaders and spinners

### 8.3 Styling
- **Framework**: Tailwind CSS
- **Components**: Radix UI primitives
- **Icons**: Lucide React
- **Fonts**: System fonts with fallbacks
- **Colors**: Consistent design system

---

## 9. API Documentation

### 9.1 Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "username": "string (min 3 chars)",
  "password": "string (min 8 chars, complex)",
  "email": "string (optional)",
  "otpType": "totp|hotp (default: totp)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userData": {
    "username": "string",
    "otpSecret": "string",
    "otpType": "totp|hotp",
    "backupCodes": ["string[]"]
  }
}
```

#### POST `/api/auth/login`
Authenticate user and create session.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful"
}
```

**Sets HTTP-only cookie:** `auth-token`

### 9.2 OTP Endpoints

#### GET `/api/otp/generate`
Generate current OTP code for authenticated user.

**Headers:**
- Cookie: `auth-token=jwt_token`

**Response:**
```json
{
  "success": true,
  "otpCode": "123456",
  "otpType": "totp|hotp",
  "remainingTime": 25,
  "counter": 5
}
```

#### POST `/api/otp/verify`
Verify OTP code.

**Headers:**
- Cookie: `auth-token=jwt_token`

**Request Body:**
```json
{
  "otpCode": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

### 9.3 QR Code Endpoint

#### GET `/api/qrcode`
Generate QR code for mobile authenticator setup.

**Headers:**
- Cookie: `auth-token=jwt_token`

**Response:**
```json
{
  "success": true,
  "qrCodeUrl": "data:image/png;base64,..."
}
```

### 9.4 Error Responses
All endpoints return consistent error format:
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE (optional)"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (validation error)
- `401`: Unauthorized (authentication required)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

---

## 10. Testing Guide

### 10.1 Test Files Overview

#### HOTP Behavior Test (`test-hotp-behavior.js`)
Tests HOTP counter management and code verification.

**Run Test:**
```bash
node test-hotp-behavior.js
```

**Test Coverage:**
- Counter increment behavior
- Multiple verification of same code
- Code expiration after counter advance

#### TOTP Security Test (`test-totp-security.js`)
Tests TOTP time-based functionality and security.

**Run Test:**
```bash
node test-totp-security.js
```

**Test Coverage:**
- Time-based code generation
- Strict 30-second window validation
- Remaining time calculation

### 10.2 Manual Testing Procedures

#### Registration Testing
1. Navigate to `/register`
2. Test password validation:
   - Short passwords (< 8 chars)
   - Weak passwords (no uppercase/numbers)
   - Strong passwords
3. Test username validation:
   - Duplicate usernames
   - Short usernames (< 3 chars)
4. Verify successful registration creates user

#### Authentication Testing
1. Navigate to `/login`
2. Test invalid credentials
3. Test rate limiting (5+ failed attempts)
4. Test successful login redirects to dashboard
5. Verify JWT cookie is set

#### OTP Testing
1. Access dashboard after login
2. Verify OTP code generation
3. Test code verification
4. Test QR code generation
5. Test mobile app integration

### 10.3 Security Testing

#### Replay Attack Testing
1. Generate TOTP code
2. Verify code successfully
3. Attempt to verify same code again
4. Should fail with "already used" message

#### Rate Limiting Testing
1. Make 5+ failed login attempts
2. Account should be locked for 5 minutes
3. Verify lockout message
4. Wait for lockout to expire

#### Encryption Testing
1. Check `users.json` file
2. Verify passwords are hashed (bcrypt)
3. Verify OTP secrets are encrypted
4. Verify no plaintext sensitive data

### 10.4 Performance Testing

#### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Create test config
artillery quick --count 10 --num 5 http://localhost:3000/api/auth/login
```

#### Memory Testing
Monitor application memory usage during:
- User registration
- OTP generation
- Multiple concurrent users

---

## 11. Performance Metrics

### 11.1 Application Performance

#### Response Times (Target)
- **Home Page Load**: < 500ms
- **API Endpoints**: < 200ms
- **OTP Generation**: < 100ms
- **QR Code Generation**: < 300ms

#### Memory Usage
- **Base Application**: ~50MB
- **Per User Session**: ~1KB
- **Database (JSON)**: ~1KB per user

#### Security Performance
- **Password Hashing**: ~100ms (bcrypt rounds: 12)
- **Encryption/Decryption**: < 10ms
- **JWT Verification**: < 5ms

### 11.2 Scalability Metrics

#### Concurrent Users
- **Development**: 10-50 users
- **Production**: 100-1000 users (with optimization)

#### Database Performance
- **JSON File**: Suitable for < 1000 users
- **Recommended**: Migrate to PostgreSQL/MongoDB for production

#### Rate Limiting
- **Login Attempts**: 5 per 5 minutes per user
- **API Calls**: No limit (implement as needed)

### 11.3 Security Metrics

#### Encryption Strength
- **AES-256**: Military-grade encryption
- **PBKDF2**: 100,000 iterations
- **bcrypt**: 12 rounds (2^12 = 4096 iterations)

#### Token Security
- **JWT**: HS256 algorithm
- **Cookie**: HTTP-only, Secure, SameSite
- **Expiration**: Configurable (default: session)

---

## 12. Troubleshooting

### 12.1 Common Issues

#### Installation Problems

**Issue**: `npm install` fails with peer dependency warnings
```bash
# Solution: Use legacy peer deps flag
npm install --legacy-peer-deps
```

**Issue**: Node.js version compatibility
```bash
# Check Node version
node --version

# Upgrade Node.js to 18+ if needed
```

#### Runtime Errors

**Issue**: "JWT_SECRET not found" error
```bash
# Solution: Create .env.local file
echo "JWT_SECRET=your-secret-key-here" > .env.local
```

**Issue**: "Cannot read users.json" error
```bash
# Solution: File will be created automatically on first user registration
# Or create empty file:
echo "{}" > users.json
```

#### Authentication Issues

**Issue**: Login fails with correct credentials
1. Check if user exists in `users.json`
2. Verify password was hashed correctly during registration
3. Check JWT_SECRET consistency
4. Clear browser cookies and try again

**Issue**: OTP codes not working
1. Verify system time is synchronized
2. Check mobile app time synchronization
3. For HOTP, verify counter synchronization
4. Test with different authenticator apps

### 12.2 Debug Mode

#### Enable Debug Logging
Add to `.env.local`:
```env
NODE_ENV=development
DEBUG=true
```

#### Check Application Logs
```bash
# Development server logs
npm run dev

# Check for errors in browser console
# Check Network tab for API responses
```

### 12.3 Database Issues

#### Corrupted users.json
```bash
# Backup current file
cp users.json users.json.backup

# Reset database (WARNING: Deletes all users)
echo "{}" > users.json
```

#### User Account Recovery
```javascript
// Manual user unlock (run in Node.js)
const fs = require('fs');
const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
users['username'].locked = false;
fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
```

### 12.4 Performance Issues

#### Slow Response Times
1. Check system resources (CPU, Memory)
2. Optimize bcrypt rounds if needed
3. Implement caching for frequent operations
4. Consider database migration for large user bases

#### Memory Leaks
1. Monitor memory usage over time
2. Check for unclosed connections
3. Implement proper cleanup in API routes

---

## 13. Security Features

### 13.1 Authentication Security

#### Password Security
- **Minimum Length**: 8 characters
- **Complexity**: Uppercase, lowercase, numbers required
- **Hashing**: bcrypt with 12 rounds
- **Salt**: Unique per password

#### Session Management
- **JWT Tokens**: Signed with secret key
- **HTTP-Only Cookies**: Prevent XSS attacks
- **Secure Flag**: HTTPS-only transmission
- **SameSite**: CSRF protection

### 13.2 OTP Security

#### TOTP Security
- **Time Window**: Strict 30-second validation
- **Replay Prevention**: Track used codes per time step
- **Clock Skew**: No tolerance (window = 0)
- **Cleanup**: Automatic removal of old tracking data

#### HOTP Security
- **Counter Sync**: Automatic synchronization
- **Look-ahead**: Limited window for counter drift
- **Verification**: Multiple checks without increment option

### 13.3 Data Protection

#### Encryption at Rest
- **Algorithm**: AES-256-CBC
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Salt**: 16-byte random salt per user
- **Scope**: All OTP secrets encrypted

#### Rate Limiting
- **Failed Attempts**: 5 attempts per 5 minutes
- **Account Lockout**: Temporary suspension
- **Reset**: Automatic on successful authentication

### 13.4 Security Headers

#### Recommended Headers (implement in production)
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

---

## 14. Deployment Guide

### 14.1 Production Environment Setup

#### Environment Variables
```env
# Production .env.local
JWT_SECRET=super-secure-production-secret-key-256-bits
NODE_ENV=production
```

#### Build Application
```bash
npm run build
npm start
```

### 14.2 Deployment Platforms

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

#### Traditional Server
```bash
# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start npm --name "otp-app" -- start
```

### 14.3 Production Considerations

#### Database Migration
- **Development**: JSON file storage
- **Production**: PostgreSQL, MongoDB, or MySQL
- **Migration**: Implement database adapter pattern

#### Security Hardening
- **HTTPS**: SSL/TLS certificates required
- **Firewall**: Restrict unnecessary ports
- **Updates**: Regular dependency updates
- **Monitoring**: Error tracking and logging

#### Performance Optimization
- **CDN**: Static asset delivery
- **Caching**: Redis for session storage
- **Load Balancing**: Multiple server instances
- **Database**: Connection pooling

---

## 15. Contributing Guidelines

### 15.1 Development Setup

#### Fork and Clone
```bash
git clone https://github.com/your-username/otp-generator-nextjs.git
cd otp-generator-nextjs
npm install --legacy-peer-deps
```

#### Branch Strategy
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Create bugfix branch
git checkout -b bugfix/issue-description
```

### 15.2 Code Standards

#### TypeScript
- **Strict Mode**: Enabled
- **Type Safety**: No `any` types
- **Interfaces**: Define all data structures
- **JSDoc**: Document public functions

#### Code Style
- **Prettier**: Automatic formatting
- **ESLint**: Code quality rules
- **Naming**: camelCase for variables, PascalCase for components

#### Testing Requirements
- **Unit Tests**: All utility functions
- **Integration Tests**: API endpoints
- **Security Tests**: Authentication flows
- **Manual Tests**: UI functionality

### 15.3 Pull Request Process

#### Before Submitting
1. Run tests: `npm test`
2. Check linting: `npm run lint`
3. Build successfully: `npm run build`
4. Update documentation if needed

#### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Security review done

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

### 15.4 Issue Reporting

#### Bug Reports
```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce the behavior

**Expected behavior**
What you expected to happen

**Environment**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Node.js: [e.g. 18.0.0]
```

#### Feature Requests
```markdown
**Feature Description**
Clear description of the proposed feature

**Use Case**
Why is this feature needed?

**Implementation Ideas**
Any ideas on how to implement this?
```

---

## Conclusion

This OTP Generator project provides a comprehensive, secure, and modern implementation of two-factor authentication using industry-standard protocols. The application demonstrates best practices in web security, user experience, and code organization.

For additional support or questions, please refer to the project's GitHub repository or create an issue for community assistance.

**Project Maintainers**: Open to community contributions
**License**: MIT (or as specified in repository)
**Last Updated**: December 2024