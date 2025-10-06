import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Fade,
  ThemeProvider, 
  createTheme, 
  CssBaseline,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { Link } from 'react-router-dom';

// Import styles from separate styles file
import {
  PageContainer,
  PageHeader,
  DetailSection,
} from './ConfigurationApproval.styles';

import ConfigurationList from './parts/ConfigurationList';
import ConfigurationDetails from './parts/ConfigurationDetails';
import ApprovalDialog from './parts/ApprovalDialog';
import DeleteDialog from './parts/DeleteDialog';
import KanbanBoard from './parts/KanbanBoard';
import { configurationComment, SavedConfiguration } from '../configurator/sections/ConfigurationSummarySection';

type pageStage = 'Approval' | 'Kanban';

// Define the roles array
const roles = [
  'Team Owner',
  'Marketing Director',
  'Track Manager',
  'Sponsors',
  'NASCAR'
] as const;

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
    background: { default: '#f4f6fa', paper: '#fff' },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#ce93d8' },
    background: { default: '#121212', paper: '#1e1e1e' },
  },
});

const ConfigurationApproval: React.FC = () => {
  const [configurations, setConfigurations] = useState<SavedConfiguration[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<SavedConfiguration | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject'>('approve');
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState<pageStage>('Approval');
  const [loading, setLoading] = useState(true);
  // const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [selectedRole, setSelectedRole] = useState<typeof roles[number]>('Team Owner');
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const handleThemeToggle = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Load configurations from localStorage
  useEffect(() => {
    const fetchData = async () => {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 500));
      const savedConfigs = localStorage.getItem('savedConfigurations');
      if (savedConfigs) {
        setConfigurations(JSON.parse(savedConfigs));
      }
      setLoading(false);
    };
    
    fetchData();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleConfigSelect = (config: SavedConfiguration) => {
    setSelectedConfig(config);
  };

  const handleDeleteClick = (config: SavedConfiguration) => {
    setSelectedConfig(config);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleApprovalClose = () => {
    setApprovalDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!selectedConfig) return;

    const updatedConfigs = configurations.filter(config => config.id !== selectedConfig.id);
    localStorage.setItem('savedConfigurations', JSON.stringify(updatedConfigs));
    setConfigurations(updatedConfigs);
    setSelectedConfig(null);
    setDeleteDialogOpen(false);
  };

  const handleApprovalConfirm = () => {
    if (!selectedConfig) return;

    const updatedConfigs = configurations.map(config => {
      if (config.id === selectedConfig.id) {
        const newComment: configurationComment = {
          stage: selectedConfig.approvalStage || 'Team Owner',
          status: dialogAction === 'approve' ? 'approved' : 'rejected',
          comment,
          timestamp: Date.now(),
        };

        return {
          ...config,
          status: dialogAction === 'approve' ? 'approved' as const : 'rejected' as const,
          comments: [...config.comments || [], newComment],
        };
      }
      return config;
    });

    // Update localStorage
    localStorage.setItem('savedConfigurations', JSON.stringify(updatedConfigs));
    setConfigurations(updatedConfigs as SavedConfiguration[]);
    // Update selectedConfig to reflect the latest status/comment
    const updatedSelected = updatedConfigs.find(cfg => cfg.id === selectedConfig.id) || null;
    setSelectedConfig(updatedSelected);
    setApprovalDialogOpen(false);
  };

  const handleDeleteConfig = (id: string) => {
    const config = configurations.find(cfg => cfg.id === id);
    if (config) {
      handleDeleteClick(config);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PageContainer maxWidth="xl">
        <Fade in={true} timeout={800}>
          <Box>
            <PageHeader>
              <Box display="flex" alignItems="center">
                <Button 
                  component={Link} 
                  to="/configurator" 
                  startIcon={<ArrowBackIcon />}
                  variant="outlined"
                  size="large"
                  sx={{ 
                    mr: 2,
                    borderRadius: '12px',
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                    fontWeight: 600,
                    '&:hover': {
                      transform: 'translateX(-4px)'
                    }
                  }}
                >
                  Back to Configurator
                </Button>
                <Typography 
                  variant="h4" 
                  component="h1"
                  fontWeight="700"
                  sx={{
                    color: 'inherit',
                    letterSpacing: '-0.5px'
                  }}
                >
                  Configuration Approvals
                </Typography>
                <Button
                  onClick={handleThemeToggle}
                  sx={{ ml: 3, borderRadius: '50%', minWidth: 0, width: 40, height: 40 }}
                  color="inherit"
                  aria-label="Toggle light/dark mode"
                >
                  {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </Button>
              </Box>
              {page === 'Kanban' &&
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Your Role</InputLabel>
                  <Select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as typeof roles[number])}
                    label="Your Role"
                    size="small"
                  >
                    {roles.map((role) => (
                      <MenuItem key={role} value={role}>{role}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              }
            </PageHeader>

            {/* Tabs for Approval List and Kanban Board */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  sx={{ textTransform: 'none' }}
                  variant={page === 'Approval' ? 'contained' : 'outlined'}
                  onClick={() => setPage('Approval')}
                >
                  List
                </Button>
                <Button
                  sx={{ textTransform: 'none' }}
                  variant={page === 'Kanban' ? 'contained' : 'outlined'}
                  onClick={() => setPage('Kanban')}
                >
                  Board
                </Button>
              </Box>
            </Box>

            {/* Conditional rendering based on tab */}
            {page === 'Approval' ? (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, height: { md: 'calc(100vh - 160px)' } }}>
                <Box sx={{ width: { xs: '100%', md: '40%' }, height: { xs: 'auto', md: '100%' }, minWidth: { md: '320px' } }}>
                  <DetailSection sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                     <ConfigurationList
                      configurations={configurations}
                      selectedConfig={selectedConfig}
                      onSelect={handleConfigSelect}
                      onDelete={handleDeleteConfig}
                      tabValue={tabValue}
                      onTabChange={handleTabChange}
                      loading={loading}
                    />
                  </DetailSection>
                </Box>
                <Box sx={{ width: { xs: '100%', md: '60%' }, height: { xs: 'auto', md: '100%' } }}>
                    <ConfigurationDetails
                      selectedConfig={selectedConfig}
                      renderActionButtons={false}
                    />
                </Box>
              </Box>
            ) : (
              <KanbanBoard 
                configurations={configurations} 
                setConfigurations={setConfigurations} 
                loading={loading}
                selectedRole={selectedRole}
              />
            )}
          </Box>
        </Fade>
        <DeleteDialog
          open={deleteDialogOpen}
          onClose={handleDeleteClose}
          onConfirm={handleDeleteConfirm}
          selectedConfig={selectedConfig}
        />
        <ApprovalDialog
          open={approvalDialogOpen}
          action={dialogAction}
          comment={comment}
          onCommentChange={(e:React.ChangeEvent<HTMLInputElement>) => setComment(e.target.value)}
          onClose={handleApprovalClose}
          onConfirm={handleApprovalConfirm}
          selectedConfig={selectedConfig}
          onActionChange={(value) => setDialogAction(value || 'approve')}
        />
      </PageContainer>
    </ThemeProvider>
  );
};

export default ConfigurationApproval;