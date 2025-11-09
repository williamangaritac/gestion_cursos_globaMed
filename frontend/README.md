# Course Management System - Frontend

Frontend application built with Next.js 14, React 18, Redux Toolkit, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18
- **State Management**: Redux Toolkit 2.0
- **Styling**: Tailwind CSS 3.x
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **TypeScript**: Strict mode enabled

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages (login, register)
│   │   ├── dashboard/         # Protected dashboard pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page (redirects)
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable React components
│   ├── store/                 # Redux store and slices
│   │   ├── slices/           # Redux slices (auth, programs, enrollments)
│   │   ├── index.ts          # Store configuration
│   │   └── provider.tsx      # Redux Provider component
│   ├── services/             # API service layer
│   │   ├── auth.service.ts
│   │   ├── programs.service.ts
│   │   └── enrollments.service.ts
│   ├── lib/                  # Utility libraries
│   │   └── axios.ts          # Axios instance with interceptors
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   └── middleware.ts         # Next.js middleware (auth)
├── public/                   # Static assets
├── Dockerfile               # Multi-stage Docker build
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🛠️ Installation

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env.local
   ```

3. **Update environment variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open browser**: http://localhost:3000

### Docker Development

```bash
docker-compose up frontend
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:e2e` - Run Playwright E2E tests

## 🔐 Authentication Flow

1. User logs in via `/auth/login`
2. Backend returns `accessToken` (15min) and `refreshToken` (7 days)
3. Tokens stored in cookies
4. Axios interceptor adds `Authorization: Bearer <token>` to all requests
5. On 401 error, interceptor automatically refreshes token
6. If refresh fails, user is redirected to login

## 🎨 Features Implemented

### ✅ Authentication
- Login page with form validation
- Register page with form validation
- Automatic token refresh
- Protected routes via middleware
- Logout functionality

### ✅ Dashboard
- Role-based dashboard views
- Statistics cards
- Recent programs list
- Recent enrollments (for students)

### ✅ Programs Management
- List all programs with filters (search, status)
- Pagination
- Create program (Admin/Instructor)
- Edit program (Admin/Instructor)
- Delete program (Admin/Instructor)
- View program details

### 🚧 Pending Features
- Enrollments management page
- User management page (Admin only)
- Program detail page with enrollment
- My enrollments page (Students)
- Profile page
- GraphQL integration
- E2E tests with Playwright
- Unit tests with Jest

## 🔄 State Management

Redux Toolkit slices:
- **authSlice**: User authentication state
- **programsSlice**: Programs CRUD operations
- **enrollmentsSlice**: Enrollments CRUD operations

## 🎯 API Integration

All API calls go through service layer:
- `auth.service.ts` - Authentication endpoints
- `programs.service.ts` - Programs CRUD
- `enrollments.service.ts` - Enrollments CRUD

Axios instance (`lib/axios.ts`) handles:
- Base URL configuration
- Request/response interceptors
- Automatic token injection
- Token refresh on 401 errors

## 🧪 Testing

### Unit Tests (Jest + React Testing Library)
```bash
npm test
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Production
```bash
docker build -t course-management-frontend .
docker run -p 3000:3000 course-management-frontend
```

## 📦 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001/api` |
| `NEXT_PUBLIC_GRAPHQL_URL` | GraphQL endpoint | `http://localhost:3001/graphql` |
| `NODE_ENV` | Environment | `development` |

## 🔗 Related Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Hook Form Documentation](https://react-hook-form.com/)

