import * as functions from 'firebase-functions'
import admin from 'firebase-admin'
import express from 'express'
import cors from 'cors'
import employeesRouter from './groups/employees.js'

// Initialize Firebase Admin
admin.initializeApp()

// Create Express app
const app = express()

// Middleware
app.use(cors({ origin: true }))
app.use(express.json())

// Routes
app.use('/employees', employeesRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Export the API
export const api = functions.https.onRequest(app)

