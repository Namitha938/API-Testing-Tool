# 🚀 APITester Pro - Modern Web-based API Testing Tool

A full-featured, high-performance web application for creating, testing, debugging, and automating REST & HTTP APIs, built with **Node.js, Express, MongoDB (Mongoose), and React (Tailwind CSS)**.

---

## 🌟 Key Features

1. **User Registration & Secure Authentication**
   - JWT-based authentication with bcrypt password hashing
   - Role-based authorization: **Administrator** and **Developer/User**
   - One-click evaluation login presets for rapid testing

2. **Full HTTP Method Suite**
   - Supports **GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS**
   - Color-coded HTTP method badges and status indicators

3. **URL & Query Parameters**
   - Key-Value parameter table with checkboxes to toggle parameters on/off
   - Auto-encoding and dynamic query string construction

4. **Custom Request Headers**
   - Custom header table with enable/disable toggles
   - One-click shortcuts for common headers (`Content-Type: application/json`, `Accept`, `X-API-Key`)

5. **Flexible Request Bodies**
   - **JSON**: Formatted text editor with auto-beautifier and sample generators
   - **XML**: XML payloads with syntax support and XML sample generators
   - **Form-Data**: Multipart key-value pairs
   - **x-www-form-urlencoded**: URL-encoded form submissions
   - **Raw Text**: Arbitrary raw string bodies

6. **Authentication Engine**
   - **Bearer Token**: Injects `Authorization: Bearer <token>`
   - **Basic Auth**: Auto-generates Base64 encoded `Authorization: Basic <credentials>`
   - **API Key**: Sends custom key-value in either Headers or Query parameters
   - Environment variable interpolation support (e.g. `{{token}}` or `{{apiKey}}`)

7. **Response Inspector & Formatters**
   - Visual status badges (`200 OK`, `201 Created`, `404 Not Found`, `500 Error`)
   - Latency timer and transfer size calculator
   - **Pretty / Raw** formatting toggle with formatted JSON & XML indentation
   - One-click response body copy to clipboard
   - Response Headers viewer

8. **Performance Monitoring & Timing Breakdown**
   - Real-time round-trip latency measurement (ms)
   - Visual network breakdown: **DNS Lookup**, **TCP Connect**, **TTFB (Time to First Byte)**, and **Download Time**
   - Response byte size measurement

9. **Automated Test Assertions Engine**
   - Assertion types:
     - **Status code equals** (e.g. 200, 201, 204)
     - **Response time is under** (e.g. `< 500ms`)
     - **JSON property exists / path lookup** (e.g. `data.id` or `success`)
     - **Response body contains text**
     - **Response header exists**
   - Real-time execution with pass/fail badges, expected vs actual diagnostics

10. **Automated Collection Runner**
    - Execute an entire collection or test suite in sequence
    - Configurable inter-request delay
    - Live progress tracking with passed/failed counts, average latency, and suite summary

11. **API Collections & Folders**
    - Create, edit, rename, duplicate, and delete API requests
    - Organize requests into folders and sub-groups
    - Pre-seeded with a comprehensive **Mock API Showcase** collection

12. **Environment & Variable Management**
    - Create multiple environment profiles (e.g. Local Dev, Staging, Production)
    - Global variables and environment-scoped variables
    - Syntax: `{{variableName}}` inside URLs, headers, and request bodies
    - Built-in dynamic variables: `{{$timestamp}}`, `{{$guid}}`, `{{$randomInt}}`

13. **Export & Import Collections**
    - **Postman Collection v2.1** compatible export and import
    - **Native JSON** collection export and import

14. **Admin Dashboard & User Management**
    - Live system metrics: Total Users, Active Users, Collections, Executions, Average Latency, and Test Pass Rate
    - User management table: change user roles (User ↔ Admin), suspend or activate accounts, and remove users

15. **Built-in Mock API Server**
    - Immediate offline testing without relying on 3rd-party internet services:
      - `GET /api/mock/users` (List with pagination and search)
      - `POST /api/mock/users` (Create user)
      - `GET/PUT/PATCH/DELETE /api/mock/users/:id`
      - `GET /api/mock/xml` (XML response)
      - `GET /api/mock/delayed?ms=500` (Latency test)
      - `GET /api/mock/auth-protected` (Bearer token testing)
      - `GET /api/mock/status/:code` (Simulate HTTP 400, 401, 404, 500, etc.)

---

## 🗄️ Database: MongoDB

The application uses **MongoDB** with Mongoose:
- **Database URI**: `mongodb://127.0.0.1:27017/api_testing_tool` (configurable via `MONGODB_URI` environment variable)
- **Collections**:
  - `users`: User credentials, roles, and session metadata
  - `collections`: API collections and nested folders
  - `savedrequests`: Saved HTTP request configurations, headers, auth, and test cases
  - `environments`: Variables and environment profiles
  - `requesthistories`: Full audit log of executed requests, network timings, and test results

---

## 🔑 Default Seeded Accounts

The database is pre-seeded with two ready-to-use accounts:
| Role | Email | Password |
|---|---|---|
| **System Admin** | `admin@apitester.io` | `admin123` |
| **Demo User** | `demo@apitester.io` | `user123` |

*(You can also use the 1-click quick login buttons in the Sign In modal.)*

---

## 🏃 Running the Application

### 1. Start Server & Serve App (Production mode)
```bash
npm start
```
Open **`http://localhost:5000`** in your browser.

### 2. Development Mode
- **Backend**:
  ```bash
  npm run server
  ```
- **Frontend** (in a separate terminal):
  ```bash
  npm run client
  ```
  Vite dev server runs at **`http://localhost:3000`** with proxy to backend.

