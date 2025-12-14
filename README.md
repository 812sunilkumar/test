# Nevo Test Drive - Monorepo (backend + frontend)

This repository contains:
- `backend/` - NestJS backend using Mongoose (MongoDB). Implements OOP-friendly abstractions (interfaces & abstract repository), services, controllers, unit tests.
- `frontend/` - Next.js frontend using Material UI with an embeddable test-drive widget.
- GitHub Actions workflow for running backend tests and building frontend.

## How to run locally

### Prerequisites
- Node.js >= 18
- npm
- MongoDB running locally (or set MONGO_URI env variable)

### Backend
```bash
cd backend
npm install
export MONGO_URI="mongodb://localhost:27017/nevo_test_drive"
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# open http://localhost:3000
```

## Testing

### Backend Tests

The backend uses Jest for unit and end-to-end (E2E) testing.

#### Prerequisites
- MongoDB running locally (or set `MONGO_URI` environment variable)
- Backend dependencies installed

#### Run All Tests
```bash
cd backend
npm install
npm test
```

#### Run Unit Tests Only
```bash
cd backend
npm run test:unit
```

#### Run E2E Tests Only
```bash
cd backend
npm run test:e2e
```

#### Run Tests in Watch Mode
```bash
cd backend
npm run test:watch
```

#### Run Tests with Coverage Report
```bash
cd backend
npm run test:cov
```

#### Run Tests in Debug Mode
```bash
cd backend
npm run test:debug
```

**Backend Test Structure:**
- Unit tests: `backend/src/**/*.spec.ts`
- E2E tests: `backend/test/e2e/**/*.e2e-spec.ts`

### Frontend Tests

The frontend uses Playwright for end-to-end (E2E) testing.

#### Prerequisites
- Node.js >= 18
- Frontend dependencies installed
- Backend API running (default: `http://localhost:5000`)

#### First-Time Setup
```bash
cd frontend
npm install
npx playwright install
```

#### Run All E2E Tests
```bash
cd frontend
npm run test:e2e
```

This will:
- Automatically start the Next.js dev server on port 3000
- Run all tests in Chromium, Firefox, and WebKit
- Generate an HTML report

#### Run Tests with Interactive UI (Recommended for Development)
```bash
cd frontend
npm run test:e2e:ui
```

#### Run Tests in Debug Mode
```bash
cd frontend
npm run test:e2e:debug
```

#### Run Tests in Headed Mode (See Browser)
```bash
cd frontend
npm run test:e2e:headed
```

#### Run Specific Test File
```bash
cd frontend
# Run only home page tests
npx playwright test e2e/home.spec.ts

# Run only booking flow tests
npx playwright test e2e/booking-flow.spec.ts
```

#### View Test Report
```bash
cd frontend
npx playwright show-report
```

**Frontend Test Structure:**
- E2E tests: `frontend/e2e/**/*.spec.ts`

### Running All Tests

To run both backend and frontend tests:

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Backend Tests:**
```bash
cd backend
npm run test:unit
npm run test:e2e
```

**Terminal 3 - Frontend Tests:**
```bash
cd frontend
npm run test:e2e
```

**Note:** Frontend tests automatically start the dev server, but you need to ensure the backend is running first.

## CI
A GitHub Actions workflow is included at `.github/workflows/ci.yml`. It starts a MongoDB docker container in the CI runner for tests.

## Notes & next steps
- Repositories implement an `AbstractRepository<T>` to allow swapping persistence.
- Add more unit tests and e2e tests as needed.
- For production, secure MongoDB credentials and add proper logging & monitoring.

## Docker / Compose

To run everything locally (Mongo + backend + frontend):

```
# from repo root
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up --build
```

Seed data: place your `vehicles.json` and `reservations.json` files into `backend/data/` and run:

```
# requires ts-node or compile the script
cd backend
npm install
node -e "require('./dist/scripts/seed.js')" || node ./scripts/seed.ts
```
