import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Divider, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTheme } from '@mui/material/styles';

const getDialogIcon = (action: string) => {
  if (action === 'approve') return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 48 }} />;
  if (action === 'reject') return <CancelIcon sx={{ color: 'error.main', fontSize: 48 }} />;
  return null;
};

interface ApprovalDialogProps {
  open: boolean;
  action: 'approve' | 'reject' | null;
  comment: string;
  onCommentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onConfirm: () => void;
  selectedConfig: any;
  onActionChange: (action: 'approve' | 'reject' ) => void;
}

const ApprovalDialog = ({
  open,
  action,
  comment,
  onCommentChange,
  onClose,
  onConfirm,
  selectedConfig,
  onActionChange
}: ApprovalDialogProps) => {
  const theme = useTheme();
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{
      sx: {
        borderRadius: 4,
        p: 1,
        background: theme.palette.background.paper,
        boxShadow: 8
      }
    }}>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: 22, color: theme.palette.text.primary }}>
        Take Action
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, mt: 1, justifyContent: 'center' }}>
          <Button
            variant={action === 'approve' ? 'contained' : 'outlined'}
            color="success"
            onClick={() => onActionChange('approve')}
            sx={{ 
              borderRadius: 2, 
              minWidth: 120, 
              fontWeight: 600, 
              textTransform: 'none',
              px: 3
            }}
          >
            Approve
          </Button>
          <Button
            variant={action === 'reject' ? 'contained' : 'outlined'}
            color="error"
            onClick={() => onActionChange('reject')}
            sx={{ 
              borderRadius: 2, 
              minWidth: 120, 
              fontWeight: 600, 
              textTransform: 'none',
              px: 3
            }}
          >
            Reject
          </Button>
        </Box>

        {action && (
          <>
            <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
              {getDialogIcon(action)}
            </Box>
            
            <Typography gutterBottom sx={{ color: theme.palette.text.secondary, textAlign: 'center', fontSize: 16 }}>
              {action === 'approve' && `Are you sure you want to approve "${selectedConfig?.name}"?`}
              {action === 'reject' && `Are you sure you want to reject "${selectedConfig?.name}"?`}
            </Typography>

            <TextField
              autoFocus
              margin="dense"
              label={action === 'approve' ? 'Approval Comment (optional)' : 'Rejection Reason (required)'}
              type="text"
              fullWidth
              multiline
              minRows={2}
              value={comment}
              onChange={onCommentChange}
              required={action === 'reject'}
              sx={{ mt: 2, background: theme.palette.background.default, borderRadius: 2 }}
              InputLabelProps={{ sx: { color: theme.palette.text.secondary } }}
            />
          </>
        )}
      </DialogContent>

      <Divider sx={{ my: 1, background: theme.palette.divider }} />
      
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center' }}>
        <Button 
          onClick={onClose} 
          color="inherit" 
          variant="outlined" 
          sx={{ borderRadius: 2, minWidth: 100, fontWeight: 600, textTransform: 'none' }}
        >
          Cancel
        </Button>
        {action && (
          <Button
            onClick={onConfirm}
            color={action === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={action === 'reject' && !comment}
            sx={{ borderRadius: 2, minWidth: 120, fontWeight: 700, ml: 2, textTransform: 'none' }}
          >
            Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalDialog;
