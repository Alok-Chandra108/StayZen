# StayZen Production Deployment Guide (Vercel)

Now that the codebase is hardened for production, here is a checklist to ensure your deployment on Vercel is successful.

## 1. Environment Variables
You must configure these in your **Vercel Project Settings > Environment Variables**:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables secure cookies and strict email logic. |
| `MONGO_URI` | `mongodb+srv://...` | Your MongoDB connection string. |
| `SECRET_VAL` | `long-random-string` | A strong secret for sessions. |
| `CLOUD_NAME` | `...` | Cloudinary name. |
| `CLOUD_API_KEY` | `...` | Cloudinary API Key. |
| `CLOUD_API_SECRET` | `...` | Cloudinary API Secret. |
| `EMAIL_USER` | `you@gmail.com` | Your Gmail address. |
| `EMAIL_PASS` | `xxxx xxxx xxxx xxxx` | **Google App Password** (Not your account password). |
| `GOOGLE_CLIENT_ID` | `533569...` | Google OAuth Client ID. |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | Google OAuth Client Secret. |

## 2. Hardening Check
- [x] **Secure Cookies**: The app will now only send cookies over HTTPS in production.
- [x] **Brute-Force Protection**: Login, Signup, and OTP routes are limited to 100 requests per 15 minutes per IP.
- [x] **Email Enforcement**: In production, the "terminal fallback" is disabled. The app will strictly require valid Gmail credentials to register new users.
- [x] **Trust Proxy**: Configured for Vercel's architecture to ensure session cookies persist across requests.

## 3. Important Notes
> [!WARNING]
> **Gmail App Password**: Standard Gmail passwords will NOT work. You must enable 2FA on your Google account and generate an "App Password" specifically for "Mail" on your "Windows/Mac Computer".

> [!NOTE]
> **Vercel Logs**: Since we are using standard `console.log`, you can view all traffic, errors, and OTP attempts (in dev mode) directly in the **Logs** tab of your Vercel deployment dashboard.

## 4. Deployment Command
You can deploy using the Vercel CLI:
```bash
vercel --prod
```
Or simply push your changes to your GitHub repository if it's connected to Vercel.
