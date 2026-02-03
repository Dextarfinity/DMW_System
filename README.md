# Procurement Plan System

A desktop application for managing procurement plans, purchase requests, and purchase orders.

## Features

Based on the system design from the planning document:

### 5 User Roles (RBAC)
- **Admin** - Full system access, user management
- **Manager** - Approve/reject plans, view all data
- **Procurement Officer** - Create/edit plans, manage requests
- **Viewer** - Read-only access to reports
- **Auditor** - Read-only plus audit logs

### Modules
- **Dashboard** - Overview statistics and recent activities
- **Procurement Plans** - Quarterly planning (Q1-Q4)
- **Purchase Requests** - PR creation and approval workflow
- **Purchase Orders** - PO generation and tracking
- **Items Catalog** - Manage procurable items
- **Suppliers** - Supplier database
- **Departments** - Department management
- **User Management** - Add/edit users with roles
- **Reports** - Generate various reports

## Project Structure

```
procurement-app/
├── main.js                 # Electron main process
├── package.json            # Node.js dependencies
├── assets/                 # Icons and images
└── renderer/
    ├── index.html          # Main application UI
    ├── styles/
    │   └── main.css        # Application styles
    └── scripts/
        └── app.js          # Frontend JavaScript
```

## Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (comes with Node.js)

### Installation Steps

1. Open terminal in the `procurement-app` folder:
   ```bash
   cd "c:\Users\Teacher\Desktop\DMW FAD\procurement-app"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the application in development mode:
   ```bash
   npm start
   ```

### Build for Distribution

To create an executable (.exe) for distribution:

```bash
npm run dist
```

This will generate:
- `dist/procurement-plan-system Setup X.X.X.exe` - Installer
- `dist/procurement-plan-system X.X.X.exe` - Portable version

## Demo Mode

The application currently runs in **demo mode** without a backend:
- Select any role from the login dropdown
- Sample data is displayed statically
- Forms open but don't persist data

## Future Backend Integration

When connecting to the actual PostgreSQL database via API:

1. Configure `API_BASE_URL` in the app
2. The backend should run on the server machine
3. PostgreSQL accepts connections only from the backend (not directly from clients)
4. See the original planning document for database schema and role setup

## Architecture (Planned)

```
[Desktop App .exe] → [Backend API (Node.js/Express)] → [PostgreSQL]
     (Client)              (Server PC)                 (Server PC)
```

## Notes

- This is a static UI template for design/layout purposes
- Dynamic functionality requires backend API integration
- Role-based access control is simulated client-side for demo
