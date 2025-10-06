import { useState } from 'react';
import { Box, Typography, CircularProgress, Dialog, useMediaQuery } from '@mui/material';
import styled from '@emotion/styled';
import { alpha, Theme } from '@mui/material/styles';
import ConfigurationDetails from './ConfigurationDetails';
import ApprovalDialog from './ApprovalDialog';
import { configurationComment, SavedConfiguration } from '@/components/configurator/sections/ConfigurationSummarySection';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Button from '@mui/material/Button';
import { GiFullMotorcycleHelmet } from 'react-icons/gi';
import Tooltip from '@mui/material/Tooltip';

interface KanbanBoardProps {
  configurations: SavedConfiguration[];
  setConfigurations: (configs: SavedConfiguration[]) => void;
  loading: boolean;
  selectedRole: string;
}

const columns = [
  'Team Owner',
  'Marketing Director',
  'Track Manager',
  'Sponsors',
  'NASCAR'
] as const;

const StyledKanbanColumn = styled(Box)<{ theme?: Theme; columnType?: string }>(({ theme, columnType }) => {
  const getColumnColor = () => {
    switch (columnType) {
      case 'Team Owner':
        return 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)'; // Gold gradient
      case 'Marketing Director':
        return 'linear-gradient(180deg, #E31837 0%, #B31326 100%)'; // NASCAR Red
      case 'Track Manager':
        return 'linear-gradient(180deg, #0F52BA 0%, #0033A0 100%)'; // NASCAR Blue
      case 'Sponsors':
        return 'linear-gradient(180deg, #000000 0%, #242424 100%)'; // NASCAR Black
      case 'NASCAR':
        return 'linear-gradient(180deg, #FDB913 0%, #F7931E 100%)'; // NASCAR Yellow/Orange
      default:
        return 'linear-gradient(180deg, #1A1A1A 0%, #000000 100%)';
    }
  };

  return {
    flex: 1,
    backgroundColor: theme ? theme.palette.background.paper : '#fff',
    borderRadius: 12,
    padding: 16,
    boxShadow: theme ? theme.shadows[2] : '0 4px 16px rgba(0,0,0,0.10)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    height: '100%',
    minHeight: 0,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: getColumnColor(),
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: getColumnColor(),
      opacity: 0.05,
      pointerEvents: 'none',
    }
  };
});

const KanbanColumnScroll = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  minHeight: 0,
  height: '100%',
  paddingRight: 2,
  '::-webkit-scrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none',
});

const ConfigCard = styled(Box)<{ theme?: Theme }>(({ theme }) => ({
  backgroundColor: theme ? theme.palette.background.default : '#f7f7f7',
  borderRadius: 8,
  padding: 16,
  marginBottom: 10,
  boxShadow: theme ? theme.shadows[1] : '0 2px 8px rgba(0,0,0,0.08)',
  transition: 'box-shadow 0.12s',
  '&:hover': {
    boxShadow: theme ? theme.shadows[2] : '0 4px 12px rgba(0,0,0,0.10)',
    backgroundColor: theme ? theme.palette.background.default : '#f7f7f7',
  },
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
}));

const stringToColor = (string: string): string => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

