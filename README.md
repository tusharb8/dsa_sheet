# DSA Learning Tool

A Data Structures and Algorithms (DSA) learning platform for tracking and improving problem-solving skills. Users solve coding problems, track their progress, and access learning resources organized by topics — with an AI chatbot assistant that answers questions using DSA Sheet data.

## Project Structure

```
├── client/   # React frontend (Vite + TypeScript)
├── server/   # NestJS API (TypeORM + PostgreSQL)
├── HLD.md    # High-Level Design
└── LLD.md    # Low-Level Design
```

## Packages

### Server (`server/package.json`)

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/common` | ^11.0.1 | Core NestJS decorators, guards, pipes, interceptors |
| `@nestjs/core` | ^11.0.1 | NestJS application bootstrap and DI container |
| `@nestjs/platform-express` | ^11.0.1 | Express HTTP adapter for NestJS |
| `@nestjs/swagger` | ^11.4.2 | OpenAPI/Swagger documentation generation |
| `@nestjs/typeorm` | ^11.0.1 | TypeORM integration for NestJS |
| `@nestjs/jwt` | ^11.0.2 | JWT signing/verification for authentication |
| `@nestjs/passport` | ^11.0.5 | Passport strategies integration for auth guards |
| `@nestjs/throttler` | ^6.5.0 | Rate limiting to protect API endpoints |
| `typeorm` | ^0.3.29 | ORM and entity mappings for PostgreSQL |
| `pg` | ^8.20.0 | PostgreSQL driver |
| `passport` / `passport-jwt` | ^0.7.0 / ^4.0.1 | JWT authentication strategy |
| `bcrypt` | ^6.0.0 | Password hashing |
| `class-validator` | ^0.14.4 | DTO validation decorators |
| `class-transformer` | ^0.5.1 | DTO serialization/transformation |
| `nodemailer` | ^8.0.7 | Email sending (account creation, password changes) |
| `multer` | ^2.1.1 | File upload handling (Excel imports) |
| `xlsx` | ^0.18.5 | Excel file parsing for topic/problem uploads |
| `uuid` | ^14.0.1 | Unique identifier generation |
| `swagger-ui-express` | ^5.0.1 | Swagger UI web interface |
| `reflect-metadata` | ^0.2.2 | TypeScript decorators runtime support |
| `rxjs` | ^7.8.1 | Reactive streams used by NestJS |
| `@langchain/core` | ^1.2.4 | LangChain tool definitions and message types |
| `@langchain/ollama` | ^1.3.0 | Ollama LLM integration for the chatbot |
| `@langchain/community` | ^1.1.29 | Community models/callbacks used with the chat loop |
| `@qdrant/js-client-rest` | ^1.x | Qdrant REST client for semantic search |
| `dotenv` | ^16.x | Loads `server/.env` variables at startup |
| `ts-node` | ^10.9.2 | TypeScript execution for `start:dev` |

Dev dependencies: `@types/bcrypt`, `@types/multer`, `@types/node`, `@types/passport-jwt`, `tsx`, `typescript`.

### Client (`client/package.json`)

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.2.5 | UI component library |
| `react-dom` | ^19.2.5 | React DOM renderer |
| `react-redux` | ^9.2.0 | React bindings for Redux store |
| `@reduxjs/toolkit` | ^2.11.2 | Redux state management (slices, store, thunks) |
| `react-router-dom` | ^7.15.0 | Client-side routing |

Dev dependencies:

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^8.0.10 | Build tool / dev server |
| `@vitejs/plugin-react` | ^6.0.1 | Vite React plugin |
| `@rolldown/binding-win32-x64-msvc` | ^1.0.0-rc.18 | Native Rolldown binding (Windows) required by Vite builds |
| `typescript` | ~6.0.2 | Static type checking |
| `eslint` | ^10.2.1 | Linting |
| `typescript-eslint` | ^8.58.2 | TypeScript ESLint support |
| `eslint-plugin-react-hooks` | ^7.1.1 | React Hooks lint rules |
| `eslint-plugin-react-refresh` | ^0.5.2 | Fast-refresh lint rules |
| `@eslint/js` | ^10.0.1 | ESLint recommended rules |
| `globals` | ^17.5.0 | ESLint global variables definitions |
| `@types/react` / `@types/react-dom` | ^19.2.x | React type definitions |
| `@types/node` | ^24.12.2 | Node.js type definitions |

## Getting Started

### Prerequisites

| Requirement | Version / Notes |
|-------------|-----------------|
| Node.js | 20.19+ (or 22+). Vite 8 requires Node 20.19+. |
| PostgreSQL | 14+ running on `localhost:5432` (port/password configurable in `.env`) |
| npm | 10+ |
| Ollama | *Optional* — only needed for the chatbot. Install from [ollama.com](https://ollama.com) |
| Qdrant | *Optional* — vector DB for semantic search (self-hosted via Docker, or use [Qdrant Cloud](https://cloud.qdrant.io)) |

### 1. Clone & install

```bash
git clone https://github.com/tusharb8/dsa_sheet.git
cd dsa_sheet

