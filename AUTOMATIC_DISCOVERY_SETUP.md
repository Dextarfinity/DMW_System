# AUTOMATIC SERVER DISCOVERY - SETUP & TESTING

## What Changed

### Server Side (`server/server.js`)
- Added **UDP Broadcast** mechanism on port 5555
- Server automatically broadcasts: `DMW-SERVER|192.168.x.x|3000|192.168.x.x,...`
- Broadcasts every 5 seconds on the network
- No configuration needed - uses detected network IPs

### Client Side (`main.js`)
- Added **UDP Broadcast Listener** on port 5555
- Listens for server broadcasts (FASTEST method)
- Fallback to HTTP endpoint if broadcast fails
- **FULLY AUTOMATIC** - no manual IP entry

## Discovery Flow (Zero Configuration)

```
┌─────────────────────────────────────────────┐
│  SERVER PC connects to WiFi                 │
│  192.168.100.50                             │
└──────────────┬──────────────────────────────┘
               │
         ┌─────▼─────┐
         │  Starts   │
         │ server    │
         └─────┬─────┘
               │
         ┌─────▼──────────────┐
         │ Broadcasts UDP:    │
         │ "DMW-SERVER|       │
         │  192.168.100.50|   │
         │  3000|..."         │
         └─────┬──────────────┘
               │
     ┌─────────┼─────────┐
     │         │         │
  ┌──▼──┐  ┌──▼──┐  ┌──▼──┐
  │Client1│ │Client2│ │Client3│
  │WiFi   │ │WiFi   │ │WiFi   │
  └──┬───┘ └──┬───┘ └──┬───┘
     │        │        │
  ┌──▼────────▼────────▼──┐
  │ Receives broadcast ✓  │
  │ Learns server IP      │
  │ Connects instantly!   │
  └──────────────────────┘
```

## Setup Steps

### **STEP 1: Server PC - Install & Start**

```bash
cd "c:\Users\Kurt\Desktop\PROCUREMENT SYSTEM - Copy\DMW_System\server"
npm install
npm run dev
```

**Should show:**
```
[DISCOVERY] Starting UDP broadcast on port 5555...
[DISCOVERY] Will broadcast: "DMW-SERVER|192.168.100.50|3000"
Network: http://192.168.100.50:3000
```

### **STEP 2: Client PC - Build & Test**

```bash
cd "c:\Users\Kurt\Desktop\PROCUREMENT SYSTEM - Copy\DMW_System"
npm install
npm start
```

**Watch Console (Ctrl+Shift+I) - should show:**
```
[BROADCAST] Listening for server broadcasts on port 5555...
[BROADCAST] ✓ Received broadcast from 192.168.100.50
[BROADCAST] Primary IP: 192.168.100.50:3000
[BROADCAST] All IPs: 192.168.100.50, ...
[DISCOVERY] ✓✓✓ SERVER FOUND via BROADCAST at 192.168.100.50:3000 ✓✓✓
[UI] ✓ Server is UP - Loading frontend
```

### **STEP 3: Test Multiple Clients**

Repeat STEP 2 on different client PCs - they should all auto-discover!

## Key Features

✅ **ZERO Manual Configuration** - No IP addresses to enter
✅ **AUTOMATIC Discovery** - UDP broadcast method (fastest)
✅ **FALLBACK Support** - Uses HTTP if broadcast fails
✅ **Multi-Network** - Works on WiFi, Ethernet, etc.
✅ **Real-Time** - Server broadcasts every 5 seconds
✅ **Network Agnostic** - Works on any network

## What If Server IP Changes?

**Example:** WiFi disconnects, server reconnects to different WiFi
- Server detects new IP
- Immediately broadcasts new IP  
- Clients receive broadcast
- Clients auto-reconnect

**No restart needed on clients!**

## Firewall Configuration

You may need to allow UDP port 5555:

**Windows Firewall:**
```powershell
# Admin PowerShell
New-NetFirewallRule -DisplayName "DMW Server Discovery" -Direction Inbound -Action Allow -Protocol UDP -LocalPort 5555
```

## Testing Checklist

- [ ] Server PC starts with `npm run dev`
- [ ] Console shows: `[DISCOVERY] Starting UDP broadcast on port 5555...`
- [ ] Client PC starts with `npm start`
- [ ] Client console shows: `[BROADCAST] ✓ Received broadcast`
- [ ] Client successfully connects to server
- [ ] Application loads without errors
- [ ] Test on multiple client PCs
- [ ] All clients see same data in real-time

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `[BROADCAST] No broadcast received` | Check firewall allows UDP 5555 |
| Server not showing broadcast IP | Check `.env` has `HOST=0.0.0.0` |
| Client connects to localhost instead | Broadcast may have failed, check firewall |
| Multiple server IPs not working | Server will use primary IP (sorted) |

## Next Steps

1. Test server startup: `npm run dev`
2. Test client discovery: `npm start`
3. Once working, commit changes
4. Push to your repo
5. Server PC pulls the changes
6. All clients get the improvements!
