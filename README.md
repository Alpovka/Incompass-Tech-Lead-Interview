# Employee Management MVP with Finch HRIS Integration

This is a simplified employee management system built as an MVP for demonstrating Finch API integration for HRIS (Human Resources Information System) data sync.

## Overview

This project is structured as a monorepo containing:

- **Backend**: Firebase Cloud Functions (Node.js) with Express
- **Frontend**: React app with Vite and Material-UI
- **HRIS Integration**: Finch API for connecting to various HR systems

## Branch Structure

- **`main`**: Base working system with manual Finch connection and one-time employee import
- **`finch-data-sync`**: Pull Request branch adding automatic data sync functionality

The `finch-data-sync` branch contains PR #1530 which adds:

- Automatic weekly data sync from HRIS providers
- Access token storage using Firestore (mimicking Secret Manager for local development)
- Connection status checking
- Toggle for enabling/disabling auto sync
- Scheduled Cloud Function for automated updates

## Prerequisites

- Node.js 18+ (https://nodejs.org/)
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)

**Note**: This project runs entirely on Firebase emulators. No Firebase account or login is required!

## Installation

### 1. Install Dependencies

```bash
# Install all dependencies (root and functions)
npm run install:all

# Or install separately:
npm install
cd functions && npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the `functions` directory:

```bash
cd functions
cp env.example .env.local
```

The project is pre-configured to work with Finch's sandbox mode, so no API credentials are needed for testing. The default values in `env.example` will work out of the box.

If you want to use your own Finch credentials, edit `.env.local`:

```bash
FINCH_CLIENT_ID=your_finch_client_id
FINCH_CLIENT_SECRET=your_finch_client_secret
PROJECT_ID=employee-management-mvp
BASE_URL=http://localhost:5000
```

## Local Development Architecture

### Mock Secret Manager

Since this project runs entirely on Firebase emulators, we use **Firestore as a mock Secret Manager**. Instead of using Google Cloud Secret Manager (which requires GCP authentication), secrets are stored in a Firestore collection called `secrets`.

**Implementation Details**:

- Secrets are stored in Firestore with document IDs like `access_tokens_{companyId}`
- The `secret_manager_functions.js` provides `getSecret()`, `createSecret()`, and `listSecrets()` functions that mimic the Secret Manager API
- Error codes match Secret Manager behavior (e.g., error code 5 for NOT_FOUND)
- In production, this would be replaced with actual Google Cloud Secret Manager

**Benefits**:

- No GCP authentication required for local development
- Works seamlessly with Firebase emulators
- Same API interface as Secret Manager for easy production migration
- Visible in Firestore Emulator UI at http://localhost:4000/firestore for debugging
- Can inspect and modify secrets directly in the emulator UI

## Running Locally

### Start Firebase Emulators

```bash
# From the root directory
firebase emulators:start
```

This will start:

- Functions emulator on http://localhost:5001
- Firestore emulator on http://localhost:8080
- Hosting emulator on http://localhost:5002
- Emulator UI dashboard on http://localhost:4000

### Start Frontend Development Server

In a new terminal:

```bash
npm run dev
```

This will start the Vite dev server on http://localhost:3000

## Usage

### Main Branch - Manual HRIS Connection

1. Navigate to http://localhost:3000
2. Click "Manage HRIS Integration"
3. Click "Connect your HR System"
4. You'll be redirected to Finch Connect flow
5. Select an HR provider (use sandbox mode for testing)
6. Login with test credentials (e.g., for sandbox: `good_user` / `good_pass`)
7. Employee data will be fetched and displayed
8. Connection is disconnected after data fetch

### Finch-Data-Sync Branch - Auto Sync Features

After switching to the `finch-data-sync` branch:

1. Same initial connection flow as above
2. Access tokens are now stored securely in Firestore (using a `secrets` collection that mimics Secret Manager behavior)
3. Connection persists and can be reused
4. New "Enable Auto Data Sync" toggle available
5. When enabled, a weekly Cloud Function automatically syncs employee data
6. Data sync runs every Sunday at midnight (configurable in code)

## Project Structure

```
/
├── functions/               # Firebase Cloud Functions (Backend)
│   ├── common/schemas/      # Request validation schemas
│   ├── consts/              # Constants
│   ├── groups/              # Endpoint handlers
│   │   ├── helpers/         # Helper functions
│   │   ├── hris.js          # HRIS endpoints
│   │   ├── ingest-users.js  # Employee ingestion logic
│   │   └── other.js         # Other endpoints
│   ├── middlewares/         # Express middlewares
│   ├── shared/              # Shared utilities and schemas
│   ├── server.js            # Express app
│   ├── index.js             # Cloud Functions exports
│   └── package.json         # Backend dependencies
│
├── src/                     # React Frontend
│   ├── components/          # Reusable UI components
│   ├── contexts/            # React contexts (Auth, etc.)
│   ├── data/repos/          # API repositories
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   ├── sections/            # Feature sections
│   ├── constants/           # Frontend constants
│   ├── App.jsx              # Main App component
│   └── main.jsx             # Entry point
│
├── public/                  # Static assets
├── firebase.json            # Firebase configuration
├── vite.config.js           # Vite configuration
├── package.json             # Frontend dependencies
└── README.md                # This file
```

## Testing with Finch Sandbox

Finch provides a sandbox environment for testing. Use these test credentials:

**Provider**: Any (Finch Sandbox will simulate any provider)

**Test Credentials**:

- Username: `good_user`
- Password: `good_pass`

More test scenarios available at: https://developer.tryfinch.com/implementation-guide/Test/Finch-Sandbox

## Code Review Task

For technical interview candidates:

This codebase is set up for reviewing PR #1530 on the `finch-data-sync` branch. The PR adds automatic data synchronization features to the HRIS integration.

### Review Focus Areas

1. **Backend Architecture**: Cloud Functions structure, error handling, async operations
2. **Security**: Access token storage, secret management, authentication flows
3. **Data Integrity**: Employee data sync logic, handling of users in active review cycles
4. **API Design**: Endpoint structure, request/response validation
5. **Scheduled Jobs**: Weekly sync implementation, error handling, retries
6. **Code Quality**: Naming conventions, comments, maintainability

### Key Files to Review

**Backend**:

- `functions/groups/hris.js` - Main HRIS endpoint changes
- `functions/groups/helpers/secret_manager_functions.js` - Firestore-based secret storage (mimics Secret Manager)
- `functions/groups/other.js` - New scheduled sync function
- `functions/groups/helpers/hris_functions.js` - New getFinchData function
- `functions/groups/helpers/ingestion_functions.js` - Modified evaluation checks

**Frontend**:

- `src/sections/dashboard/admin/organization-settings/IntegrationModalContent/integrationHRIS.jsx` - UI changes
- `src/hooks/requests/use-toggle-data-sync.jsx` - New hook
- `src/sections/dashboard/admin/organization-settings/DataSyncConfirmationDialog.jsx` - New component

## Tech Stack

- **Backend**: Node.js 18, Express, Firebase Functions, Finch SDK
- **Frontend**: React 18, Vite, Material-UI, React Query, React Router
- **Cloud Services**: Google Cloud Functions, Firestore (also used as mock Secret Manager)
- **HRIS Integration**: Finch API

## License

Proprietary - Incompass Labs

## Support

For questions about this codebase, contact the Incompass Labs technical team.