const KanbanBoard = ({ configurations, setConfigurations, loading, selectedRole }: KanbanBoardProps) => {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsConfig, setDetailsConfig] = useState<SavedConfiguration | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject'>('approve');
  const [actionComment, setActionComment] = useState('');
  const fullScreen = useMediaQuery('(max-width:600px)');

  const handleApprove = (configId: string) => {
    const updatedConfigs: SavedConfiguration[] = configurations.map(config => {
      if (config.id === configId) {
        const currentIndex = columns.indexOf(config.approvalStage || 'Team Owner');
        const nextStage = columns[currentIndex + 1];
        const newComment: configurationComment = {
          stage: config.approvalStage || 'Team Owner',
          status: 'approved' as const,
          comment: actionComment,
          timestamp: Date.now(),
        };
        return {
          ...config,
          approvalStage: nextStage || config.approvalStage,
          status: nextStage ? 'pending' : 'approved',
          comments: [...(config.comments || []), newComment],
        };
      }
      return config;
    });

    setConfigurations(updatedConfigs);
    localStorage.setItem('savedConfigurations', JSON.stringify(updatedConfigs));
  };

  const handleReject = (configId: string) => {
    const updatedConfigs: SavedConfiguration[] = configurations.map(config => {
      if (config.id === configId) {
        const newComment: configurationComment = {
          stage: config.approvalStage || 'Team Owner',
          status: 'rejected' as const,
          comment: actionComment,
          timestamp: Date.now(),
        };

        const currentIndex = columns.indexOf(config.approvalStage || 'Team Owner');
        const prevStage = columns[currentIndex - 1] || columns[0];
        const isRejected = currentIndex === 0;
        return {
          ...config,
          approvalStage: prevStage,
          status: isRejected ? 'rejected' : 'pending',
          comments: [...(config.comments || []), newComment],
        };
      }
      return config;
    });

    setConfigurations(updatedConfigs);
    localStorage.setItem('savedConfigurations', JSON.stringify(updatedConfigs));
  };

  const handleActionConfirm = () => {
    if (!detailsConfig || !selectedAction) return;

    if (selectedAction === 'approve') {
      handleApprove(detailsConfig.id);
    } else {
      handleReject(detailsConfig.id);
    }

    setApprovalDialogOpen(false);
    setActionComment('');
    setSelectedAction('approve');
  };

  const getColumnConfigs = (column: string) => {
    return configurations.filter(config => 
      (config.approvalStage || 'Team Owner') === column && config.status === 'pending'
    );
  };

  const canApprove = (config: SavedConfiguration) => {
    return selectedRole === (config.approvalStage || 'Team Owner');
  };

  return (
    <Box sx={{ width: '100%', height: '80vh', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', height: '100%', gap: 3, overflowX: 'auto', pb: 2 }}>
          {columns.map((col) => (
            <StyledKanbanColumn key={col} columnType={col}>
              <Typography variant="subtitle1" fontWeight={700} mb={1} align="center" sx={{ pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>{col}</Typography>
              <KanbanColumnScroll>
                {getColumnConfigs(col).map((config) => (
                  <ConfigCard key={config.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                        {config.name}
                      </Typography>
                      <Tooltip title="View Details" arrow>
                        <Button
                          size="small"
                          onClick={() => {
                            setDetailsConfig(config);
                            setDetailsDialogOpen(true);
                          }}
                        >
                          <MoreVertIcon />
                        </Button>
                      </Tooltip>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 44 }}>
                          Team:
                        </Typography>
                        {config.team?.manufacturer?.logo && (
                          <img
                            src={config.team.manufacturer.logo}
                            alt={config.team.manufacturer.name}
                            title={config.team.manufacturer.name}
                            style={{ width: 20, height: 20, objectFit: 'contain', borderRadius: 3, marginRight: 4, border: '1px solid #eee', background: '#fff' }}
                          />
                        )}
                        <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ flex: 1, wordBreak: 'break-word' }}>
                          {config.team?.name || 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 44 }}>
                          Driver:
                        </Typography>
                        {/* Driver avatar icon with first letter of name and surname and color */}
                        {config.driver?.name ? (
                            <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              background: stringToColor(config.driver.name),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 500,
                              color: '#fff',
                              fontSize: 10,
                              boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                              pt: 0.3, // to make the text centered
                              textTransform: 'uppercase',
                            }}
                            title={config.driver.name}
                            >
                            {config.driver.name
                              .split(' ')
                              .map((part) => part.charAt(0))
                              .slice(0, 2)
                              .join('')}
                            </Box>
                        ) : (
                          <GiFullMotorcycleHelmet style={{ fontSize: 24, marginRight: 8, color: '#888' }} />
                        )}
                        <Typography variant="caption" fontWeight={600} color="text.primary" sx={{ flex: 1, wordBreak: 'break-word' }}>
                          {config.driver?.name || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Status:
                      </Typography>
                      <Box component="span" sx={{
                        display: 'inline-block',
                        px: 1.2,
                        py: 0.2,
                        borderRadius: 2,
                        fontSize: 12,
                        fontWeight: 600,
                        color: config.status === 'approved' ? '#388e3c' : '#fbc02d',
                        backgroundColor: config.status === 'approved' ? alpha('#388e3c', 0.12) : alpha('#fbc02d', 0.12),
                      }}>
                        {config.status.charAt(0).toUpperCase() + config.status.slice(1)}
                      </Box>
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {new Date(config.timestamp).toLocaleString()}
                    </Typography>
                    {canApprove(config) && (
                          <Button
                            sx={{ textTransform: 'none' }}
                            variant="contained"
                            size="small"
                            color="primary"
                            onClick={() => {
                              setDetailsConfig(config);
                              setApprovalDialogOpen(true);
                            }}
                          >
                            Take Action
                          </Button>
                        )}
                  </ConfigCard>
                ))}
                {getColumnConfigs(col).length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>No items</Typography>
                )}
              </KanbanColumnScroll>
            </StyledKanbanColumn>
          ))}
        </Box>
      )}

      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        fullScreen={fullScreen}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'none',
            boxShadow: 'none',
            borderRadius: 3,
            overflow: 'visible',
          }
        }}
      >
        <ConfigurationDetails
          selectedConfig={detailsConfig}
          onCloseDialog={() => setDetailsDialogOpen(false)}
          isKanbanView={true}
          userRole={selectedRole}
          onTakeAction={() => {
            setDetailsDialogOpen(false);
            setApprovalDialogOpen(true);
            setSelectedAction('approve');
            setActionComment('');
          }}
        />
      </Dialog>
      <ApprovalDialog
        open={approvalDialogOpen}
        action={selectedAction}
        comment={actionComment}
        onCommentChange={(e) => setActionComment(e.target.value)}
        onActionChange={(value) => setSelectedAction(value)}
        onClose={() => {
          setApprovalDialogOpen(false);
          setSelectedAction('approve');
          setActionComment('');
        }}
        onConfirm={handleActionConfirm}
        selectedConfig={detailsConfig}
      />
    </Box>
  );
};

export default KanbanBoard;
