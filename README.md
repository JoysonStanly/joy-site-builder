<div align="center">

# 🏗️ Site Builder

**An AI-powered website builder with a React frontend and Express backend.**

[![CI](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/actions/workflows/ci.yml)
[![Client Build](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/actions/workflows/ci.yml/badge.svg?branch=main&label=client)](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/actions/workflows/ci.yml)
[![Deploy](https://img.shields.io/badge/deployed%20on-Render-46E3B7?logo=render&logoColor=white)](https://render.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

</div>

---

## 📋 Overview

Site Builder is a full-stack monorepo that lets users generate and manage websites using AI. It uses:

- **AI code generation** via OpenAI
- **Authentication** via [better-auth](https://better-auth.com/)
- **Payments** via Stripe
- **Database** via PostgreSQL + Prisma

---

## 🏛️ Architecture

```
site-builder/
├── client/          # React 19 + Vite + TailwindCSS v4 + TypeScript
└── server/          # Express 5 + TypeScript + Prisma (PostgreSQL)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 22
- PostgreSQL database
- OpenAI API key
- Stripe account

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
cd site-builder
```

### 2. Setup the Server

```bash
cd server
cp .env.example .env     # fill in your secrets
npm install              # also runs prisma generate
npm run server           # starts dev server with nodemon
```

### 3. Setup the Client

```bash
cd client
cp .env.example .env     # set VITE_API_URL
npm install
npm run dev              # starts Vite dev server
```

---

## 🔧 Environment Variables

### `server/.env`

| Variable | Description |
|---|---|
| `PORT` | Port Render assigns to the server process |
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret key for better-auth |
| `BETTER_AUTH_URL` | Base URL of your server |
| `OPENAI_API_KEY` | OpenAI API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `TRUSTED_ORIGINS` | Comma-separated frontend origins allowed by CORS and auth |

### `client/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | URL of your backend server on Render |

If you already use `VITE_BASEURL`, the client still supports it for backward compatibility, but `VITE_API_URL` is the preferred name.

---

## ⚙️ CI/CD Pipeline

This project uses **GitHub Actions** for continuous integration and deployment.

### Workflow: `CI`

Triggered on every push/PR to `main` or `dev`.

| Job | Steps |
|---|---|
| 🖥️ **Client** | ESLint → TypeScript type-check → Vite build |
| 🔧 **Server** | TypeScript type-check → `tsc` compile |
| 🚀 **Deploy** | Triggers Render deploy hooks _(main branch only, after CI passes)_ |

### Setting up Render Deploy Hooks

1. In your [Render dashboard](https://render.com), go to each service → **Settings → Deploy Hook** → copy the URL
2. Add them as GitHub Secrets (**Settings → Secrets → Actions**):
   - `RENDER_CLIENT_DEPLOY_HOOK` — deploy hook URL for the client static site
   - `RENDER_SERVER_DEPLOY_HOOK` — deploy hook URL for the server web service
   - `VITE_API_URL` — your server's public Render URL (used during client build)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, TailwindCSS 4, TypeScript |
| Backend | Node.js, Express 5, TypeScript |
| Auth | better-auth |
| Database | PostgreSQL, Prisma 7 |
| AI | OpenAI API |
| Payments | Stripe |
| Hosting | Render (client + server) |
| CI/CD | GitHub Actions |

---

## 📄 License

MIT
