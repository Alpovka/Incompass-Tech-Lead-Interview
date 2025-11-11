// Express server for Cloud Functions (base version)
import express from 'express'
import { validateRequest } from './middlewares/validators.js'

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Mock authentication middleware
app.use((req, res, next) => {
  req.user = {
    uid: 'mock-user-id',
    email: 'admin@example.com',
    company: 'mock-company-id',
    role: 'admin'
  }
  next()
})

// Apply validation middleware
app.use(validateRequest)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// ----- HRIS ENDPOINTS -----
import {
  createFinchConnectSession,
  getFinchEmployerData
} from './groups/hris.js'

app.post('/createFinchConnectSession', createFinchConnectSession)
app.post('/getFinchEmployerData', getFinchEmployerData)

// ----- OTHER ENDPOINTS -----
// Mock getUser endpoint
app.post('/getUser', (req, res) => {
  res.json({
    uid: req.user.uid,
    email: req.user.email,
    displayName: 'Mock User',
    role: req.user.role,
    company: req.user.company,
    status: 'active',
    features: {
      finchIntegration: true,
      dataIngestion: true
    },
    permissions: {}
  })
})

// Mock ingestEmployeeData endpoint
app.post('/ingestEmployeeData', (req, res) => {
  res.json({
    success: true,
    message: 'Employees ingested successfully'
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ error: err.message })
})

export default app

