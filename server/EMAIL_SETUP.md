# Email Configuration Guide

## Gmail SMTP Setup

### Option 1: Using App Passwords (Recommended)
1. Enable 2-Step Verification on your Google account
2. Generate an App Password:
   - Go to https://myaccount.google.com/security
   - Under "Signing in to Google" → "App passwords"
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. Update your `.env` file:
```
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

### Option 2: Allow Less Secure Apps (Not Recommended)
1. Go to https://myaccount.google.com/security
2. Enable "Less secure app access"
3. Use your regular Gmail password in `.env`

### Option 3: Using Gmail OAuth2 (Advanced)
For production applications, consider using OAuth2 authentication.

## Testing Without Email Configuration

If you don't want to configure email, the application will:
1. Return the reset token in the API response
2. Display the reset link directly in the response
3. Allow you to test the reset flow manually

## Environment Variables

Update your `.env` file with:
```
JWT_SECRET=your_secure_jwt_secret
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_password_or_regular_password
```

## Testing the Reset Flow

1. **Forgot Password**: POST to `/api/auth/forgot-password` with email
2. **Reset Password**: POST to `/api/auth/reset-password` with token and new password

## Common Issues

1. **"Username and Password not accepted"**
   - Use App Password instead of regular password
   - Ensure 2-Step Verification is enabled for App Passwords

2. **"Less secure app access"**
   - Enable it in Google account settings
   - Or use App Password method

3. **Token expired**
   - Tokens expire after 1 hour
   - Request a new reset email if expired

## Security Notes

- Never commit real credentials to version control
- Use environment variables for sensitive data
- Consider rate limiting for password reset requests
- Monitor email sending limits (Gmail: 500 emails/day for personal accounts)
