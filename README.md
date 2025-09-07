# Metalayer Human-Agent Interaction Prototype

This repository contains a **fully functional prototype** of a Metaweb-inspired coordination layer enabling human-avatar (agent) interaction with community-aware policies, messaging, and presence tracking.

---

## 🧠 Project Overview

- **Frontend**: ✅ **COMPLETE** - React sidebar overlay, packaged as a browser extension. Provides chat, community selection, visibility layer, and authentication.
- **Backend**: ✅ **COMPLETE** - Node.js/Express, modular controllers/routes/services, with endpoints for auth, chat, communities, interactions, policy, and blockchain logging (Solana, stubbed).
- **Database**: 🔄 **SCAFFOLDED** - PostgreSQL (via Prisma ORM), with tables for users, sessions, communities, interactions, messages, vault, avatars, etc.
- **TEE & Agents**: 🔄 **STUBBED** - Stubs for Trusted Execution Environment (TEE) and agent orchestration (Eliza, Swarm). MCP protocol planned.

---

## 🧱 Stack

- **Frontend**: React, packaged as a Chrome extension (sidebar overlay)
- **Backend**: Node.js (Express), modular structure
- **Database**: PostgreSQL (Prisma ORM) - schema ready
- **Blockchain**: Solana (logging, stubbed)
- **TEE/Agents**: Stubs for Eliza, Swarm, MCP

---

## 📂 Folder Structure

```
/client            → React sidebar extension (Canopi overlay shell)
  src/             → Sidebar, overlay logic, auth stubs
  public/          → manifest.json, contentScript.js
  build/           → Built extension (after npm run build)
/controllers/      → API controllers (auth, poh, chat, etc.)
/routes/           → Express route handlers
/services/         → Business logic, blockchain, TEE, agents
/prisma            → Prisma schema, migrations
app.js             → Main server entry point
package.json       → Root dependencies
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Install root dependencies (backend)
npm install

# Install frontend dependencies
cd client && npm install
```

### 2. Start the Backend Server

```bash
# From root directory
npm start
# Server will run on http://localhost:3001
```

### 3. Build and Load the Frontend Extension

```bash
# Build the React app
cd client && npm run build
```

1. Go to Chrome > Extensions > Load Unpacked
2. Select `client/build` as the extension root
3. The sidebar overlay and floating icon will appear on any website

### 4. Test the Full System

1. **Authentication**: Click the floating 🛡️ icon, then click "Auth" in the sidebar
2. **Communities**: Select a community from the "Community Selector" tab
3. **Chat**: Send messages in the "Live Chat" tab
4. **Visibility**: Manage privacy settings in the "Visibility Layer" tab

---

## 🗺️ Roadmap

1. ✅ **Frontend**: Sidebar overlay as browser extension (COMPLETE)
2. ✅ **Auth**: Google OAuth, Fractal ID (stubs implemented)
3. ✅ **Backend**: Modular endpoints for all features (COMPLETE)
4. 🔄 **Database**: Prisma schema ready (to connect)
5. 🔄 **Blockchain**: Solana logging (stubbed)
6. 🔄 **TEE/Agents**: Stubs for Eliza, Swarm, MCP (to implement)

---

## 📦 API Endpoints (All Working)

| Method | Endpoint              | Description                   |
| ------ | --------------------- | ----------------------------- |
| GET    | `/`                   | Health check                  |
| POST   | `/auth/login`         | User login (mock)             |
| GET    | `/auth/me`            | Session info                  |
| GET    | `/communities`        | List communities              |
| POST   | `/communities/select` | Select community              |
| POST   | `/chat/message`       | Send message                  |
| GET    | `/chat/history`       | Fetch chat messages           |
| POST   | `/interaction/log`    | Log interaction               |
Fork, PR, or build alongside this prototype. For Meta-Layer Initiative info:
- [Call for Input](https://themetalayer.org/call-for-input)
- [AI Call](https://themetalayer.org/ai-call-for-input)
- [Submit Work](https://themetalayer.org/contribute#bridgit)

---

*This is an early prototype — use and remix to explore next-gen coordination.*
