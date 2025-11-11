// HRIS Integration UI (base version WITHOUT connection check and data sync features)
import React, { useState, useCallback, useEffect } from 'react'
import {
  Stack,
  Button,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useFinchConnect } from '/src/hooks/requests/use-finch-connect.jsx'
import { useGetRequest, Endpoints } from '/src/hooks/requests/use-get-request.jsx'
import { INGESTION_MODES } from '../../../../../../functions/shared/constants/integration-constants.js'
import { useSearchParams } from 'react-router-dom'

const IntegrationHRIS = ({ onClose }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalState, setModalState] = useState({
    code: null,
    employees: null,
    selectedEmployees: null,
    mode: INGESTION_MODES.MERGE,
    isPreview: true
  })

  // Extract code from URL parameters when component mounts or URL changes
  useEffect(() => {
    const code = searchParams.get('code')
    if (code && !modalState.code) {
      setModalState((prev) => ({ ...prev, code }))
      // Clean up URL
      searchParams.delete('code')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, modalState.code])

  // Base version - fetches data using code from URL only
  const { isLoading: isLoadingFinchData, isError: isErrorFinchData } =
    useGetRequest({
      endpoint: Endpoints.GET_FINCH_EMPLOYER_DATA,
      data: {
        code: modalState?.code
      },
      config: {
        onSuccess: (data) =>
          setModalState((prev) => ({
            ...prev,
            employees: data.employees,
            selectedEmployees: data.employees,
            mode: INGESTION_MODES.MERGE,
            isPreview: true
          })),
        enabled: !!modalState?.code && !modalState?.employees,
        refetchOnWindowFocus: false,
        suspense: false
      }
    })

  const {
    mutateAsync: openFinchConnect,
    isLoading: isConnectingFinch,
    isSuccess: isConnected
  } = useFinchConnect()

  const handleFinchConnect = useCallback(async () => {
    try {
      await openFinchConnect()
    } catch (error) {
      console.error('Error connecting to Finch:', error)
    }
  }, [openFinchConnect])

  return (
    <>
      {/* Base version - simple connect button when no code */}
      {!modalState?.code ? (
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoOutlinedIcon color="info" />
            <Typography variant="body2" color="text.secondary">
              Connect your HR system to upload your employee data to the platform. 
              We support various HR systems including BambooHR, Workday, and more.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={handleFinchConnect}
            disabled={isConnectingFinch || isConnected}
          >
            {isConnectingFinch
              ? 'Connecting...'
              : isConnected
              ? 'Redirecting...'
              : 'Connect your HR System'}
          </Button>
        </Stack>
      ) : null}

      {/* Loading state when fetching data */}
      {modalState?.code && isLoadingFinchData && !isErrorFinchData ? (
        <Stack spacing={2} alignItems="center" justifyContent="center" mt={4}>
          <Typography variant="subtitle2">
            Retrieving data from your HR system...
          </Typography>
          <CircularProgress />
        </Stack>
      ) : null}

      {/* Error state */}
      {isErrorFinchData ? (
        <Stack spacing={2}>
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            There was an error fetching your employee data from your HR system. 
            Please try again.
          </Alert>
          <Button
            variant="contained"
            onClick={handleFinchConnect}
            disabled={isConnectingFinch || isConnected}
          >
            {isConnectingFinch
              ? 'Connecting...'
              : isConnected
              ? 'Redirecting...'
              : 'Try Again'}
          </Button>
        </Stack>
      ) : null}

      {/* No employees found */}
      {!isErrorFinchData && 
       modalState?.employees?.length === 0 && 
       !isLoadingFinchData ? (
        <Stack spacing={2}>
          <Alert severity="warning">
            <AlertTitle>No Employees Found</AlertTitle>
            We couldn't find any active employees in your HR system. 
            Please check your HR system and try again.
          </Alert>
          <Button
            variant="contained"
            onClick={handleFinchConnect}
            disabled={isConnectingFinch || isConnected}
          >
            {isConnectingFinch
              ? 'Connecting...'
              : isConnected
              ? 'Redirecting...'
              : 'Try Again'}
          </Button>
        </Stack>
      ) : null}

      {/* Success state - show employee data in table */}
      {!isErrorFinchData && modalState?.employees?.length > 0 ? (
        <Stack spacing={3}>
          <Alert severity="success" icon={<CheckCircleIcon />}>
            <AlertTitle>Connection Successful!</AlertTitle>
            Retrieved {modalState.employees.length} active employees from your HR system.
          </Alert>

          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Employee Data Preview
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              These are the active employees found in your HR system. The data will be available 
              for use in the platform.
            </Typography>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell><strong>Full Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Job Title</strong></TableCell>
                  <TableCell><strong>Manager</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {modalState.employees.slice(0, 10).map((employee, idx) => (
                  <TableRow 
                    key={idx}
                    sx={{ '&:hover': { bgcolor: 'grey.50' } }}
                  >
                    <TableCell>{employee.fullName || '-'}</TableCell>
                    <TableCell>{employee.email || '-'}</TableCell>
                    <TableCell>{employee.jobTitle || '-'}</TableCell>
                    <TableCell>{employee.manager || '-'}</TableCell>
                    <TableCell>
                      {employee.location ? (
                        <Chip 
                          label={employee.location} 
                          size="small" 
                          variant="outlined"
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {modalState.employees.length > 10 && (
            <Typography variant="body2" color="text.secondary" align="center">
              Showing 10 of {modalState.employees.length} employees
            </Typography>
          )}

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleFinchConnect}>
              Connect Another System
            </Button>
            <Button variant="contained" onClick={onClose}>
              Done
            </Button>
          </Stack>
        </Stack>
      ) : null}
    </>
  )
}

export default IntegrationHRIS

