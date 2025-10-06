// ConfigurationApproval/ConfigurationApproval.styles.ts
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/system';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  TableContainer,
  ListItem,
  List,
  Tab,
  TableCell,
  TableRow
} from '@mui/material';

/**
 * Container for the entire page
 */
export const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
  },
}));

/**
 * Header section of the page
 */
export const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
  },
}));

/**
 * Color swatch component
 */
export const ColorSwatch = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'colorHex'
})<{ colorHex: string }>(({ colorHex }) => ({
  width: 45,
  height: 45,
  borderRadius: '50%',
  backgroundColor: colorHex || '#ccc',
  boxShadow: `0 4px 12px ${alpha('#000', 0.25)}`,
  border: colorHex === '#FFFFFF' || colorHex === '#FFF' || colorHex === '#ffffff' || colorHex === '#fff' 
    ? '1px solid #e0e0e0' 
    : 'none',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  '&:hover': {
    transform: 'scale(1.15)',
    boxShadow: `0 6px 16px ${alpha('#000', 0.3)}`,
  },
}));

/**
 * Section with details about configuration
 */
export const DetailSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  borderRadius: theme.shape.borderRadius * 1.5,
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  boxShadow: `0 12px 24px ${alpha('#000', 0.15)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
  '&:hover': {
    boxShadow: `0 16px 32px ${alpha('#000', 0.2)}`,
    transform: 'translateY(-4px)',
  },
}));

/**
 * Heading for each section
 */
export const SectionHeading = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(3),
  position: 'relative',
  paddingBottom: theme.spacing(1.5),
  color: theme.palette.text.primary,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '60px',
    height: '3px',
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    borderRadius: '2px',
  },
}));

/**
 * Container for action buttons
 */
export const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  justifyContent: 'flex-end',
  marginTop: theme.spacing(4),
  '& .MuiButton-root': {
    minWidth: '120px',
    borderRadius: theme.shape.borderRadius * 1.5,
    boxShadow: `0 4px 8px ${alpha('#000', 0.15)}`,
    fontWeight: 600,
    padding: theme.spacing(1, 3),
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 6px 12px ${alpha('#000', 0.2)}`,
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    width: '100%',
    '& > button': {
      width: '100%',
    },
  },
}));

/**
 * Card for configurations
 */
export const ConfigCard = styled(Paper)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: `0 8px 16px ${alpha('#000', 0.12)}`,
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  position: 'relative',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  '&:hover': {
    boxShadow: `0 16px 32px ${alpha('#000', 0.18)}`,
    transform: 'translateY(-6px)',
  },
}));

/**
 * Container for tables
 */
export const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: `0 6px 16px ${alpha('#000', 0.12)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  '& .MuiTableHead-root': {
    background: alpha(theme.palette.primary.main, 0.05),
    '& .MuiTableCell-head': {
      fontWeight: 700,
      color: theme.palette.text.secondary,
      letterSpacing: '0.5px',
      fontSize: '0.85rem',
      textTransform: 'capitalize',
    },
  },
  '& .MuiTableRow-root': {
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
    '&.selected': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
  },
  maxHeight: '500px',
  overflow: 'auto',
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&.selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    '& .MuiTableCell-root': {
      color: theme.palette.primary.main,
    },
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  }
}));

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(2),
  fontSize: '0.95rem',
}));

/**
 * Styled tab component
 */
export const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 600,
  transition: 'all 0.3s ease',
  padding: theme.spacing(1.5, 3),
  borderRadius: theme.shape.borderRadius,
  minHeight: '48px',
  textTransform: 'capitalize',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    color: theme.palette.primary.main,
  },
}));

export const TabsContainer = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  marginBottom: theme.spacing(3),
}));

/**
 * List component styling
 */
export const StyledList = styled(List)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  overflow: 'hidden',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  boxShadow: `0 4px 12px ${alpha('#000', 0.08)}`,
}));

/**
 * List item styling
 */
export const StyledListItem = styled(ListItem)(({ theme }) => ({
  transition: 'all 0.2s ease',
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    paddingLeft: theme.spacing(2.5),
  },
  '&:last-child': {
    borderBottom: 'none',
  },
}));

/**
 * Helper function to get color based on status
 */
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'pending':
    default:
      return 'warning';
  }
};

export const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  textAlign: 'center',
  color: alpha(theme.palette.text.primary, 0.7),
  '& svg': {
    fontSize: '3rem',
    marginBottom: theme.spacing(2),
    color: alpha(theme.palette.text.secondary, 0.4),
  },
}));

export const InfoBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: '16px',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  backgroundColor: alpha(theme.palette.info.main, 0.1),
  color: theme.palette.info.main,
  marginRight: theme.spacing(1),
}));
