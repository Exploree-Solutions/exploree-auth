# Exploree Auth API Documentation

Base URL: `https://your-domain.com/api`

---

## Authentication

All protected endpoints require a JWT token passed via:
- **Header**: `Authorization: Bearer <token>`
- **Cookie**: `auth-token=<token>`

Admin endpoints require `SYSTEM_ADMIN` role.

### Service-to-Service Authentication

For microservice communication, use the `X-Exploree-Service-Key` header:

**Header:** `X-Exploree-Service-Key: <your-service-key>`

**Environment Variable:** `NEXT_PUBLIC_SERVICE_KEY`

```bash
# .env
NEXT_PUBLIC_SERVICE_KEY=67uytrt54dfr34we32456ygtrfdsfghjy
```

---

## Auth Endpoints

### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "clxyz...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  },
  "token": "eyJhbG..."
}
```

**Errors:**
| Status | Error |
|--------|-------|
| 400 | Missing required fields |
| 400 | User already exists |
| 500 | Internal server error |

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
    "id": "clxyz...",
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
| Status | Error |
|--------|-------|
| 400 | Missing required fields |
| 401 | Invalid email or password |
| 403 | Account suspended/inactive |
| 500 | Internal server error |

---

### DELETE `/api/auth/login`
Logout (clears auth cookie).

**Response (200):**
```json
{ "success": true }
```

---

### GET `/api/auth/me`
Get current authenticated user. 🔒 **Requires Auth**

**Response (200):**
```json
{
  "authenticated": true,
  "user": {
    "id": "clxyz...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

**Errors:**
| Status | Response |
|--------|----------|
| 401 | `{ "authenticated": false }` |

---

### GET `/api/auth/verify`
Verify a token (for external services). Supports service-to-service auth.

**Query Params:**
- `token` (required): JWT token to verify

**Headers (Service-to-Service):**
- `X-Exploree-Service-Key`: Shared service key

**Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": "clxyz...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

---

### POST `/api/auth/verify`
Same as GET, but accepts token in request body.

**Request Body:**
```json
{ "token": "eyJhbG..." }
```

---

### GET `/api/auth/profile`
Get full user profile with master profile. 🔒 **Requires Auth**

**Response (200):**
```json
{
  "user": {
    "id": "clxyz...",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER",
    "status": "ACTIVE",
    "lastLoginAt": "2026-01-03T10:00:00Z",
    "createdAt": "2026-01-01T00:00:00Z",
    "masterProfile": {
      "id": "clxyz...",
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
Update user profile. 🔒 **Requires Auth**

**Request Body:**
```json
{
  "fullName": "John Smith",
  "phoneNumber": "+1234567890",
  "company": "New Company",
  "password": "newSecurePassword"
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

## Admin Endpoints 🔒 **Requires SYSTEM_ADMIN**

### GET `/api/admin/users`
List users with search, filter, and pagination.

**Query Params:**
| Param | Default | Description |
|-------|---------|-------------|
| `search` | - | Search by name or email |
| `role` | - | Filter by `USER` or `SYSTEM_ADMIN` |
| `status` | - | Filter by `ACTIVE`, `INACTIVE`, `SUSPENDED` |
| `page` | 1 | Page number |
| `limit` | 20 | Items per page |
| `sortBy` | createdAt | Sort field |
| `sortOrder` | desc | `asc` or `desc` |

**Response (200):**
```json
{
  "users": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "stats": {
    "total": 150,
    "active": 140,
    "inactive": 5,
    "suspended": 5,
    "admins": 3,
    "newToday": 2
  }
}
```

---

### POST `/api/admin/users`
Create a new user (admin).

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "tempPassword123",
  "role": "USER",
  "status": "ACTIVE",
  "phoneNumber": "+1234567890",
  "company": "Acme Inc"
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

### GET `/api/admin/users/[id]`
Get single user by ID.

**Response (200):**
```json
{
  "user": {
    "id": "clxyz...",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-02T00:00:00Z",
    "masterProfile": { ... }
  }
}
```

---

### PATCH `/api/admin/users/[id]`
Update a user.

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "role": "SYSTEM_ADMIN",
  "password": "newPassword",
  "fullName": "John Smith",
  "phoneNumber": "+1234567890",
  "company": "New Company"
}
```

---

### DELETE `/api/admin/users/[id]`
Delete a user. Cannot delete yourself.

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### GET `/api/admin/stats`
Get dashboard statistics.

**Response (200):**
```json
{
  "users": {
    "total": 150,
    "active": 140,
    "inactive": 5,
    "suspended": 5,
    "admins": 3,
    "regularUsers": 147
  },
  "growth": {
    "today": 2,
    "thisWeek": 15,
    "thisMonth": 45
  },
  "activity": {
    "loginsToday": 50,
    "loginsThisWeek": 300,
    "recentActivities": [...]
  },
  "alerts": {
    "usersNeedingPasswordReset": 5
  }
}
```

---

### GET `/api/admin/activity-logs`
Get activity logs.

**Query Params:**
| Param | Default | Description |
|-------|---------|-------------|
| `userId` | - | Filter by user ID |
| `type` | - | `LOGIN`, `LOGOUT`, `REGISTER`, `PASSWORD_CHANGE`, `PROFILE_UPDATE`, `ADMIN_ACTION` |
| `page` | 1 | Page number |
| `limit` | 50 | Items per page |

**Response (200):**
```json
{
  "logs": [
    {
      "id": "clxyz...",
      "userId": "clxyz...",
      "type": "LOGIN",
      "description": "User logged in",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-01-03T10:00:00Z",
      "user": {
        "name": "John Doe",
        "email": "john@example.com",
        "role": "USER"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000,
    "totalPages": 20
  }
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
  "userId": "clxyz..."  // optional
}
```

**Valid Services:** `jobs`, `tender`, `events`, `opportunities`

**Response (200):**
```json
{
  "message": "Successfully added to waitlist",
  "id": "clxyz..."
}
```

**If already exists:**
```json
{
  "message": "Already on waitlist",
  "alreadyExists": true
}
```

---

### GET `/api/waitlist`
Get waitlist count for a service.

**Query Params:**
- `service` (required): Service name

**Response (200):**
```json
{
  "service": "jobs",
  "count": 150
}
```

---

## Data Types

### Role
- `USER` - Regular user
- `SYSTEM_ADMIN` - Administrator

### UserStatus
- `ACTIVE` - Normal active account
- `INACTIVE` - Deactivated account
- `SUSPENDED` - Suspended by admin

### ActivityType
- `LOGIN` - User login
- `LOGOUT` - User logout
- `REGISTER` - New registration
- `PASSWORD_CHANGE` - Password updated
- `PROFILE_UPDATE` - Profile updated
- `ADMIN_ACTION` - Admin performed action
