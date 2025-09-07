# Metalayer Initiative - Human-Agent Interaction Platform

> **Status**: 🟢 **Working Prototype** (85% Complete)  
> **Context**: Metaweb-inspired coordination layer for human-avatar interaction

## 🎯 **Quick Start for AI Assistants**

1. **Read**: `PROJECT_CONTEXT.md` - Complete project overview
2. **Check**: `COMPONENT_MAP.md` - File purposes and relationships  
3. **Guide**: `AI_QUICK_START.md` - How to help with this project
4. **Test**: `demo.html` - Interactive demo of all features

## 🚀 **Quick Start for Developers**

### **1. Start Backend**
```bash
npm install
node app.js  # Runs on http://localhost:3001
```

### **2. Load Extension**
```bash
cd client
npm install
npm run build
# Load client/build in Chrome Extensions
```

### **3. Test System**
- Visit any website
- Click floating 🛡️ button
- Use sidebar features

## 🏗️ **Architecture**

### **Frontend: Chrome Extension**
- **Location**: `client/src/` (React components)
- **Build**: `client/build/` (Extension files)
- **Features**: Chat, Communities, Privacy, Auth

### **Backend: Node.js API**
- **Entry**: `app.js` (Main server)
- **Logic**: `controllers/` (Business logic)
- **Routes**: `routes/` (API endpoints)
- **Services**: `services/` (External integrations)

### **Database: PostgreSQL + Prisma**
- **Schema**: `prisma/schema.prisma`
- **Status**: Ready, not connected

## 📊 **Current Status**

| Component | Status | Completion |
|-----------|--------|------------|
| **Chrome Extension** | ✅ Working | 100% |
| **Backend API** | ✅ Working | 95% |
| **Authentication** | ✅ Working | 90% |
| **Database Schema** | ✅ Ready | 90% |
| **Database Connection** | 🔄 Needed | 20% |
| **Blockchain Integration** | 🔄 Stubbed | 15% |
| **TEE Security** | 🔄 Stubbed | 10% |
| **AI Agents** | 🔄 Stubbed | 10% |

## 🎯 **Key Features**

- **🛡️ Chrome Extension**: Sidebar overlay on any website
- **💬 Real-time Chat**: Community-based messaging
- **👥 Communities**: Different rule sets and moderation
- **👁️ Privacy Controls**: Visibility and permission management
- **🔐 Authentication**: Google OAuth integration
- **📋 Policy Engine**: Community rule enforcement

## 🔧 **API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/auth/login` | User authentication |
| GET | `/communities` | List communities |
| POST | `/chat/message` | Send message |
| GET | `/chat/history` | Get chat history |
| POST | `/policy/enforce` | Policy enforcement |

## 🎯 **Next Steps**

1. **Connect PostgreSQL database** (replace in-memory storage)
2. **Integrate Solana blockchain** (real transactions)
3. **Implement TEE security** (hardware integration)
4. **Add AI agent orchestration** (Eliza/Swarm/MCP)

## 📚 **Documentation**

- **`PROJECT_CONTEXT.md`** - Complete project overview
- **`COMPONENT_MAP.md`** - File purposes and relationships
- **`AI_QUICK_START.md`** - AI assistant guide
- **`demo.html`** - Interactive testing

## 🤝 **Contributing**

This is a working prototype demonstrating the Metalayer vision. Fork, remix, and build alongside this foundation.

**Meta-Layer Initiative Links:**
- [Call for Input](https://themetalayer.org/call-for-input)
- [AI Call](https://themetalayer.org/ai-call-for-input)
- [Submit Work](https://themetalayer.org/contribute#bridgit)

---

*Built for next-gen human-agent coordination* 🚀
