# Architecture Overview

Components:
- Frontend (Next.js + MUI) — Embeddable widget and demo page.
- Backend (NestJS) — Mongoose models with repository pattern, services, controllers.
- MongoDB — persistent datastore.

Key engineering decisions:
- Repository abstraction (`AbstractRepository<T>`) to allow swapping DB implementations for tests or other DBs.
- Services contain business logic (availability selection, scheduling).
- Unit tests mock repositories for fast feedback.
- E2E tests (using Supertest) can be added to validate end-to-end flows against a real MongoDB instance.
- Docker + docker-compose provided for reproducible dev environment.

Scaling & production:
- Replace file-based or single-node Mongo with managed MongoDB or replica set.
- Add Redis for distributed locks / rate limiting for booking concurrency.
- Add authentication and role-based access for admin endpoints.
