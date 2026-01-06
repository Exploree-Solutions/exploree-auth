# Exploree Auth Frontend

Modern authentication frontend for Exploree services. This is a **frontend-only** Next.js application that communicates with a separate Go backend API.

## Tech Stack

- **Next.js 16** with App Router
- **React 19**
- **Tailwind CSS 4**
- **i18next** for internationalization (English, Amharic, Oromifa, Tigrigna)

## Features

- 🔐 User login and registration
- 🌍 Multi-language support
- 📋 Service selection (Jobs, Tender, Events, Opportunities)
- 📬 Coming Soon waitlist for unreleased services
- 🔄 Token-based authentication
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 20+
- A running Go backend (see [GO_BACKEND_API_SPEC.md](./GO_BACKEND_API_SPEC.md))

### Environment Variables

Create a `.env.local` file:

```env
# Go Backend API URL (required)
NEXT_PUBLIC_API_URL=http://localhost:8080

# Service URLs for redirection (optional)
NEXT_PUBLIC_JOBS_URL=
NEXT_PUBLIC_TENDER_URL=
NEXT_PUBLIC_EVENTS_URL=
NEXT_PUBLIC_OPPORTUNITIES_URL=
```

### Installation

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── signup/            # Registration page
│   └── select-service/    # Service selection page
├── components/            # Reusable UI components
├── lib/
│   ├── api.ts            # Centralized API client for Go backend
│   └── tokenStorage.ts   # Client-side token management
└── locales/              # Translation files
```

## Backend Integration

This frontend expects a Go backend implementing the endpoints specified in [GO_BACKEND_API_SPEC.md](./GO_BACKEND_API_SPEC.md).

### Required Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/auth/login` | DELETE | Logout |
| `/api/auth/me` | GET | Get current user |
| `/api/waitlist` | POST | Join waitlist |

## Deployment

This app can be deployed as a static site or with SSR on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Any Node.js hosting**

### Netlify Configuration

```toml
[build]
  command = "npm run build"
  publish = ".next"
```

## License

Proprietary - Exploree Solutions © 2026
