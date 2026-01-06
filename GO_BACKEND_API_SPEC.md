# Go Backend API Specification

This document describes all API endpoints that the Go backend must implement to support the Exploree Auth frontend application.

---

## Base Configuration

- **Base URL**: Configure via `NEXT_PUBLIC_API_URL` environment variable
- **Content-Type**: `application/json` for all request/response bodies
- **Authentication**: JWT tokens using HS256 algorithm

---

## CORS Requirements

The Go backend must enable CORS with the following headers:

```go
Access-Control-Allow-Origin: * (or specific frontend domains)
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Exploree-Service-Key
Access-Control-Max-Age: 86400
```

---

## Authentication Endpoints

### POST `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phoneNumber": "+1234567890"  // optional
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "unique-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  },
  "token": "eyJhbG..."
}
```

**Errors:**
| Status | Response |
|--------|----------|
| 400 | `{ "error": "Missing required fields" }` |
| 400 | `{ "error": "User already exists" }` |
| 500 | `{ "error": "Internal server error" }` |

---

### POST `/api/auth/login`

Authenticate a user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "unique-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "status": "ACTIVE",
    "forcePasswordReset": false
  },
  "token": "eyJhbG..."
}
```

**Errors:**
| Status | Response |
|--------|----------|
| 400 | `{ "error": "Missing required fields" }` |
| 401 | `{ "error": "Invalid email or password" }` |
| 403 | `{ "error": "Account suspended" }` |

---

### DELETE `/api/auth/login`

Logout (optional server-side session cleanup).

**Response (200):**
```json
{ "success": true }
```

---

### GET `/api/auth/me`

Get current authenticated user.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response (200):**
```json
{
  "authenticated": true,
  "user": {
    "id": "unique-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

**Response (401):**
```json
{ "authenticated": false }
```

---

### GET `/api/auth/verify`

Verify a token (for external services).

**Query Parameters:**
- `token` (required): JWT token to verify

**Headers (Optional - Service-to-Service):**
- `X-Exploree-Service-Key`: Shared service key

**Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": "unique-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

---

### GET `/api/auth/profile`

Get full user profile with master profile.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response (200):**
```json
{
  "user": {
    "id": "unique-id",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER",
    "status": "ACTIVE",
    "lastLoginAt": "2026-01-03T10:00:00Z",
    "createdAt": "2026-01-01T00:00:00Z",
    "masterProfile": {
      "id": "profile-id",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "company": "Acme Inc"
    }
  }
}
```

---

### PATCH `/api/auth/profile`

Update user profile.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "fullName": "John Smith",
  "phoneNumber": "+1234567890",
  "company": "New Company",
  "password": "newSecurePassword"  // optional
}
```

**Response (200):**
```json
{
  "success": true,
  "user": { ... }
}
```

---

## Waitlist Endpoints

### POST `/api/waitlist`

Add email to service waitlist.

**Request Body:**
```json
{
  "email": "john@example.com",
  "name": "John Doe",
  "service": "jobs",
  "userId": "user-id"  // optional
}
```

**Valid Services:** `jobs`, `tender`, `events`, `opportunities`

**Response (200):**
```json
{
  "message": "Successfully added to waitlist",
  "id": "entry-id"
}
```

**Response (200 - Already Exists):**
```json
{
  "message": "Already on waitlist",
  "alreadyExists": true
}
```

---

### GET `/api/waitlist`

Get waitlist count for a service.

**Query Parameters:**
- `service` (required): Service name

**Response (200):**
```json
{
  "service": "jobs",
  "count": 150
}
```

---

## Admin Endpoints (Optional)

These endpoints are required if you want to build an admin interface that communicates with the Go backend directly.

### GET `/api/admin/users`
### POST `/api/admin/users`
### GET `/api/admin/users/:id`
### PATCH `/api/admin/users/:id`
### DELETE `/api/admin/users/:id`
### GET `/api/admin/stats`
### GET `/api/admin/activity-logs`

Refer to the original `API_DOCS.md` for detailed specifications.

---

## Data Models

### User
```go
type User struct {
    ID                 string    `json:"id"`
    Email              string    `json:"email"`
    PasswordHash       string    `json:"-"` // Never expose
    Name               string    `json:"name"`
    Role               string    `json:"role"` // "USER" or "SYSTEM_ADMIN"
    Status             string    `json:"status"` // "ACTIVE", "INACTIVE", "SUSPENDED"
    LastLoginAt        *time.Time `json:"lastLoginAt,omitempty"`
    ForcePasswordReset bool      `json:"forcePasswordReset"`
    CreatedAt          time.Time `json:"createdAt"`
    UpdatedAt          time.Time `json:"updatedAt"`
}
```

### MasterProfile
```go
type MasterProfile struct {
    ID          string    `json:"id"`
    UserID      string    `json:"userId"`
    FullName    string    `json:"fullName"`
    Email       string    `json:"email"`
    PhoneNumber string    `json:"phoneNumber"`
    Company     string    `json:"company,omitempty"`
    CreatedAt   time.Time `json:"createdAt"`
    UpdatedAt   time.Time `json:"updatedAt"`
}
```

### ServiceWaitlist
```go
type ServiceWaitlist struct {
    ID        string    `json:"id"`
    Email     string    `json:"email"`
    Name      string    `json:"name,omitempty"`
    Service   string    `json:"service"` // jobs, tender, events, opportunities
    UserID    string    `json:"userId,omitempty"`
    CreatedAt time.Time `json:"createdAt"`
}
```

### ActivityLog (Optional)
```go
type ActivityLog struct {
    ID          string    `json:"id"`
    UserID      string    `json:"userId"`
    Type        string    `json:"type"` // LOGIN, LOGOUT, REGISTER, PASSWORD_CHANGE, PROFILE_UPDATE, ADMIN_ACTION
    Description string    `json:"description"`
    IPAddress   string    `json:"ipAddress,omitempty"`
    UserAgent   string    `json:"userAgent,omitempty"`
    Metadata    any       `json:"metadata,omitempty"`
    CreatedAt   time.Time `json:"createdAt"`
}
```

---

## JWT Token Specification

- **Algorithm**: HS256
- **Secret**: Set in environment variable `JWT_SECRET`
- **Expiration**: 24 hours recommended

**Payload:**
```json
{
  "sub": "user-id",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "USER",
  "iat": 1704067200,
  "exp": 1704153600
}
```

---

## Database Schema (PostgreSQL Recommended)

```sql
-- Users table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    last_login_at TIMESTAMP,
    force_password_reset BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Master profiles table
CREATE TABLE master_profiles (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    company VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service waitlist table
CREATE TABLE service_waitlist (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    service VARCHAR(50) NOT NULL,
    user_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email, service)
);

-- Activity logs table (optional)
CREATE TABLE activity_logs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON activity_logs(type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_service_waitlist_service ON service_waitlist(service);
```

---

## Recommended Go Libraries

| Purpose | Library |
|---------|---------|
| HTTP Router | `github.com/gin-gonic/gin` or `github.com/gorilla/mux` |
| JWT | `github.com/golang-jwt/jwt/v5` |
| Password Hashing | `golang.org/x/crypto/bcrypt` |
| PostgreSQL | `github.com/jackc/pgx/v5` |
| UUID Generation | `github.com/google/uuid` |
| Environment Config | `github.com/joho/godotenv` |
