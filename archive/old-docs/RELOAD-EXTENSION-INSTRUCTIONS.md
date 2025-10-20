# 🔄 How to Reload the Extension

## ⚠️ IMPORTANT: You're Running Old Code!

Your logs show you're running an **old cached version** of the extension. The fix is already in the code, but your browser hasn't loaded it yet.

## 🚀 Quick Fix (30 seconds)

### Step 1: Reload the Extension
1. Open a new tab
2. Go to: `chrome://extensions/`
3. Find **"Metalayer Initiative"** in the list
4. Click the **🔄 reload button** (circular arrow icon)

### Step 2: Restart the Sidepanel
1. Close the current sidepanel
2. Click the extension icon to reopen it

### Step 3: Verify It Worked
Open the sidepanel console (F12) and look for:
```
🚀 EXTENSION RELOADED: { build: '2025-10-14-enhanced-logging', ... }
```

If you see `'2025-10-14-enhanced-logging'` ✅ **You're good!**

If you see something else ❌ **Try Step 4**

### Step 4: Hard Reload (if Step 1-3 didn't work)
1. Go to `chrome://extensions/`
2. Click **"Remove"** on Metalayer Initiative
3. Reinstall the extension from your local files
4. Reopen the sidepanel

## 🧪 Test It's Working

Run this in the sidepanel console:
```javascript
testInactiveVisibility()
```

You should see:
```
✅ Extension build: 2025-10-14-enhanced-logging
✅ Found X users in visibility data
✅ Found X user elements in DOM
```

## 🎯 What Should Happen Now

### When Both Profiles on Same Page:
- ✅ Both see each other
- ✅ Status: "Now" or "Online for X minutes"
- ✅ Green status dot

### When One Profile Moves to Different Page:
- ✅ Other profile STILL sees them
- ✅ Status: "Last seen X seconds/minutes ago"
- ✅ Gray status dot

### When Profile Returns to Same Page:
- ✅ Both see each other again
- ✅ Status: "Now" or "Online for X minutes"
- ✅ Green status dot

## 🐛 Still Not Working?

### Check Build Version:
```javascript
window.EXTENSION_BUILD
```

Should return: `"2025-10-14-enhanced-logging"`

### Check for Multiple Versions:
1. Go to `chrome://extensions/`
2. Look for duplicate "Metalayer Initiative" entries
3. Disable/remove all except the latest one

### Clear Browser Cache:
1. Press `Ctrl+Shift+Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Restart Chrome

## 📞 Need Help?

If you're still seeing the old behavior after following these steps:

1. Run the diagnostic: `testInactiveVisibility()`
2. Copy the full console output
3. Share it with the team

The diagnostic will tell us exactly what's wrong!

---

**Remember:** The fix is already in the code. You just need to reload the extension to get it! 🎉


