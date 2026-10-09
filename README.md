# 🚀 APITester Studio - Modern API Testing & Automation Platform

A production-ready, high-performance web platform for creating, testing, debugging, automating, and documenting REST & HTTP APIs. Built with **React 18, Tailwind CSS, Node.js, Express, and MongoDB (Mongoose)**.

---

## 📑 Table of Contents
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Two-Factor Authentication (2FA)](#-two-factor-authentication-2fa)
- [Forgot Password & Email OTP](#-forgot-password--email-otp-verification)
- [AI Assistant & API Diagnostics](#-ai-assistant--api-diagnostics)
- [Personal Admin Console](#-personal-admin-console)
- [Pre-seeded & Authorized Accounts](#-pre-seeded--authorized-accounts)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Automated Test Suites](#-automated-test-suites)

---

## 🌟 Key Features

### 1. HTTP Request Engine
- **Full HTTP Method Suite**: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.
- **Query Parameters**: Interactive key-value editor with enable/disable toggles and URL synchronization.
- **Request Headers**: Custom headers with quick presets (`Content-Type`, `Accept`, `Authorization`, `X-API-Key`).
- **Flexible Request Bodies**:
  - **JSON**: Formatted text editor with auto-beautifier and sample generators.
  - **XML**: Syntax highlighting and XML sample generators.
  - **Form-Data**: Multipart key-value submissions.
  - **x-www-form-urlencoded**: URL-encoded form submissions.
  - **Raw**: Plain text bodies.

### 2. Multi-Protocol Authentication
- **Bearer Token**: Automatic injection of `Authorization: Bearer <token>`.
- **Basic Auth**: Auto-generates Base64-encoded `Authorization: Basic <credentials>`.
- **API Key**: Sends custom key-value in either Headers or Query parameters.
- **Environment Interpolation**: Dynamic variable injection across URLs, headers, and bodies (e.g. `{{baseUrl}}`, `{{token}}`).

### 3. Response Inspector & Performance Timing
- **Status Badges & Metrics**: Status code, round-trip latency (ms), and payload transfer size.
- **Visual Network Timing Breakdown**: DNS Lookup, TCP Connect, TTFB (Time to First Byte), and Download time.
- **Response Formatters**: Pretty / Raw views for JSON and XML with one-click clipboard copy.

### 4. Automated Test Assertions & Collection Runner
- **Pre-request & Post-response Assertions**:
  - Status code equality (e.g. `Status === 200`).
  - Latency SLA benchmarks (e.g. `Response time < 500ms`).
  - JSON path property validation (e.g. `data.id exists`).
  - Body text contains substring.
  - Header existence check.
- **Collection Runner**: Sequential execution of request collections with configurable delays and live pass/fail reports.

### 5. Collections & Environments
- **Postman Collection v2.1**: Full import and export compatibility.
- **Environment Profiles**: Multiple scopes (Development, Staging, Production) with dynamic variables:
  - `{{$timestamp}}`, `{{$guid}}`, `{{$randomInt}}`.

### 6. Built-in Tools
- **cURL Importer**: Paste any cURL command to instantly parse method, headers, auth, query params, and body.
- **Mock Server Studio**: Offline mock API server simulating realistic delays, status codes, and XML/JSON responses.
- **Interactive API Documentation Generator**: Instant interactive documentation rendered directly from collections.

---

## 🔐 Two-Factor Authentication (2FA)

APITester Studio implements an RFC 6238-compliant TOTP Two-Factor Authentication system:

1. **Setup Flow**:
   - Navigating to **Profile $\rightarrow$ Security & Password** allows users to enable 2FA.
   - Generates a unique Base32 TOTP secret and returns an interactive QR code provisioning data URL.
   - Compatible with **Google Authenticator**, **Microsoft Authenticator**, and **Authy** (30-second time step, 6-digit codes).
2. **Encryption at Rest**:
   - TOTP secrets are encrypted in MongoDB using **AES-256-GCM** with unique initialization vectors (`iv:tag:ciphertext`). Plaintext secrets are never stored.
3. **Backup Recovery Codes**:
   - Generates 8 single-use emergency backup recovery codes formatted as `XXXX-XXXX`.
   - Stored at rest as irreversible **SHA-256 hashes**.
4. **Login Challenge & Rate Limiting**:
   - Users with 2FA enabled receive a short-lived, signed 2FA ticket upon password verification. Full JWT access tokens are only issued after successful TOTP or recovery code entry.
   - **Replay Defense**: Prevents reusing the same 30-second timestep OTP.
   - **Brute-Force Lockout**: 5 failed verification attempts trigger a 10-minute security lockout.
5. **Identity-Verified Disable Flow**:
   - Disabling 2FA requires verifying either the account password or a live TOTP code.

---

## 📧 Forgot Password & Email OTP Verification

A production-grade 5-step password recovery flow backed by Gmail SMTP:

1. **Request Verification Code**:
   - Dedicated `/forgot-password` page with email validation.
   - Anti-enumeration protection: Returns a generic confirmation message regardless of whether the email is registered.
   - 60-second rate-limiting cooldown per account.
2. **Secure One-Time Password (OTP)**:
   - Generates cryptographically secure 6-digit numeric codes via `crypto.randomInt`.
   - Stored in MongoDB as **SHA-256 hashes** with a strict 10-minute expiry.
   - Dispatched via **Google SMTP** (`smtp.gmail.com:465`).
3. **OTP Verification**:
   - 6-digit input screen with resend cooldown timer.
   - Brute-force protection: Max 5 failed attempts before OTP invalidation.
   - Issues a short-lived, single-use password reset ticket upon success.
4. **Password Reset**:
   - New Password & Confirm Password with live validation and show/hide toggles.
   - Passwords securely hashed with `bcryptjs` (salt rounds: 10).
   - Invalidation of reset ticket prevents re-use attacks.
5. **Redirect to Sign In**:
   - User signs in with their new credentials.

---

## 🤖 AI Assistant & API Diagnostics

An integrated AI Copilot powered by Google Gemini:

- **AI Troubleshooter**: One-click error analysis when an API returns a `4xx` or `5xx` response code.
- **Smart Suggestions**: Recommends fixes for missing headers, invalid JSON syntax, authentication mismatches, or invalid query parameters.
- **Payload & Test Generator**: Generates realistic mock payloads and test assertion suites tailored to the active endpoint.

---

## 🛡️ Personal Admin Console

The Admin Console is strictly isolated and restricted to authorized personal administrator accounts:

- **Authorized Admin Whitelist**:
  - `singunamitha@gmail.com`
  - `s.v.padmavathi2005@gmail.com`
- **Security Barrier**:
  - Direct navigation to `/admin`, `/admin-dashboard`, or `/admin-console` by unauthorized accounts displays a **403 Forbidden** security screen.
  - Admin navigation links in the Navbar and Profile dropdown are visible **only** to authenticated whitelist admins.
- **Admin Capabilities**:
  - Real-time platform metrics (Total Users, Active Sessions, Total Collections, Latency SLAs).
  - User role management (`user` $\leftrightarrow$ `admin`) and account suspension controls.
  - Complete request audit log inspection.

---

## 🔑 Pre-seeded & Authorized Accounts

| Role | Email | Password | Access |
|---|---|---|---|
| **Authorized Admin** | `singunamitha@gmail.com` | `Admin@2026!` (or Google Sign-In) | Admin Console & Full Platform |
| **Authorized Admin** | `s.v.padmavathi2005@gmail.com` | `Admin@2026!` (or Google Sign-In) | Admin Console & Full Platform |
| **Demo User** | `demo@apitester.io` | `user123` | API Studio Workbench |

---

## ⚙️ Environment Variables

### Backend Configuration (`server/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/api_testing_tool

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key

# Administrator Whitelist
ADMIN_EMAILS=singunamitha@gmail.com,s.v.padmavathi2005@gmail.com

# Email Delivery (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_digit_google_app_password
EMAIL_FROM="APITester Studio" <your_email@gmail.com>

# Two-Factor Authentication AES-256 Key (optional, auto-derived if omitted)
TWO_FACTOR_ENCRYPTION_KEY=your-32-byte-hex-encryption-key-optional

# Google Gemini AI Assistant (optional)
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend Configuration (`client/.env`)

```env
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

## 🏃 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Community Server running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Namitha938/API-Testing-Tool.git
   cd API-Testing-Tool
   ```

2. **Install Root, Server, and Client dependencies**:
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   cd ..
   ```

3. **Start the Application**:

   - **Development Mode** (Runs backend on `:5000` & Vite frontend on `:3000` with hot-reload):
     ```bash
     # In Terminal 1 (Backend):
     npm run server

     # In Terminal 2 (Frontend):
     npm run client
     ```

   - **Production Build**:
     ```bash
     npm --prefix client run build
     npm start
     ```
     Access the application in your browser at **`http://localhost:3000`** (dev) or **`http://localhost:5000`** (prod).

---

## 📡 API Endpoints Reference

### Authentication & Security (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Sign in with email & password (returns 2FA ticket if enabled) |
| `POST` | `/api/auth/google` | Sign in / register via Google OAuth |
| `POST` | `/api/auth/2fa/generate` | Generate unique TOTP secret and QR code |
| `POST` | `/api/auth/2fa/enable` | Confirm 6-digit TOTP and activate 2FA (returns recovery codes) |
| `POST` | `/api/auth/2fa/disable` | Disable 2FA with password or TOTP verification |
| `POST` | `/api/auth/2fa/recovery-codes` | Regenerate 8 backup recovery codes |
| `GET` | `/api/auth/2fa/status` | Get 2FA enabled status and remaining recovery codes count |
| `POST` | `/api/auth/2fa/verify-login` | Verify 6-digit TOTP or backup recovery code during login |
| `POST` | `/api/auth/forgot-password` | Request password reset OTP email (60s cooldown) |
| `POST` | `/api/auth/verify-reset-code` | Validate 6-digit OTP and obtain reset ticket |
| `POST` | `/api/auth/reset-password` | Set new password using single-use reset ticket |
| `PUT` | `/api/auth/profile` | Update user name, bio, company, avatar photo |
| `PUT` | `/api/auth/change-password` | Change account password |

### Admin Console (`/api/admin`) *(Restricted to Whitelist)*
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Platform performance and system statistics |
| `GET` | `/api/admin/users` | List all registered users |
| `PUT` | `/api/admin/users/:id/role` | Toggle user role (`user` / `admin`) |
| `PUT` | `/api/admin/users/:id/status` | Suspend or activate account |
| `DELETE`| `/api/admin/users/:id` | Remove user account |
| `GET` | `/api/admin/history` | Platform-wide execution audit logs |

### Proxy & Execution (`/api/proxy`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/proxy` | Execute external HTTP requests bypassing CORS restrictions |

---

## 🧪 Automated Test Suites

The project includes production validation test suites verifying security flows:

```bash
# Run Forgot Password OTP flow tests (11 automated assertions):
node scratch/testForgotPasswordProduction.js

# Run Two-Factor Authentication 2FA tests (12 automated assertions):
node scratch/test2faProduction.js
```

### Verified Test Coverage:
- **Forgot Password**: Generic email response, 60s cooldown enforcement, SHA-256 hash storage at rest, brute-force OTP attempts, single-use reset ticket invalidation, password update verification.
- **2FA TOTP**: AES-256-GCM secret encryption at rest, authenticator code verification, replay prevention, single-use recovery code consumption, 2FA-gated login tokens, identity-verified disable flow.

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
