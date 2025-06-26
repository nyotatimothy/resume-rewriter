# Authentication Setup Guide

## Overview
The authentication system uses magic links (passwordless authentication) with JWT tokens and secure HTTP-only cookies.

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/resumerewriter"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key-here"
EMAIL_FROM="noreply@yourdomain.com"

# Frontend
FRONTEND_URL="http://localhost:3000"
MAGIC_LINK_EXPIRY_MINUTES="15"

# OpenAI
OPENAI_API_KEY="your-openai-api-key-here"

# Stripe (optional - for future payment integration)
STRIPE_SECRET_KEY="your-stripe-secret-key-here"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret-here"
```

## Setup Steps

### 1. Database Setup
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) View database in Prisma Studio
npx prisma studio
```

### 2. Email Service (Resend)
1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add it to `RESEND_API_KEY` in your `.env.local`
4. Update `EMAIL_FROM` with your verified domain

### 3. JWT Secret
Generate a secure JWT secret:
```bash
# Generate a random string
openssl rand -base64 32
```

### 4. Test the Authentication

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the sign-in flow:**
   - Go to `http://localhost:3000/login`
   - Enter your email
   - Check your email for the magic link
   - Click the link to sign in

## How It Works

### 1. Magic Link Request (`/api/auth/request-magic-link`)
- User enters email
- System validates email format
- Rate limiting applied (5 requests per minute per IP)
- JWT token generated with 15-minute expiry
- Magic link sent via email using Resend

### 2. Token Verification (`/api/auth/verify`)
- User clicks magic link
- JWT token verified
- User created/updated in database
- Secure HTTP-only cookie set
- User redirected to homepage

### 3. Session Management (`/api/auth/me`)
- Checks for valid auth cookie
- Returns current user data
- Used by AuthProvider to maintain session

### 4. Logout (`/api/auth/logout`)
- Clears auth cookie
- Resets user state

## Security Features

- **Rate Limiting**: 5 magic link requests per minute per IP
- **JWT Expiry**: 15-minute tokens for magic links
- **HTTP-Only Cookies**: Secure session management
- **Email Validation**: Proper email format validation
- **CSRF Protection**: SameSite cookie attributes

## Troubleshooting

### Common Issues:

1. **"JWT_SECRET not configured"**
   - Make sure `JWT_SECRET` is set in your `.env.local`

2. **"Failed to send magic link"**
   - Check your Resend API key
   - Verify your email domain is configured in Resend
   - Check the Resend dashboard for delivery status

3. **"Database connection failed"**
   - Verify your `DATABASE_URL`
   - Make sure your database is running
   - Run `npx prisma db push` to create tables

4. **"Invalid or expired token"**
   - Magic links expire after 15 minutes
   - Request a new magic link

### Testing:

```bash
# Test database connection
npx prisma db push

# Test email sending (check Resend dashboard)
# Send a magic link and check delivery

# Test authentication flow
# Complete the sign-in process and verify session persistence
```

## Production Deployment

1. **Update environment variables** for production
2. **Set up a production database** (e.g., Supabase, Railway)
3. **Configure Resend** with your production domain
4. **Update `FRONTEND_URL`** to your production domain
5. **Set `NODE_ENV=production`** for secure cookies

## API Endpoints

- `POST /api/auth/request-magic-link` - Request magic link
- `GET /api/auth/verify?token=<token>` - Verify magic link
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

## Components

- `AuthProvider` - React context for user state
- `useAuth` - Hook for accessing auth context
- `LoginPage` - Magic link sign-in page
- `Navigation` - Shows user status and logout button 