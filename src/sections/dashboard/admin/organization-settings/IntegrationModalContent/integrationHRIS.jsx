// HRIS Integration UI (WITH connection check and data sync features from PR)
import React, { useState, useCallback } from 'react'
import {
  Stack,
  Button,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Box,
  Switch,
  FormControlLabel
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined'
import { useFinchConnect } from '/src/hooks/requests/use-finch-connect.jsx'
import { useGetRequest, Endpoints } from '/src/hooks/requests/use-get-request.jsx'
import { useToggleDataSync } from '/src/hooks/requests/use-toggle-data-sync.jsx'
import DataSyncConfirmationDialog from '../DataSyncConfirmationDialog.jsx'
import { INGESTION_MODES } from '../../../../../functions/shared/constants/integration-constants.js'

const IntegrationHRIS = ({ onClose }) => {
  const [modalState, setModalState] = useState({
    code: new URLSearchParams(window.location.search).get('code'),
    employees: null,
    selectedEmployees: null,
    mode: INGESTION_MODES.MERGE,
    isPreview: true,
    shouldFetchData: false
  })

  const [showDataSyncDialog, setShowDataSyncDialog] = useState(false)

  // Check connection when component mounts
  const {
    data: connectionData,
    isLoading: isCheckingConnection,
    isError: isConnectionError
  } = useGetRequest({
    endpoint: Endpoints.CHECK_CONNECTION,
    config: {
      refetchOnWindowFocus: false,
      suspense: false,
      // Only check connection if we don't have a code (new connection flow)
      enabled: !modalState?.code,
      onSuccess: (data) => {
        if (
          data.connectionExists &&
          !modalState?.employees &&
          !modalState?.code
        ) {
          // If connection exists and we haven't fetched data yet, automatically fetch data
          setModalState((prev) => ({
            ...prev,
            shouldFetchData: true
          }))
        }
      }
    }
  })

  // Fetch Finch data when we have a code OR when we have an existing connection
  const {
    isLoading: isLoadingFinchData,
    isError: isErrorFinchData,
    refetch: refetchFinchData,
    isRefetching: isRefetchingFinchData
  } = useGetRequest({
    endpoint: Endpoints.GET_FINCH_EMPLOYER_DATA,
    data: modalState?.code ? { code: modalState.code } : {},
    config: {
      onSuccess: (data) =>
        setModalState((prev) => ({
          ...prev,
          employees: data.employees,
          selectedEmployees: data.employees,
          availableColumns: [],
          mode: INGESTION_MODES.MERGE,
          isPreview: true,
          shouldFetchData: false
        })),
      // Only fetch if:
      // 1. We have a code from URL and haven't fetched employees yet, OR
      // 2. We explicitly set shouldFetchData=true after confirming connection exists
      enabled:
        (!!modalState?.code && !modalState?.employees) ||
        (modalState?.shouldFetchData === true &&
          connectionData?.connectionExists === true),
      refetchOnWindowFocus: false,
      suspense: false
    }
  })

  const {
    mutateAsync: openFinchConnect,
    isLoading: isConnectingFinch,
    isSuccess: isConnected
  } = useFinchConnect({ dataSync: false })

  const {
    mutateAsync: openFinchConnectForDataSync,
    isLoading: isConnectingForDataSync
  } = useFinchConnect({ dataSync: true })

  const {
    mutateAsync: toggleDataSync,
    isLoading: isTogglingDataSync
  } = useToggleDataSync()

  const handleFinchConnect = useCallback(async () => {
    try {
      await openFinchConnect()
    } catch (error) {
      console.error('Error connecting to Finch:', error)
    }
  }, [openFinchConnect])

  const handleDataSyncToggle = useCallback(async (event) => {
    const enabled = event.target.checked
    if (enabled) {
      setShowDataSyncDialog(true)
    } else {
      await toggleDataSync(false)
    }
  }, [toggleDataSync])

  const handleDataSyncConfirm = useCallback(async () => {
    try {
      // Check if connection exists
      if (connectionData?.connectionExists) {
        // If connection exists, just enable data sync
        await toggleDataSync(true)
        setShowDataSyncDialog(false)
      } else {
        // If no connection, need to connect first with dataSync flag
        await openFinchConnectForDataSync()
      }
    } catch (error) {
      console.error('Error enabling data sync:', error)
      setShowDataSyncDialog(false)
    }
  }, [connectionData, toggleDataSync, openFinchConnectForDataSync])

  return (
    <>
      {/* Loading state while checking connection (only when no code from URL) */}
      {!modalState?.code && isCheckingConnection && (
        <Stack spacing={2} alignItems="center" justifyContent="center" mt={4}>
          <Typography variant="subtitle2">
            Checking your HR system connection...
          </Typography>
          <CircularProgress />
        </Stack>
      )}

      {/* Connection check complete or not needed - show appropriate UI */}
      {(modalState?.code || !isCheckingConnection) && (
        <>
          {/* No connection exists or connection check failed - show connect button */}
          {((!modalState?.code &&
            (!connectionData?.connectionExists || isConnectionError)) ||
            isErrorFinchData) && (
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoOutlinedIcon color="info" />
                <Typography variant="body2" color="text.secondary">
                  {isConnectionError
                    ? 'There was an error checking your HR system connection. Please try connecting again.'
                    : isErrorFinchData
                    ? 'There was an error fetching your employee data from your HR system. Please try again.'
                    : 'Connect your HR system to upload your employee data to the platform. We support various HR systems including BambooHR, Workday, and more.'}
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
          )}

          {/* Loading state while fetching data from existing connection or with code */}
          {((connectionData?.connectionExists && modalState?.shouldFetchData) ||
            (modalState?.code && isLoadingFinchData) ||
            isRefetchingFinchData) &&
            !isErrorFinchData && (
              <Stack
                spacing={2}
                alignItems="center"
                justifyContent="center"
                mt={4}
              >
                <Typography variant="subtitle2">
                  Retrieving data from your HR system...
                </Typography>
                <CircularProgress />
              </Stack>
            )}

          {/* Data fetched successfully */}
          {!isLoadingFinchData &&
            !isRefetchingFinchData &&
            !modalState?.shouldFetchData &&
            !isErrorFinchData &&
            modalState?.employees?.length > 0 && (
              <Stack spacing={2}>
                <Alert severity="success">
                  <AlertTitle>Success!</AlertTitle>
                  Retrieved {modalState.employees.length} employees from your HR
                  system.
                </Alert>

                <Typography variant="body2" color="text.secondary">
                  These are the active employees that we found in your HR system.
                  You can now upload them into the system.
                </Typography>

                {/* Data Sync Toggle */}
                <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={false}
                        onChange={handleDataSyncToggle}
                        disabled={isTogglingDataSync || isConnectingForDataSync}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2">
                          Enable Automatic Data Sync
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Sync employee data from your HR system every Sunday at
                          midnight
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Sample Employees:
                  </Typography>
                  {modalState.employees.slice(0, 5).map((emp, idx) => (
                    <Typography key={idx} variant="body2">
                      • {emp.fullName} - {emp.email} - {emp.jobTitle || 'No title'}
                    </Typography>
                  ))}
                  {modalState.employees.length > 5 && (
                    <Typography variant="body2" color="text.secondary">
                      ... and {modalState.employees.length - 5} more
                    </Typography>
                  )}
                </Box>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={handleFinchConnect}
                    startIcon={<CachedOutlinedIcon />}
                    disabled={isConnectingFinch || isConnected}
                  >
                    Reconnect
                  </Button>
                  <Button variant="contained" onClick={onClose}>
                    Done
                  </Button>
                </Stack>
              </Stack>
            )}
        </>
      )}

      {/* Data Sync Confirmation Dialog */}
      <DataSyncConfirmationDialog
        open={showDataSyncDialog}
        onClose={() => setShowDataSyncDialog(false)}
        onConfirm={handleDataSyncConfirm}
        isLoading={isTogglingDataSync || isConnectingForDataSync}
      />
    </>
  )
}

export default IntegrationHRIS
