# Component Map - Metalayer Initiative

## 🎯 **Purpose**
This file maps every component in the project so AI assistants can quickly understand what each file does and how they connect.

## 📱 **FRONTEND COMPONENTS**

### **Chrome Extension Core**
| File | Purpose | Status | Dependencies |
|------|---------|--------|--------------|
| `client/build/index.html` | Extension entry point | ✅ Working | React app |
| `client/build/contentScript.js` | Injects sidebar into websites | ✅ Working | Chrome APIs |
| `client/build/background.js` | Extension background service | ✅ Working | Chrome APIs |
| `client/build/manifest.json` | Extension configuration | ✅ Working | Chrome APIs |

### **React Components**
| File | Purpose | Status | Dependencies |
|------|---------|--------|--------------|
| `client/src/Sidebar.js` | Main sidebar component | ✅ Working | All other components |
| `client/src/components/ChatBox.jsx` | Chat interface | ✅ Working | API calls |
| `client/src/components/CommunitySelector.jsx` | Community selection | ✅ Working | API calls |
| `client/src/components/VisibilityLayer.jsx` | Privacy controls | ✅ Working | Local state |
| `client/src/components/AuthModal.jsx` | Authentication modal | ✅ Working | Google OAuth |

## 🖥️ **BACKEND COMPONENTS**

### **Server Core**
| File | Purpose | Status | Dependencies |
|------|---------|--------|--------------|
| `app.js` | Main server entry point | ✅ Working | Express, all routes |
| `package.json` | Dependencies and scripts | ✅ Working | Node.js |

### **API Controllers**
| File | Purpose | Status | Dependencies |
|------|---------|--------|--------------|
| `controllers/authController.js` | User authentication | ✅ Working | Passport.js |
| `controllers/chatController.js` | Message handling | ✅ Working | In-memory store |
| `controllers/communitiesController.js` | Community management | ✅ Working | In-memory store |
| `controllers/policyController.js` | Policy enforcement | ✅ Working | OPA stubs |
| `controllers/interactionController.js` | User interaction logging | ✅ Working | Blockchain stubs |
| `controllers/pohController.js` | Proof of Humanity | ✅ Working | Fractal ID stubs |

### **API Routes**
| File | Purpose | Status | Dependencies |
|------|---------|--------|--------------|
| `routes/auth.js` | Authentication endpoints | ✅ Working | authController |
| `routes/chat.js` | Chat endpoints | ✅ Working | chatController |
| `routes/communities.js` | Community endpoints | ✅ Working | communitiesController |
| `routes/policy.js` | Policy endpoints | ✅ Working | policyController |
| `routes/interaction.js` | Interaction endpoints | ✅ Working | interactionController |
| `routes/poh.js` | PoH endpoints | ✅ Working | pohController |
| `routes/avatars.js` | Avatar endpoints | ✅ Working | Avatar management |

### **Services (Stubs)**
| File | Purpose | Status | Dependencies |
|------|---------|--------|--------------|
| `services/agentService.js` | AI agent orchestration | 🔄 Stub | Eliza, Swarm, MCP |
| `services/blockchainService.js` | Blockchain integration | 🔄 Stub | Solana |
| `services/teeService.js` | Trusted Execution Environment | 🔄 Stub | TEE hardware |
| `services/solanaService.js` | Solana-specific operations | 🔄 Stub | Solana SDK |
| `services/dbService.js` | Database operations | 🔄 Stub | Prisma |
| `services/sessionStore.js` | Session management | 🔄 Stub | Redis/Memory |

## 🗄️ **DATABASE COMPONENTS**

### **Schema & Models**
| File | Purpose | Status | Dependencies |
|------|---------|--------|--------------|
| `prisma/schema.prisma` | Database schema | ✅ Complete | PostgreSQL |
| `prisma/test.js` | Database testing | 🔄 Stub | Prisma Client |

## 📋 **DOCUMENTATION**

### **Project Documentation**
| File | Purpose | Status | Dependencies |
|------|---------|--------|--------------|
| `README.md` | Project overview | ✅ Complete | None |
| `PROJECT_CONTEXT.md` | AI context guide | ✅ Complete | None |
| `COMPONENT_MAP.md` | This file | ✅ Complete | None |
| `demo.html` | Interactive demo | ✅ Complete | Backend API |

## 🔗 **Component Relationships**

### **Frontend Flow**
```
contentScript.js → Sidebar.js → [ChatBox, CommunitySelector, VisibilityLayer, AuthModal]
```

### **Backend Flow**
```
app.js → routes/ → controllers/ → services/
```

### **Data Flow**
```
Frontend → Backend API → Controllers → Services → Database
```

## 🎯 **Key Integration Points**

1. **Frontend ↔ Backend**: HTTP API calls to `localhost:3001`
2. **Extension ↔ Websites**: Content script injection
3. **Auth ↔ Google**: OAuth 2.0 flow
4. **Backend ↔ Database**: Prisma ORM (when connected)
5. **Services ↔ External**: Blockchain, TEE, AI agents (when implemented)

## 🚨 **Current Limitations**

1. **Database**: Using in-memory storage, not connected to PostgreSQL
2. **Blockchain**: Mock transactions, not real Solana integration
3. **TEE**: Stub implementation, not real TEE hardware
4. **Agents**: Placeholder code, not real AI agent orchestration

## 🎯 **AI Assistant Notes**

- **Start with**: `PROJECT_CONTEXT.md` for overview
- **For frontend**: Look at `client/src/Sidebar.js` as main component
- **For backend**: Start with `app.js` then follow routes → controllers
- **For database**: Check `prisma/schema.prisma` for data models
- **For testing**: Use `demo.html` to test all functionality
