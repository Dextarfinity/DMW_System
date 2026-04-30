# Server Auto IP Detection Setup Guide

## Overview
The client application now has **automatic IP detection** - it no longer needs manual IP configuration! The system works by:

1. **Server discovers its own network IPs** via `/api/server-ips` endpoint
2. **Client queries this endpoint** to get all available server IPs
3. **Client tests all IPs** and connects to the first one that responds

## What Changed in the Client

✅ **Fixed Issues:**
- Removed unsupported `AbortSignal.timeout()` syntax (now compatible with Node.js/Electron)
- Fixed malformed comment block in app.js
- CSP policy already includes wildcard `http: https: ws: wss:` for any IP connections

✅ **New Features:**
- Auto-discovery endpoint: `/api/server-ips` (already implemented on server)
- Automatic reconnection when new IPs are available
- Console logging for debugging (look in DevTools: `[DISCOVERY]` tags)

## How to Deploy to Server PC

### Step 1: Push Changes to Remote/Clone to Server
```bash
# On THIS PC (current machine):
cd "c:\Users\Kurt\Desktop\PROCUREMENT SYSTEM - Copy\DMW_System"
git push origin main

# OR if no remote configured, create one:
git remote add origin <remote-url>
git push -u origin main
```

### Step 2: On the SERVER PC, Pull Latest Changes
```bash
cd /path/to/DMW_System
git pull origin main
```

### Step 3: Restart the Server
```bash
# Stop current server
npm stop
# or: 
pm2 stop server

# Start server
npm start
# or: 
pm2 start server.js
```

## Server Configuration (Already Done)

The server already has everything configured:

✅ **Health Check Endpoint** (`/api/health`)
- Returns current server IP and status
- Client uses this to verify server is reachable

✅ **Auto-Discovery Endpoint** (`/api/server-ips`)
- Returns all network IPs the server is listening on
- Client uses this to populate the IP list

✅ **Socket.IO Real-Time Broadcast**
- Listens on `0.0.0.0:3000` (all network interfaces)
- CORS enabled for any origin
- WebSocket + Polling support

## Debugging Connection Issues

### If client still can't connect:

1. **Verify server is running:**
   ```bash
   # On server PC, check if port 3000 is listening
   netstat -an | find "3000"
   # or on Linux:
   ss -tlnp | grep 3000
   ```

2. **Check server logs for errors:**
   ```bash
   # If using PM2:
   pm2 logs server
   ```

3. **Test endpoint directly:**
   ```bash
   # From client PC, test if server responds:
   curl http://[server-ip]:3000/api/health
   ```

4. **Check firewall:**
   - Windows: Allow port 3000 in Windows Defender Firewall
   - Command: `netsh advfirewall firewall add rule name="Node.js Port 3000" dir=in action=allow protocol=tcp localport=3000`

5. **Check network connectivity:**
   ```bash
   # From client PC:
   ping [server-ip]
   ```

## What the Client Logs Show

Open DevTools (F12) and look for:

```
[CONFIG] Renderer loaded server IPs from external config: (3) ['192.168.1.117', '192.168.1.118', '192.168.100.235']

[DISCOVERY] Trying candidates: ['192.168.1.100', '192.168.1.117', ...]

[DISCOVERY] ✓ Server found at 192.168.1.100:3000
```

## Files Changed

**Client Side:**
- `renderer/scripts/app.js` - Enhanced server discovery & periodic IP refresh

**Server Side:**
- No changes needed! Server already has auto-discovery endpoints

## Next Steps

1. ✅ Commit & push changes (already done)
2. ⏳ On server PC: Pull changes and restart server
3. ⏳ Test client connection - it should auto-detect and connect!

---

**Status:** Ready for deployment
**Compatibility:** Node.js 12+ (tested), Electron latest

