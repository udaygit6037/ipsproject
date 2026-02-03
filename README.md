
# Digital Psychological Intervention (DPI)

A full-stack mental health support platform for colleges that combines clinical workflows, student-facing digital therapeutics, community resources, and role-based administration.

## ✨ What’s Included

- Modern landing page aligned with the in-app visual system (Tailwind + Lucide icons)
- Role-based authentication (student, counsellor, admin) backed by JWT-secured Express APIs
- Dashboards for each persona with bookings, resources, and forum integrations
- Cloudinary-powered resource uploads and MongoDB persistence

## 🧱 Tech Stack

| Layer     | Stack                                                                 |
|-----------|-----------------------------------------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, React Router, Axios, Lucide icons       |
| Backend   | Node.js 20, Express, MongoDB/Mongoose, JWT, Multer, Cloudinary        |
| Security  | Helmet.js, Express Rate Limit, Express Validator, Refresh Tokens       |
| Tooling   | ESLint, PostCSS, Tailwind CLI, Jest, Docker                           |

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd test
```

Install dependencies for each workspace:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Variables

Use the provided templates to bootstrap configuration:

- `backend/env.example` → copy to `backend/.env` and fill MongoDB, JWT, and Cloudinary secrets.
- `frontend/env.example` → copy to `frontend/.env` and point `VITE_API_BASE_URL` at your backend (defaults to `http://localhost:5000/api`).

### 3. Run the Backend

```bash
cd backend
npm run dev
```

The API boots on `http://localhost:5000` with routes such as:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/bookings/my-bookings`
- `GET /api/resources`

Seed data (optional):

```bash
npm run seed
```

### 4. Run the Frontend

```bash
cd frontend
npm run dev
```

Open the Vite URL (default `http://localhost:5173`). The public landing page now lives at `/`, with login/signup flows under `/login` and `/signup`.

### 5. Demo Credentials

Use the built-in shortcut buttons on the login page or manually enter:

| Role        | Email                              | Password       |
|-------------|------------------------------------|----------------|
| Student     | john.student@university.edu        | student123     |
| Counsellor  | sarah.wilson@university.edu        | counsellor123  |
| Admin       | admin@university.edu               | admin123       |

## 🧩 Project Structure

```
backend/   Express API, routes, controllers, Mongo models
frontend/  Vite + React SPA with Tailwind styling
```

Key frontend routes:

- `/` — marketing landing page
- `/login`, `/signup` — public auth routes (auto-redirect authenticated users)
- `/student-dashboard`, `/counsellor-dashboard`, `/admin-dashboard` — role-specific areas
- `/resources`, `/forum`, `/booking` — shared authenticated experiences

## ✅ Integration Checklist

- `frontend/src/utils/api.js` centralizes the Axios client with token interceptors tied to `sessionStorage`.
- Auth context persists JWT/user payloads so both the landing page and protected dashboards remain in sync.
- Backend routes are mounted under `/api/*` and protected with `authenticate` middleware where required.
- Cloudinary configuration lives in `backend/config/cloudinary.js`; adjust folders or limits as needed.

## 🔒 Security Features

- **Helmet.js** - Security headers protection
- **Rate Limiting** - Protection against brute-force and DDoS attacks
- **Input Validation** - Express Validator for request sanitization
- **Refresh Tokens** - Secure token rotation mechanism
- **CORS Configuration** - Restricted origin access
- **NoSQL Injection Protection** - Input sanitization middleware
- **Password Policy** - Strong password requirements (8+ chars, uppercase, lowercase, number)

## 🚀 Deployment Options

### Docker Compose (Recommended)

```bash
docker-compose up -d
```

### Manual Deployment

See `IMPLEMENTATION_GUIDE.md` for detailed setup instructions.

## 📊 Code Quality

- **Testing**: Jest test suite with coverage reporting
- **Linting**: ESLint configuration
- **CI/CD**: GitHub Actions workflow
- **Error Handling**: Centralized error handling middleware
- **Logging**: Structured logging utility

## 📚 Documentation

- `CODE_REVIEW.md` - Comprehensive code review and recommendations
- `IMPLEMENTATION_GUIDE.md` - Step-by-step implementation guide
- `backend/ENV_SETUP_GUIDE.md` - Environment configuration guide

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend build test
cd frontend
npm run build
```

## 📄 License

MIT © Digital Psychological Intervention Team

