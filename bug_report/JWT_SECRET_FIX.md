# JWT Secret Configuration Fix - Documentation

## Problem Statement

The application was experiencing an issue where `config.jwt_secret` was `undefined`, causing JWT verification to fail.

## Root Causes

### 1. Missing Environment Variable
- The `JWT_SECRET` environment variable was not defined
- Next.js requires environment variables to be set in `.env.local` file (or other `.env.*` files)
- Without this file, `process.env.JWT_SECRET` returns `undefined`

### 2. Security Vulnerability: Client-Side JWT Secret Access
- **Critical Issue**: The original implementation attempted to access `config.jwt_secret` from a client component (`QRCodeContainer.tsx`)
- In Next.js, client components (marked with `'use client'`) cannot access server-side environment variables
- Even if accessible, **JWT secrets should NEVER be exposed to the client-side** for security reasons
- This would expose the secret key in the browser's JavaScript bundle, making it publicly visible

## Solution Architecture

### Overview
The solution implements a **server-side API route** pattern for JWT verification, keeping sensitive operations and secrets on the server.

```
Client Component (Browser)
    ↓
API Route (Server)
    ↓
JWT Verification Utility (Server)
    ↓
Environment Variable (Server-only)
```

### Key Changes

1. **Created Server-Side API Route**
   - New file: `src/app/api/verify-jwt/route.ts`
   - Handles JWT verification requests from the client
   - Runs exclusively on the server where environment variables are accessible
   - Returns validation result without exposing the secret

2. **Updated Client Component**
   - Modified: `src/components/QRCodeContainer.tsx`
   - Removed direct access to `config.jwt_secret`
   - Now calls the API route via `fetch()` instead of direct JWT verification
   - Added loading state for better UX (`isVerifying`)

3. **Enhanced Configuration**
   - Updated: `src/config/index.ts`
   - Added error logging when `JWT_SECRET` is missing
   - Improved documentation with comments about server-side only usage

## Files Changed

### Created Files

#### `src/app/api/verify-jwt/route.ts`
- **Purpose**: Server-side API endpoint for JWT verification
- **Method**: POST
- **Request Body**: `{ token: string }`
- **Response**:
  - Success: `{ valid: true, payload: JwtPayload }`
  - Failure: `{ valid: false, error: string }`
- **Status Codes**:
  - `200`: Valid token
  - `400`: Missing token
  - `401`: Invalid token
  - `500`: Server error

### Modified Files

#### `src/components/QRCodeContainer.tsx`
**Before:**
- Directly imported and used `verifyJwt()` function
- Attempted to access `config.jwt_secret` in client component
- This caused `undefined` errors and security issues

**After:**
- Removed direct JWT verification imports
- Calls `/api/verify-jwt` endpoint instead
- Added `isVerifying` state for loading indication
- Button shows "Verifying..." during API call
- Better error handling

#### `src/config/index.ts`
**Before:**
```typescript
export const config = {
    jwt_secret: process.env.JWT_SECRET,
}
```

**After:**
```typescript
export const config = {
    jwt_secret: process.env.JWT_SECRET || (() => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('⚠️ JWT_SECRET environment variable is not set!');
            console.error('Please create a .env.local file with JWT_SECRET=your-secret-key');
        }
        return secret || '';
    })(),
}
```
- Added error logging for missing environment variable
- Added helpful error messages for developers

## Setup Instructions

### 1. Create Environment Variable File

Create a `.env.local` file in the project root directory:

```env
JWT_SECRET=your-secret-key-here-change-this-in-production
```

**Important Notes:**
- Replace `your-secret-key-here-change-this-in-production` with a strong, random secret key
- Use a long, random string (at least 32 characters recommended)
- Never commit this file to version control (already in `.gitignore`)
- Use different secrets for development and production environments

### 2. Generate a Secure Secret Key

You can generate a secure secret using one of these methods:

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Using OpenSSL:**
```bash
openssl rand -hex 64
```

### 3. Restart Development Server

After creating `.env.local`:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

**Important**: Next.js only loads environment variables on server start. You must restart the server after creating or modifying `.env.local`.

## API Usage

