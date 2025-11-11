import { Box, Typography, Paper, Grid, Card, CardContent } from '@mui/material'
import { Link } from 'react-router-dom'
import PeopleIcon from '@mui/icons-material/People'
import { useEmployees } from '@/hooks/useEmployees'

export default function Dashboard() {
  const { employees, loading } = useEmployees()

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Employees</Typography>
              </Box>
              <Typography variant="h3">
                {loading ? '...' : employees.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <Link to="/employees" style={{ textDecoration: 'none' }}>
                  View all employees
                </Link>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Welcome to HR Management System
        </Typography>
        <Typography variant="body1">
          This is your central hub for managing employees and HRIS integrations.
        </Typography>
      </Paper>
    </Box>
  )
}

