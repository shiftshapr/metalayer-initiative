# Cleanup Notes - Context Engineering Reorganization

## 🧹 **Files to Remove (Duplicates)**

### **Duplicate Components (Keep `src/` versions)**
- `client/components/` → Remove (duplicate of `client/src/components/`)
- `client/App.css` → Remove (duplicate of `client/src/App.css`)
- `client/App.jsx` → Remove (duplicate of `client/src/App.js`)
- `client/index.css` → Remove (duplicate of `client/src/index.css`)
- `client/main.jsx` → Remove (duplicate of `client/src/index.js`)

### **Duplicate Pages (Keep `src/` versions)**
- `client/pages/` → Remove (duplicate of `client/src/pages/`)

### **Duplicate Utils (Keep `src/` versions)**
- `client/utils/` → Remove (duplicate of `client/src/utils/`)

### **Duplicate Hooks (Keep `src/` versions)**
- `client/hooks/` → Remove (duplicate of `client/src/hooks/`)

## 📁 **Final Structure (After Cleanup)**

```
client/
├── src/                    # ✅ Main React source code
│   ├── components/         # ✅ All React components
│   ├── pages/             # ✅ All page components
│   ├── hooks/             # ✅ Custom React hooks
│   ├── utils/             # ✅ Utility functions
│   ├── Sidebar.js         # ✅ Main sidebar component
│   ├── App.js             # ✅ Main app component
│   └── index.js           # ✅ React entry point
├── build/                 # ✅ Built extension files
├── public/                # ✅ Extension assets
├── package.json           # ✅ Dependencies
└── README.md              # ✅ Client documentation
```

## 🎯 **Why This Cleanup Helps AI**

1. **No Confusion**: Single source of truth for each component
2. **Clear Structure**: Easy to find files
3. **Better Context**: AI knows exactly where to look
4. **Faster Navigation**: No duplicate file searching

## 🚀 **Next Steps**

1. Remove duplicate files
2. Update any import paths if needed
3. Test that everything still works
4. Commit the clean structure