### Endpoint: `/api/verify-jwt`

#### Request
```typescript
POST /api/verify-jwt
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success Response (200)
```json
{
  "valid": true,
  "payload": {
    "sub": "user123",
    "iat": 1234567890,
    "exp": 1234571490
  }
}
```

#### Error Responses

**Missing Token (400)**
```json
{
  "valid": false,
  "error": "Token is required"
}
```

**Invalid Token (401)**
```json
{
  "valid": false,
  "error": "Invalid token"
}
```

**Server Error (500)**
```json
{
  "valid": false,
  "error": "Internal server error"
}
```

## Security Improvements

### ✅ What Was Fixed

1. **Secret Isolation**: JWT secret is now only accessible server-side
2. **No Client Exposure**: Secret never appears in browser JavaScript bundle
3. **API Pattern**: Follows Next.js best practices for sensitive operations
4. **Error Handling**: Proper error messages without exposing sensitive details

### 🔒 Security Best Practices Applied

- ✅ Secrets stored in environment variables (not in code)
- ✅ Server-side only secret access
- ✅ API route pattern for sensitive operations
- ✅ `.env.local` in `.gitignore` (not committed)
- ✅ No secrets in client-side code

## Testing

### Verify Setup

1. **Check Environment Variable**:
   ```bash
   # In server-side code (e.g., API route)
   console.log(process.env.JWT_SECRET) // Should print your secret (server-side only)
   ```

2. **Test API Endpoint**:
   ```bash
   curl -X POST http://localhost:3000/api/verify-jwt \
     -H "Content-Type: application/json" \
     -d '{"token":"your-jwt-token-here"}'
   ```

3. **Test in Browser**:
   - Open the application
   - Enter a valid JWT token
   - Submit the form
   - Verify QR code is generated for valid tokens
   - Verify error handling for invalid tokens

## Troubleshooting

### Issue: `config.jwt_secret` is still undefined

**Possible Causes:**
1. `.env.local` file not created
2. Server not restarted after creating `.env.local`
3. Typo in environment variable name (should be `JWT_SECRET`)

**Solution:**
1. Verify `.env.local` exists in project root
2. Check file contents match: `JWT_SECRET=your-secret-key`
3. Restart the development server
4. Check server console for error messages

### Issue: API returns 401 for valid tokens

**Possible Causes:**
1. Wrong JWT secret in `.env.local`
2. Token was signed with a different secret
3. Token is expired

**Solution:**
1. Verify `JWT_SECRET` matches the secret used to sign the token
2. Check token expiration
3. Verify token format is correct

### Issue: CORS or Network Errors

**Possible Causes:**
1. API route not found
2. Next.js server not running
3. Route handler syntax error

**Solution:**
1. Verify `src/app/api/verify-jwt/route.ts` exists
2. Check Next.js server is running
3. Review browser console for errors
4. Check server console for route errors

## Architecture Diagram

```
┌─────────────────────────────────────┐
│   Client Component (Browser)        │
│   QRCodeContainer.tsx               │
│   - User enters JWT token           │
│   - Calls fetch('/api/verify-jwt')  │
└──────────────┬──────────────────────┘
               │ HTTP POST
               │ { token: "..." }
               ▼
┌─────────────────────────────────────┐
│   API Route (Server)                │
│   /api/verify-jwt/route.ts          │
│   - Receives token from client      │
│   - Calls verifyJwt() utility       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   JWT Utility (Server)              │
│   utils/jwt.ts                      │
│   - Uses config.jwt_secret          │
│   - Verifies token signature        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Config (Server)                   │
│   config/index.ts                   │
│   - Reads process.env.JWT_SECRET    │
│   - From .env.local file            │
└─────────────────────────────────────┘
```

## Summary

This fix addresses both the immediate problem (undefined JWT secret) and the underlying security vulnerability (client-side secret access). The solution:

1. ✅ Keeps JWT secrets server-side only
2. ✅ Implements proper API route pattern
3. ✅ Provides clear error messages
4. ✅ Follows Next.js best practices
5. ✅ Maintains security best practices

The application now securely verifies JWT tokens without exposing sensitive information to the client-side code.

