import React from 'react'
import { Typography, Stack, Button, Box, CircularProgress } from '@mui/material'
import { Warning as WarningIcon } from '@mui/icons-material'

const DataSyncConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  isLoading = false
}) => {
  if (!open) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 1,
          p: 3,
          maxWidth: 600,
          width: '90%'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography variant="h6" gutterBottom>
          Enable Auto Data Sync
        </Typography>

        <Box sx={{ py: 2 }}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <WarningIcon color="warning" sx={{ mt: 0.5, flexShrink: 0 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Important Information About Data Sync
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Before enabling automatic data sync, please be aware of the
                  following points:
                </Typography>
              </Box>
            </Box>

            <Stack spacing={2} sx={{ ml: 5 }}>
              <Box>
                <Typography variant="subtitle2" color="error.main" gutterBottom>
                  Employee Deletion Policy
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Employees who are deleted or deactivated in your HR system will
                  be automatically removed from the platform, unless they are
                  currently participating in an ongoing review cycle or cycles
                  that are awaiting results.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="warning.main" gutterBottom>
                  Update Limitations During Active Cycles
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Employee information updates from your HR system will not be
                  reflected for users who are in review cycles that are currently
                  awaiting results. Changes will be applied once the cycle is
                  completed and after the next sync.
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : null}
          >
            {isLoading ? 'Processing...' : 'Enable Data Sync'}
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}

export default DataSyncConfirmationDialog

