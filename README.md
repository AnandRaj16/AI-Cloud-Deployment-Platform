# AI Cloud Deployment Platform

This repo is a small deployment pipeline made of a few simple services.  
You paste a GitHub repo URL in the UI, it gets uploaded to object storage, built in a worker, and then served from a subdomain.

If you are onboarding quickly, start from the **Run** section and come back for details later.

## What each service does

- `frontend` - React/Vite app where you trigger deploys and use Ask AI.
- `upload-server` - clones repos, uploads source files to R2, pushes build jobs to Redis, and exposes `/ask`.
- `deploy-server` - pulls jobs from Redis, downloads source from R2, builds the project, uploads final static assets.
- `request-handler` - serves deployed files from R2 at `dist/<id>/...`.

## Before you start

You need:

- Node.js 18+ (Node 24 works fine)
- Redis on `localhost:6379`
- valid Cloudflare R2 credentials configured in the server code

## Environment setup

Create `upload-server/.env`:

```env
GROQ_API_KEY=your_groq_api_key
```

This key is used by `POST /ask` with:

- model: `openai/gpt-oss-120b`
- endpoint: `https://api.groq.com/openai/v1/chat/completions`

## Install and build

Run these once:

```bash
cd upload-server && npm install && tsc -b
cd ../deploy-server && npm install && tsc -b
cd ../request-handler && npm install && tsc -b
cd ../frontend && yarn install
```

## Run locally (4 terminals)

### 1) Redis

```bash
redis-server
```

### 2) Upload server

```bash
cd upload-server
node dist/index.js
```

### 3) Deploy server

```bash
cd deploy-server
node dist/index.js
```

### 4) Request handler + frontend

```bash
cd request-handler
node dist/index.js
```

```bash
cd frontend
yarn dev
```

## How a deploy actually moves through the system

1. You submit a GitHub repo URL in the frontend.
2. `upload-server` clones it and uploads source files to R2 under `output/<id>/...`.
3. The deploy id is pushed to Redis queue `build-queue`.
4. `deploy-server` picks it up, builds it, then uploads build output to `dist/<id>/...`.
5. `request-handler` serves those files when requests come for that deploy id.

## API quick reference

### upload-server

- `POST /deploy`  
  body: `{ "repoUrl": "https://github.com/user/repo.git" }`
- `GET /status?id=<id>`
- `POST /ask`  
  body: `{ "prompt": "..." }`

### request-handler

- `GET /*` -> serves `dist/<subdomain>/<path>` from R2

## Troubleshooting

- `ECONNREFUSED` in `upload-server` usually means Redis is not running.
- If deployment stays stuck, check both `upload-server` and `deploy-server` logs for that deploy id.
- Frontend build may fail right now because `frontend/src/App.tsx` has an unused `useState` import.
- Keep secrets only in `.env` and never commit real keys.
