# AI Quick Start Guide - Metalayer Initiative

## 🚀 **For AI Assistants: How to Help with This Project**

### **📋 Project Summary**
- **What**: Chrome extension + Node.js API for human-agent interaction
- **Status**: Working prototype (85% complete)
- **Goal**: Metaweb-inspired coordination layer

### **🎯 Quick Understanding (5 minutes)**

1. **Read**: `PROJECT_CONTEXT.md` - Project overview
2. **Check**: `COMPONENT_MAP.md` - File purposes
3. **Test**: `demo.html` - See what works
4. **Start**: `app.js` - Backend entry point

### **🔧 Common Tasks & Where to Look**

#### **"How does authentication work?"**
- **Frontend**: `client/src/components/AuthModal.jsx`
- **Backend**: `controllers/authController.js` + `routes/auth.js`
- **Flow**: Google OAuth → Passport.js → Session management

#### **"How does chat work?"**
- **Frontend**: `client/src/components/ChatBox.jsx`
- **Backend**: `controllers/chatController.js` + `routes/chat.js`
- **Storage**: In-memory array (temporary)

#### **"How does the extension work?"**
- **Injection**: `client/build/contentScript.js`
- **UI**: `client/src/Sidebar.js`
- **Config**: `client/build/manifest.json`

#### **"What's the database structure?"**
- **Schema**: `prisma/schema.prisma`
- **Models**: User, Community, Message, Interaction, etc.
- **Status**: Ready but not connected

### **🛠️ Development Workflow**

#### **To Test the System:**
1. **Start backend**: `node app.js` (port 3001)
2. **Load extension**: Chrome → Extensions → Load `client/build`
3. **Test**: Visit any website, click 🛡️ button

#### **To Add Features:**
1. **Backend**: Add route → controller → service
2. **Frontend**: Add component → integrate with API
3. **Test**: Use `demo.html` or extension

### **🎯 Current Priorities**

#### **High Priority (Production Ready)**
1. **Connect PostgreSQL database** (replace in-memory storage)
2. **Fix any remaining bugs** in the extension
3. **Add proper error handling**

#### **Medium Priority (Advanced Features)**
1. **Integrate Solana blockchain** (real transactions)
2. **Implement TEE security** (real hardware)
3. **Add AI agent orchestration** (Eliza/Swarm)

### **🔍 Debugging Tips**

#### **Extension Not Working?**
- Check `chrome://extensions/` for errors
- Look at browser console for JavaScript errors
- Verify `manifest.json` has correct file paths

#### **API Not Responding?**
- Check if `node app.js` is running on port 3001
- Test with `curl http://localhost:3001/`
- Check browser network tab for failed requests

#### **Database Issues?**
- Currently using in-memory storage
- Data resets when server restarts
- Need to connect PostgreSQL for persistence

### **📚 Key Files to Remember**

| File | Why It's Important |
|------|-------------------|
| `app.js` | Main server entry point |
| `client/src/Sidebar.js` | Main frontend component |
| `prisma/schema.prisma` | Database structure |
| `demo.html` | Interactive testing |
| `PROJECT_CONTEXT.md` | Project overview |

### **🎯 Success Metrics**

- ✅ **Extension loads** in Chrome
- ✅ **Sidebar appears** on websites
- ✅ **Chat works** (send/receive messages)
- ✅ **Communities work** (select/switch)
- ✅ **Auth works** (Google OAuth)
- ✅ **APIs respond** (all endpoints working)

### **🚨 Common Issues**

1. **"Extension not loading"** → Check manifest.json file paths
2. **"API not working"** → Check if backend server is running
3. **"Data not saving"** → Using in-memory storage (expected)
4. **"Google Auth failing"** → Need proper OAuth credentials

### **💡 Pro Tips for AI Assistants**

- **Always check** if the backend server is running first
- **Use the demo page** to test APIs quickly
- **Look at the component map** to understand file relationships
- **Remember**: This is a working prototype, not production code
- **Focus on**: Database connection and production hardening

### **🎯 Next Steps for AI Help**

1. **Database Integration**: Connect Prisma to PostgreSQL
2. **Error Handling**: Add proper error handling throughout
3. **Testing**: Add automated tests
4. **Documentation**: Add inline code documentation
5. **Performance**: Optimize for production use
