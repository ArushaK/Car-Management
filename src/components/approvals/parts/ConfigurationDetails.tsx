import React, { useState } from 'react';
import { Box, Typography, Avatar, Chip, Divider, Button, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LayersIcon from '@mui/icons-material/Layers';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PreviewIcon from '@mui/icons-material/Visibility';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { alpha, useTheme } from '@mui/material/styles';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';
import {
  DetailSection,
  SectionHeading,
  ActionButtonsContainer,
  ColorSwatch,
  StyledTableCell,
  EmptyState,
  getStatusColor
} from '../ConfigurationApproval.styles';
import { parseDecalName } from '@utils/helpers/decalHelpers';
import { SavedConfiguration } from '@/components/configurator/sections/ConfigurationSummarySection';
import CarPreviewDialog from './CarPreviewDialog';

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

interface ConfigurationDetailsProps {
  selectedConfig: SavedConfiguration | null;
  onCloseDialog?: () => void;
  renderActionButtons?: boolean;
  isKanbanView?: boolean;
  userRole?: string;
  onTakeAction?: () => void;
}

const ConfigurationDetails = ({
  selectedConfig,
  renderActionButtons = true,
  isKanbanView = false,
  userRole = '', 
  onTakeAction
}: ConfigurationDetailsProps) => {
  const theme = useTheme();
  const [tab, setTab] = React.useState(0);
  const [expanded, setExpanded] = React.useState<string | false>('team');
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleOpenPreview = () => {
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  if (!selectedConfig) {
    return (
      <EmptyState>
        <DirectionsCarIcon sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" gutterBottom>No configuration selected</Typography>
        <Typography variant="body2">Select a configuration from the list to view its details</Typography>
      </EmptyState>
    );
  }

  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleString();
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTab(newValue);
  const handleAccordionChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => setExpanded(isExpanded ? panel : false);

  return (
    <DetailSection sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden',
      p: { xs: 2, md: 3 },
      gap: 2,
      backdropFilter: 'blur(10px)',
      bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.8 : 0.9),
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 1 }}>
        <SectionHeading variant="h5" sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
          color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
          letterSpacing: '-0.5px'
        }}>
          <DirectionsCarIcon color="inherit" />
          {selectedConfig.name}
        </SectionHeading>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Chip
            icon={<LayersIcon fontSize="small" sx={{ color: theme.palette.info.main }} />}
            label={selectedConfig.approvalStage || '—'}
            color="default"
            size="medium"
            variant="outlined"
            sx={{
              fontSize: '0.9rem',
              height: 32,
              fontWeight: 600,
              px: 1.5,
              borderRadius: '16px',
              bgcolor: alpha(theme.palette.info.main, 0.08),
              borderColor: alpha(theme.palette.info.main, 0.2),
              color: theme.palette.info.main
            }}
          />
          <Chip
            icon={getStatusIcon(selectedConfig.status)}
            label={selectedConfig.status ? (selectedConfig.status.charAt(0).toUpperCase() + selectedConfig.status.slice(1)) : 'Unknown'}
            color={getStatusColor(selectedConfig.status)}
            size="medium"
            variant="outlined"
            sx={{
              fontWeight: 600,
              fontSize: '0.9rem',
              height: 32,
              px: 1.5,
              borderRadius: '16px',
              backdropFilter: 'blur(8px)'
            }}
          />
          <Typography
            variant="body2"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: alpha(theme.palette.text.secondary, 0.8),
              fontSize: '0.875rem'
            }}
          >
            <ScheduleIcon fontSize="small" />
            {formatDate(selectedConfig.timestamp)}
          </Typography>
          <Button
            // variant="outlined"
            color="primary"
            startIcon={<PreviewIcon />}
            onClick={handleOpenPreview}
            sx={{textTransform: 'none'}}
          >
            Preview Car
          </Button>
        </Box>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
            }
          }}
        >
          <Tab
            label="Details"
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem',
              color: theme.palette.text.secondary,
              '&.Mui-selected': {
                color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main
              }
            }}
          />
          <Tab
            label={`Comment History${selectedConfig.comments?.length ? ` (${selectedConfig.comments.length})` : ''}`}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem',
              color: theme.palette.text.secondary,
              '&.Mui-selected': {
                color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main
              }
            }}
          />
        </Tabs>
      </Box>

      {/* Content Section */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        px: 1,
        '&::-webkit-scrollbar': {
          width: 8,
        },
        '&::-webkit-scrollbar-track': {
          bgcolor: alpha(theme.palette.common.black, 0.05),
          borderRadius: 4,
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: alpha(theme.palette.primary.main, 0.2),
          borderRadius: 4,
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.3),
          }
        }
      }}>
        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Team & Driver Section */}
            <Accordion 
              expanded={expanded === 'team'} 
              onChange={handleAccordionChange('team')}
              sx={{
                bgcolor: 'transparent',
                '&:before': { display: 'none' },
                boxShadow: 'none',
                '& .MuiAccordionSummary-root': {
                  minHeight: 56,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  '&.Mui-expanded': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  }
                }
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ px: 2 }}
              >
                <Typography variant="subtitle1" fontWeight={600}>Team & Driver</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2 }}>
                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
                  {selectedConfig.team && (
                    <Box sx={{ 
                      flex: 1, 
                      p: 3,
                      bgcolor: alpha(theme.palette.info.main, 0.04),
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`
                      }
                    }}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Team</Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        {selectedConfig.team.logo && (
                          <Avatar 
                            src={selectedConfig.team.logo} 
                            alt={selectedConfig.team.name}
                            sx={{ 
                              width: 48,
                              height: 48,
                              boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.15)}`
                            }}
                          />
                        )}
                        <Box>
                          <Typography variant="body1" fontWeight={500}>{selectedConfig.team.name}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                  {selectedConfig.driver && (
                    <Box sx={{ 
                      flex: 1,
                      p: 3,
                      bgcolor: alpha(theme.palette.success.main, 0.04),
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`
                      }
                    }}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Driver</Typography>
                      <Typography variant="body1" fontWeight={500}>{selectedConfig.driver.name}</Typography>
                      {selectedConfig.driver.number && (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                          Number: {selectedConfig.driver.number}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Paint Details Section */}
            <Accordion 
              expanded={expanded === 'paint'} 
              onChange={handleAccordionChange('paint')}
              sx={{
                bgcolor: 'transparent',
                '&:before': { display: 'none' },
                boxShadow: 'none',
                '& .MuiAccordionSummary-root': {
                  minHeight: 56,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  '&.Mui-expanded': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  }
                }
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ px: 2 }}
              >
                <Typography variant="subtitle1" fontWeight={600}>Paint Details</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2 }}>
                <Box sx={{ 
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                }}>
                  <Table size="medium">
                    <TableBody>
                      <TableRow>
                        <StyledTableCell width="30%" sx={{ fontWeight: 600 }}>Car Color</StyledTableCell>
                        <StyledTableCell width="70%">
                          <Box display="flex" alignItems="center" gap={2}>
                            <ColorSwatch colorHex={selectedConfig.configuration.carColor} />
                            <Typography variant="body2" fontFamily="monospace">
                              {selectedConfig.configuration.carColor}
                            </Typography>
                          </Box>
                        </StyledTableCell>
                      </TableRow>
                      <TableRow>
                        <StyledTableCell width="30%" sx={{ fontWeight: 600 }}>Driver Color</StyledTableCell>
                        <StyledTableCell width="70%">
                          <Box display="flex" alignItems="center" gap={2}>
                            <ColorSwatch colorHex={selectedConfig.configuration.driverColor} />
                            <Typography variant="body2" fontFamily="monospace">
                              {selectedConfig.configuration.driverColor}
                            </Typography>
                          </Box>
                        </StyledTableCell>
                      </TableRow>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.common.white, 0.02) }}>
                        <StyledTableCell sx={{ fontWeight: 600 }}>Finish</StyledTableCell>
                        <StyledTableCell>
                          <Chip 
                            label={selectedConfig.configuration.carPaintFinish?.charAt(0).toUpperCase() + 
                                  selectedConfig.configuration.carPaintFinish?.slice(1)} 
                            size="small" 
                            sx={{ 
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main,
                              fontWeight: 600,
                              height: 24,
                              borderRadius: '12px'
                            }} 
                          />
                        </StyledTableCell>
                      </TableRow>
                      
                      {/* Car Part Colors */}
                      {selectedConfig.configuration.carPartColors && selectedConfig.configuration.carPartColors.length > 0 && (
                        <>
                          <TableRow>
                            <StyledTableCell colSpan={2} sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                              <Typography variant="subtitle2">
                                Car Part Colors ({selectedConfig.configuration.carPartColors.length})
                              </Typography>
                            </StyledTableCell>
                          </TableRow>
                          {selectedConfig.configuration.carPartColors.map((partColor: any, index: number) => (
                            <TableRow key={partColor.id} sx={{ bgcolor: index % 2 === 0 ? 'transparent' : alpha(theme.palette.common.white, 0.02) }}>
                              <StyledTableCell sx={{ pl: 3, fontWeight: 500 }}>
                                {partColor.name}
                              </StyledTableCell>
                              <StyledTableCell>
                                <Box display="flex" alignItems="center" gap={2}>
                                  <ColorSwatch colorHex={partColor.hex} />
                                  <Typography variant="body2" fontFamily="monospace">
                                    {partColor.hex}
                                  </Typography>
                                </Box>
                              </StyledTableCell>
                            </TableRow>
                          ))}
                        </>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Decals Section */}
            <Accordion 
              expanded={expanded === 'decals'} 
              onChange={handleAccordionChange('decals')}
              sx={{
                bgcolor: 'transparent',
                '&:before': { display: 'none' },
                boxShadow: 'none',
                '& .MuiAccordionSummary-root': {
                  minHeight: 56,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  '&.Mui-expanded': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  }
                }
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ px: 2 }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Sponsorship Logo Placements
                  <Chip
                    label={selectedConfig.configuration.placedDecals.length}
                    size="small"
                    sx={{
                      ml: 1,
                      height: 20,
                      minWidth: 20,
                      borderRadius: '10px',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main
                    }}
                  />
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2 }}>
                {selectedConfig.configuration.placedDecals.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    No logos have been placed on this configuration.
                  </Typography>
                ) : (
                  <Box sx={{
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    borderRadius: 2,
                    overflow: 'auto',
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    maxHeight: 400
                  }}>
                    <Table size="medium" sx={{ tableLayout: 'fixed', minWidth: 600 }}>
                      <TableHead>
                        <TableRow>
                          <StyledTableCell width="25%">Logo Name</StyledTableCell>
                          <StyledTableCell width="25%">Position</StyledTableCell>
                          <StyledTableCell width="25%">Scale</StyledTableCell>
                          <StyledTableCell width="25%">Rotation</StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedConfig.configuration.placedDecals.map((decal: any, index: number) => (
                          <TableRow 
                            key={index}
                            sx={{
                              '&:nth-of-type(odd)': {
                                bgcolor: alpha(theme.palette.common.white, 0.02)
                              },
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.04)
                              },
                              transition: 'background-color 0.2s ease'
                            }}
                          >
                            <StyledTableCell>
                              <Box display="flex" alignItems="center" gap={1.5}>
                                <Avatar 
                                  sx={{ 
                                    width: 32,
                                    height: 32,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                    fontSize: '0.875rem',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {index + 1}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {parseDecalName(decal.name) || `Logo ${index + 1}`}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    ID: {decal.id || `D${index + 1}`}
                                  </Typography>
                                </Box>
                              </Box>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Box display="flex" flexDirection="column" gap={0.5}>
                                {['X', 'Y', 'Z'].map((axis, i) => (
                                  <Box key={axis} display="flex" alignItems="center" gap={1}>
                                    <Chip
                                      label={axis}
                                      size="small"
                                      sx={{
                                        height: 20,
                                        minWidth: 28,
                                        bgcolor: alpha(
                                          i === 0 ? theme.palette.error.main :
                                          i === 1 ? theme.palette.success.main :
                                          theme.palette.primary.main,
                                          0.1
                                        ),
                                        color: i === 0 ? theme.palette.error.main :
                                               i === 1 ? theme.palette.success.main :
                                               theme.palette.primary.main,
                                        fontWeight: 'bold',
                                        fontSize: '0.75rem'
                                      }}
                                    />
                                    <Typography variant="body2" fontFamily="monospace">
                                      {decal.position[i].toFixed(2)}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Box display="flex" flexDirection="column" gap={0.5}>
                                {['X', 'Y', 'Z'].map((axis, i) => (
                                  <Box key={axis} display="flex" alignItems="center" gap={1}>
                                    <Chip
                                      label={axis}
                                      size="small"
                                      sx={{
                                        height: 20,
                                        minWidth: 28,
                                        bgcolor: alpha(
                                          i === 0 ? theme.palette.error.main :
                                          i === 1 ? theme.palette.success.main :
                                          theme.palette.primary.main,
                                          0.1
                                        ),
                                        color: i === 0 ? theme.palette.error.main :
                                               i === 1 ? theme.palette.success.main :
                                               theme.palette.primary.main,
                                        fontWeight: 'bold',
                                        fontSize: '0.75rem'
                                      }}
                                    />
                                    <Typography variant="body2" fontFamily="monospace">
                                      {decal.scale[i].toFixed(2)}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Box display="flex" flexDirection="column" gap={0.5}>
                                {['X', 'Y', 'Z'].map((axis, i) => (
                                  <Box key={axis} display="flex" alignItems="center" gap={1}>
                                    <Chip
                                      label={axis}
                                      size="small"
                                      sx={{
                                        height: 20,
                                        minWidth: 28,
                                        bgcolor: alpha(
                                          i === 0 ? theme.palette.error.main :
                                          i === 1 ? theme.palette.success.main :
                                          theme.palette.primary.main,
                                          0.1
                                        ),
                                        color: i === 0 ? theme.palette.error.main :
                                               i === 1 ? theme.palette.success.main :
                                               theme.palette.primary.main,
                                        fontWeight: 'bold',
                                        fontSize: '0.75rem'
                                      }}
                                    />
                                    <Typography variant="body2" fontFamily="monospace">
                                      {decal.rotation[i].toFixed(2)}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            </StyledTableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          </Box>
        )}

        {tab === 1 && (
          <Box>
            {Array.isArray(selectedConfig.comments) && selectedConfig.comments.length > 0 ? (
              <Box sx={{
                p: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`
              }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  sx={{
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <NoteAltIcon fontSize="small" color="primary" />
                  Comment History
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Timeline position="alternate">
                  {[...selectedConfig.comments]
                    .slice()
                    .reverse()
                    .map((comment, idx, arr) => (
                      <TimelineItem key={idx}>
                        <TimelineSeparator>
                          <TimelineDot
                            variant="filled"
                            color={
                              comment.status === 'approved'
                                ? 'success'
                                : comment.status === 'rejected'
                                  ? 'error'
                                  : 'warning'
                            }
                            sx={{
                              width: 18,
                              height: 18,
                              minWidth: 18,
                              minHeight: 18,
                            }}
                          />
                          {idx < arr.length - 1 && (
                            <TimelineConnector sx={{ minHeight: 36 }} />
                          )}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            {comment.status && (
                              <Typography variant="body2" fontWeight={600} sx={{ mr: 1 }}>
                                {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                              </Typography>
                            )}
                            {comment.stage && (
                              <Chip
                                label={comment.stage}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.75rem',
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  color: theme.palette.info.main
                                }}
                              />
                            )}
                            {comment.timestamp && (
                              <Typography variant="caption" color="textSecondary">
                                {formatDate(comment.timestamp)}
                              </Typography>
                            )}
                          </Box>
                          {comment.comment ? (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1.5,
                                p: 1.5,
                                bgcolor: alpha(theme.palette.background.paper, 0.7),
                                borderRadius: 1,
                                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 28,
                                  height: 28,
                                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                                  color: theme.palette.primary.main,
                                  fontSize: '1rem',
                                  fontWeight: 700
                                }}
                              >
                                <NoteAltIcon fontSize="small" />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  {comment.comment}
                                </Typography>
                              </Box>
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1.5,
                                p: 1.5,
                                bgcolor: alpha(theme.palette.background.paper, 0.7),
                                borderRadius: 1,
                                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 28,
                                  height: 28,
                                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                                  color: theme.palette.primary.main,
                                  fontSize: '1rem',
                                  fontWeight: 700
                                }}
                              >
                                <NoteAltIcon fontSize="small" />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                  No comment.
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                </Timeline>
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">No comments yet.</Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Action Buttons */}
      {renderActionButtons && (
        <ActionButtonsContainer 
          sx={{ 
            position: 'sticky',
          }}
        >
          {isKanbanView && userRole && (selectedConfig?.approvalStage) === userRole && selectedConfig.status === 'pending' && (
            <Button
              onClick={onTakeAction}
              variant="contained"
              color="primary"
              startIcon={<NoteAltIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                fontWeight: 600,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                '&:hover': {
                  background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
                }
              }}
            >
              Take Action
            </Button>
          )}
        </ActionButtonsContainer>
      )}
      {/* Preview Dialog */}
      <CarPreviewDialog
        open={previewOpen}
        onClose={handleClosePreview}
        selectedConfig={selectedConfig}
      />
    </DetailSection>
  );
};

export default ConfigurationDetails;
