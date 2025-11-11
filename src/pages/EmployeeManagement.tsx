import { Box, Typography, Paper, CircularProgress } from '@mui/material'
import EmployeeTable from '@/components/EmployeeTable'
import { useEmployees } from '@/hooks/useEmployees'

export default function EmployeeManagement() {
  const { employees, loading, error } = useEmployees()

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Employee Management
      </Typography>
      
      <Paper sx={{ mt: 3, p: 3 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Typography color="error">{error}</Typography>
        )}
        
        {!loading && !error && (
          <EmployeeTable employees={employees} />
        )}
      </Paper>
    </Box>
  )
}

