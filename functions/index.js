// Initialize Firebase Admin
import admin from 'firebase-admin'
admin.initializeApp()

// Firebase Cloud Functions entry point (base version)
import { runWith } from 'firebase-functions'
import { MAIN_REGION } from './consts/constants.js'
import app from './server.js'

const FUNCTION_DEFAULTS = {
  timeoutSeconds: 540,
  memory: '1GB'
}

// Export the Express app as a Cloud Function
export const api = runWith(FUNCTION_DEFAULTS)
  .region(MAIN_REGION)
  .https.onRequest(app)

