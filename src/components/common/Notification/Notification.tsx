import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert, Slide } from '@mui/material';
import { RootState } from '@/store';
import { hideNotification } from '@/store/actions/notificationSlice';

const Notification = () => {
  const dispatch = useDispatch();
  const { open, message, severity, autoHideDuration } = useSelector(
    (state: RootState) => state.notification
  );

  const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    dispatch(hideNotification());
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      slots={{ transition: Slide }}
    >
      <Alert 
        onClose={handleClose} 
        severity={severity} 
        variant="filled"
        sx={{ 
          borderRadius: 1,
          color: '#ffffff'
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;