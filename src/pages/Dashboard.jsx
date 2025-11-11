// Dashboard page
import React, { useState, useEffect } from 'react'
import {
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Paper
} from '@mui/material'
import { useAuth } from '../contexts/auth/firebase-context.jsx'
import { useSearchParams } from 'react-router-dom'
import IntegrationHRIS from '../sections/dashboard/admin/organization-settings/IntegrationModalContent/integrationHRIS.jsx'

function Dashboard() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [showHRISModal, setShowHRISModal] = useState(false)

  // Automatically show HRIS modal if code parameter is present (after Finch redirect)
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      setShowHRISModal(true)
    }
  }, [searchParams])

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Employee Management System
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Welcome to the Employee Management MVP
          </Typography>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            HRIS Integration
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Connect your HR system to import employee data automatically.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setShowHRISModal(true)}
          >
            Manage HRIS Integration
          </Button>
        </Paper>

        {showHRISModal && (
          <Paper sx={{ p: 3 }}>
            <IntegrationHRIS onClose={() => setShowHRISModal(false)} />
          </Paper>
        )}
      </Container>
    </>
  )
}

export default Dashboard

