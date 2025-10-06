import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import { SavedConfiguration } from '@/components/configurator/sections/ConfigurationSummarySection';

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedConfig: SavedConfiguration | null;
}

const DeleteDialog = ({
  open,
  onClose,
  onConfirm,
  selectedConfig,
}: DeleteDialogProps) => {
  const theme = useTheme();
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth 
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1,
          background: theme.palette.background.paper,
          boxShadow: 8
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: 22, color: theme.palette.text.primary }}>
        Delete Configuration
      </DialogTitle>
      
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <DeleteIcon sx={{ color: theme.palette.error.main, fontSize: 48, mb: 2 }} />
        </Box>
        
        <Typography gutterBottom sx={{ color: theme.palette.text.secondary, textAlign: 'center', fontSize: 16 }}>
          Are you sure you want to delete "{selectedConfig?.name}"? This action cannot be undone.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'center' }}>
        <Button 
          onClick={onClose} 
          color="inherit" 
          variant="outlined" 
          sx={{ borderRadius: 2, minWidth: 100, fontWeight: 600, textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          sx={{ borderRadius: 2, minWidth: 120, fontWeight: 700, ml: 2, textTransform: 'none' }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;