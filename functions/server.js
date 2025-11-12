// Express server for Cloud Functions (base version)
import express from 'express'
import cors from 'cors'
import { validateRequest } from './middlewares/validators.js'

const app = express()

// CORS Configuration - must be before other middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Handle preflight requests
app.options('*', cors())

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
  getFinchEmployerData,
  checkConnection,
  toggleDataSync
} from './groups/hris.js'

app.post('/createFinchConnectSession', createFinchConnectSession)
app.post('/getFinchEmployerData', getFinchEmployerData)
app.post('/checkConnection', checkConnection)
app.post('/toggleDataSync', toggleDataSync)

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