cd server
npm install
cd ../client
npm install
cd ..
```

### 2. Configure the database

Create a PostgreSQL database (the app does not auto-create it):

```bash
# psql
CREATE DATABASE dsasheet;
```

Then configure the server environment:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and set at minimum:

```env
DB_PASSWORD=your_db_password
DB_NAME=dsasheet
JWT_SECRET=a_long_random_secret
```

### 3. (Optional) Install the chatbot model

```bash
# pull the model used by default
ollama pull llama3.1:8b
# ensure the Ollama service is running (default: http://localhost:11434)
```

For semantic search, also pull the embedding model:

```bash
ollama pull nomic-embed-text
```

### 3b. (Optional) Configure Qdrant

Self-host with Docker (`docker compose up -d qdrant`), or use a Qdrant Cloud cluster. Then set in `server/.env`:

```env
QDRANT_URL=https://your-cluster-id.eu-central-1-0.aws.cloud.qdrant.io
QDRANT_API_KEY=your_api_key
```

The collection is created automatically on first use. Re-index existing data by calling `POST /vector/reindex` (authenticated) — uploads via the Excel import re-index automatically.

### 4. Run the server

```bash
cd server
npm run start:dev
```

On first start, the app seeds an admin account automatically: **admin@dsasheet.com / admin123**.

### 5. Run the client

```bash
cd client
npm run dev
```

The client calls the API at `http://localhost:3000` by default; override with `VITE_API_URL` if needed.

### 6. Load sample data (optional)

Log in as the admin, then upload `client/public/sample-dsa-sheet.xlsx` via the Admin upload page (or `POST /upload`).

## URLs

| Resource | URL |
|----------|-----|
| Client (Vite dev server) | http://localhost:5173 |
| API server | http://localhost:3000 |
| Swagger docs | http://localhost:3000/api/docs |

## Chatbot

The chatbot uses the local [Ollama](https://ollama.com) model (`llama3.1:8b`) via LangChain. Configure it with `OLLAMA_BASE_URL` and `OLLAMA_MODEL` in `server/.env`. The model can call DSA Sheet APIs as tools (topics, problems, progress, mark-solved) and answers strictly from tool results.

## Semantic search (Qdrant)

Problems and resources are embedded (`EMBEDDING_MODEL`, default `nomic-embed-text`) and stored in Qdrant. This powers meaning-based lookups:

- Chatbot tool `search_semantic` — e.g. "problems about two pointers" or "videos on recursion".
- `search_problem` tries Qdrant first and falls back to SQL `LIKE` when the vector store is unreachable.
- Admin/Dev endpoints: `GET /vector/status`, `POST /vector/reindex`, `GET /vector/search?q=...`.

Sync is automatic: Excel uploads re-index everything, and problem/resource create/update/delete keep the collection in sync.
