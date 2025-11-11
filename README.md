# HR Management System

A modern HR management system with HRIS integration capabilities.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Material-UI
- **Backend**: Firebase Cloud Functions (Node.js)
- **Database**: Firebase Firestore
- **HRIS Integration**: Finch API

## Project Structure

```
.
├── src/                  # Frontend source code
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript type definitions
│   └── firebase/        # Firebase configuration
├── functions/           # Firebase Cloud Functions
│   ├── groups/         # Grouped function endpoints
│   ├── common/         # Shared utilities
│   └── helpers/        # Helper functions
└── public/             # Static assets

```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

1. Install frontend dependencies:
```bash
npm install
```

2. Install backend dependencies:
```bash
cd functions
npm install
cd ..
```

3. Set up Firebase configuration:
```bash
firebase login
firebase init
```

4. Create a `.env` file in the root directory with your Firebase config:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Development

1. Start the frontend development server:
```bash
npm run dev
```

2. Start the Firebase emulators:
```bash
firebase emulators:start
```

The frontend will be available at `http://localhost:3000`

## Features

- Employee management
- HRIS integration via Finch API
- Automatic data synchronization
- Employee directory
- Integration settings

## License

Copyright © 2025 Incompass Labs

