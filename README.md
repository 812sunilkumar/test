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

## Tests
Backend tests:
```bash
cd backend
npm ci
npm test
```

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
