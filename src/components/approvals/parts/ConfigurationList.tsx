import { Box, Typography, Tabs, Badge, CircularProgress, Tooltip, IconButton, Avatar, Chip, Table, TableBody, TableHead, TableRow } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import LayersIcon from '@mui/icons-material/Layers';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import {
  SectionHeading,
  TabsContainer,
  StyledTab,
  StyledTableContainer,
  StyledTableRow,
  StyledTableCell,
  EmptyState,
  getStatusColor
} from '../ConfigurationApproval.styles';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />;
    case 'rejected':
      return <CancelIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />;
    case 'pending':
    default:
      return <ScheduleIcon color="warning" fontSize="small" sx={{ mr: 0.5 }} />;
  }
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

interface ConfigurationListProps {
  configurations: any[];
  selectedConfig: any;
  onSelect: (config: any) => void;
  onDelete: (id: string) => void;
  tabValue: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  loading: boolean;
}

const ConfigurationList = ({
  configurations,
  selectedConfig,
  onSelect,
  onDelete,
  tabValue,
  onTabChange,
  loading
}: ConfigurationListProps) => {
  // Filter configurations based on tab value
  const filteredConfigs = configurations.filter((config: any) => {
    if (tabValue === 0) return true;
    if (tabValue === 1) return config.status === 'pending';
    if (tabValue === 2) return config.status === 'approved';
    if (tabValue === 3) return config.status === 'rejected';
    return true;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <SectionHeading variant="h6">
        <DashboardCustomizeIcon color="primary" />
        Configuration List
      </SectionHeading>
      <TabsContainer>
        <Tabs value={tabValue} onChange={onTabChange} variant="scrollable" scrollButtons="auto">
          <StyledTab label="All" />
          <StyledTab label={<Badge badgeContent={configurations.filter((c: any) => c.status === 'pending').length} color="warning">Pending</Badge>} />
          <StyledTab label={<Badge badgeContent={configurations.filter((c: any) => c.status === 'approved').length} color="success">Approved</Badge>} />
          <StyledTab label={<Badge badgeContent={configurations.filter((c: any) => c.status === 'rejected').length} color="error">Rejected</Badge>} />
        </Tabs>
      </TabsContainer>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
        </Box>
      ) : filteredConfigs.length === 0 ? (
        <EmptyState>
          <LayersIcon />
          <Typography variant="h6" gutterBottom>No configurations found</Typography>
          <Typography variant="body2">
            {tabValue === 0
              ? "You haven't saved any configurations yet."
              : tabValue === 1
                ? "No pending configurations found."
                : tabValue === 2
                  ? "No approved configurations found."
                  : "No rejected configurations found."}
          </Typography>
        </EmptyState>
      ) : (
        <StyledTableContainer sx={{ flex: 1 }}>
          <Table size="medium" stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Date</StyledTableCell>
                <StyledTableCell>Status / Stage</StyledTableCell>
                <StyledTableCell align="right">Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredConfigs.map((config: any) => (
                <StyledTableRow
                  key={config.id}
                  onClick={() => onSelect(config)}
                  className={selectedConfig?.id === config.id ? 'selected' : ''}
                  hover
                >
                  <StyledTableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 32, height: 32, mr: 1.5 }}>{config.name.charAt(0).toUpperCase()}</Avatar>
                      <Typography variant="body2" fontWeight={selectedConfig?.id === config.id ? 600 : 400}>{config.name}</Typography>
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Typography variant="body2" color="textSecondary">{formatDate(config.timestamp)}</Typography>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={0.5} width="100%">
                      <Tooltip title={config.status.charAt(0).toUpperCase() + config.status.slice(1)} placement="top">
                        <span>
                          <Chip
                            icon={getStatusIcon(config.status)}
                            label={config.status.charAt(0).toUpperCase() + config.status.slice(1)}
                            color={getStatusColor(config.status)}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, mb: 0.25 }}
                          />
                        </span>
                      </Tooltip>
                      <Tooltip title={config.approvalStage || 'No stage'} placement="bottom">
                        <span>
                          <Chip
                            label={config.approvalStage || '—'}
                            color="default"
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.72rem', height: 22, bgcolor: 'background.paper', opacity: 0.85, fontWeight: 500 }}
                          />
                        </span>
                      </Tooltip>
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={e => {
                          e.stopPropagation();
                          onDelete(config.id);
                        }}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}
    </Box>
  );
};

export default ConfigurationList;
