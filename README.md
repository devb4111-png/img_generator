# Team Connect — Multi-Mode Image Generator

A decoupled, multi-mode image generator designed for Team Connect. The platform provides two distinct image generation workflows:

1. **Mode A: Template-Based Image Generation** — Predefined branded templates, uploadable logo, custom authority/organization title, and precise server-side compositing.
2. **Mode B: AI-Powered Image Generation** — Structured generative prompt synthesis, OpenAI background generation, and authentic server-side logo and text overlay.

---

## Architecture Overview

This project is built using a **strictly decoupled architecture** with separate frontend and backend applications:

```text
team-connect-image-generator/
│
├── frontend/               # Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
│   ├── src/
│   │   ├── app/            # App router pages (/, /templates, /ai-generate)
│   │   ├── components/     # UI components (Navbar, Footer, BackendHealthStatus)
│   │   └── services/       # API client & health check communication
│   ├── public/             # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── .env.example
│   └── .env.local
│
├── backend/                # Express.js, TypeScript, MongoDB (Mongoose), Sharp
│   ├── src/
│   │   ├── config/         # Environment variables & MongoDB connection
│   │   ├── controllers/    # API controllers (Health check)
│   │   ├── middleware/     # Centralized error handler & 404 handler
│   │   ├── routes/         # REST API routes (/api/health)
│   │   ├── app.ts          # Express application setup & CORS configuration
│   │   └── server.ts       # Server entry point & graceful shutdown
│   ├── uploads/            # Sandboxed logo uploads
│   ├── generated/          # Final rendered composite images
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .env
│
├── .gitignore
└── README.md
```

---

## Phase 1 Deliverables: Setup and Foundation

- **Frontend Application**:
  - Initialized with Next.js 16, React 19, TypeScript, and Tailwind CSS.
  - Responsive landing page showcasing **Mode A** and **Mode B**.
  - Dynamic navigation to `/templates` and `/ai-generate`.
  - Configurable API client pointing to `NEXT_PUBLIC_API_BASE_URL`.
  - Real-time `BackendHealthStatus` component verifying live communication with the backend.

- **Backend Application**:
  - Express.js application with TypeScript and structured routing.
  - Typed environment configuration (`src/config/env.ts`).
  - CORS configured for frontend communication (`http://localhost:3000`).
  - Centralized error-handling middleware (`src/middleware/errorHandler.ts`).
  - MongoDB connection manager with Mongoose (`src/config/db.ts`).
  - REST Health Check endpoint: `GET /api/health`.

---

## Quickstart & Setup Instructions

### Prerequisites
- Node.js (v18.x or v20+ recommended; verified on Node v24)
- npm (v9+)
- (Optional) Local or remote MongoDB instance (e.g. MongoDB Community Server or MongoDB Atlas)

---

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env and adjust if needed
cp .env.example .env

# Run in development mode (port 5000)
npm run dev

# Or build and run production bundle
npm run build
npm start
```

Backend endpoints:
- Health check: `http://localhost:5000/api/health`

#### Backend Environment Variables (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/team_connect
OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=dall-e-3
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=uploads
GENERATED_DIR=generated
MAX_UPLOAD_SIZE_MB=5
```

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env.local
cp .env.example .env.local

# Run development server (port 3000)
npm run dev

# Or build and test production bundle
npm run build
npm start
```

The frontend will be accessible at: `http://localhost:3000`

#### Frontend Environment Variables (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

---

## Health Check API Specification

- **Endpoint**: `GET /api/health`
- **Response Format**:
```json
{
  "status": "ok",
  "service": "Team Connect Image Generator Backend",
  "version": "1.0.0",
  "timestamp": "2026-10-26T06:00:00.000Z",
  "uptimeSeconds": 142,
  "environment": "development",
  "database": {
    "connected": true,
    "state": "connected",
    "host": "localhost",
    "name": "team_connect"
  },
  "storage": {
    "uploadsReady": true,
    "generatedReady": true
  }
}
```

---

---

## Generation API Endpoints (Phase 2 & Phase 3)

### Templates (Phase 2)
- `GET /api/templates` — List all active background templates and their placement configurations
- `GET /api/templates/:id` — Retrieve template metadata by ID
- `GET /api/templates/assets/:filename` — Securely stream template preview and background assets
- `POST /api/templates` — Create a new template (Requires `x-admin-secret` header)
- `PATCH /api/templates/:id` — Update template configuration (Requires `x-admin-secret` header)

### Image Generations
- `POST /api/generations/template` — Template-based generation: Upload logo (`.png` or `.svg`), specify `templateId` and `organizationName`. Composites layers via Sharp.
- `POST /api/generations/ai` — AI-Powered generation: Upload logo (`.png` or `.svg`), specify `creativeIdea` (up to 10,000 words), `organizationName`, optional `size` (`1024x1024`, `1792x1024`, `1024x1792`), `style` (`vivid`, `natural`), and `brandingZone`. Synthesizes photorealistic diffusion backgrounds with 100% Free AI Diffusion Studio (zero-cost, zero paid keys) and composites authentic logo & typography.
- `GET /api/generations/:id` — Retrieve generation metadata and status
- `GET /api/generations/:id/view` — Stream composite PNG for inline browser preview
- `GET /api/generations/:id/download` — Download composite image as attachment (`.png`)

---

## Phase 4 Deliverables: Security Hardening & Automated Testing

- **HTTP Security Hardening (Helmet)**:
  - Custom Content Security Policy with cross-origin resource sharing policy (`cross-origin`) allowing seamless local frontend preview.
  - `X-Content-Type-Options: nosniff`, `X-Frame-Options`, and secure headers.
- **DDoS & Abuse Protection (Rate Limiting)**:
  - Global API limiter: 150 requests per 15 minutes (`apiRateLimiter`).
  - Image generation limiter: 30 requests per 15 minutes (`generationRateLimiter`).
- **File Upload & Magic Byte Verification**:
  - Validates binary magic bytes for PNG (`89 50 4E 47 0D 0A 1A 0A`) to prevent file extension spoofing.
  - Sanitizes SVG uploads to reject active scripts (`<script>`), event handlers (`onload`, `onerror`), and XXE entity injections.
- **Path Traversal Protection**:
  - `isSafeFilename` validation preventing `../`, null-byte injections, and path directory traversal on asset streaming endpoints.
- **Automated Testing Suite (Jest & Supertest)**:
  - 4 comprehensive test suites across 21 unit and integration tests covering Health, Security Hardening, Templates, and Free AI Generation.
  - Run with: `npm test` inside `backend/`.

---

## Roadmap

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 1** | Project Setup, Foundation & Decoupled Architecture | **Complete** |
| **Phase 2** | Template-Based Image Generation & Sharp Compositing | **Complete** |
| **Phase 3** | AI-Powered Image Generation (100% Free Diffusion Studio & 10,000-Word Prompts) | **Complete** |
| **Phase 4** | Security Hardening, Automated Testing & Verification | **Complete** |
