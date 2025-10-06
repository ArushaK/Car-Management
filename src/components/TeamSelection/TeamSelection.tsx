import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { Box, Container, Typography, Paper, Select, MenuItem, FormControl, InputLabel, Button, alpha, Chip, Avatar, CircularProgress } from '@mui/material';
import { styled, keyframes, Theme } from '@mui/material/styles';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import GarageIcon from '@mui/icons-material/Garage';
import teamsData from '@utils/staticData/nasCarTeamsData.json';
import { setSelectedTeamId, setSelectedDriverId, setSelectedTeamData, setSelectedDriverData } from '@/store/actions/teamSelectionSlice';
import { TeamsData } from './types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const SelectionContainer = styled(Container)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(4),
  padding: theme.spacing(4),
  background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)',
  position: 'relative',
  overflowY: 'auto',
  // Hide scrollbar but allow scrolling
  scrollbarWidth: 'none', // Firefox
  msOverflowStyle: 'none', // IE and Edge
  '&::-webkit-scrollbar': {
    display: 'none', // Chrome, Safari, Opera
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    gap: theme.spacing(2),
  },
}));

const SelectionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: 600,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: `0 8px 32px ${alpha('#000', 0.2)}`,
  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
  animation: `${fadeIn} 0.6s ease-out`,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 40px ${alpha('#000', 0.3)}`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    maxWidth: '100%',
    minWidth: 0,
  },
}));

const TeamLogo = styled('img')(({ theme }) => ({
  width: '100%',
  maxHeight: 120,
  objectFit: 'contain',
  marginBottom: 16,
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
  [theme.breakpoints.down('sm')]: {
    maxHeight: 80,
    marginBottom: 8,
  },
}));

const ManufacturerChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  borderRadius: theme.shape.borderRadius,
  padding: '8px 4px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  },
  '& .MuiChip-avatar': {
    backgroundColor: 'transparent',
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    },
  },
}));

const StyledSelect = styled(Select)<{ theme?: Theme }>(() => ({
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#2196F3',
  },
  '& .MuiSelect-icon': {
    color: 'rgba(255, 255, 255, 0.5)',
  }
}));

const ManufacturerFilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  flexWrap: 'wrap',
  justifyContent: 'center',
}));

const ManufacturerPill = styled(Chip)<{ selected?: boolean }>(({ theme, selected }) => ({
  backgroundColor: selected ? theme.palette.primary.main : 'transparent',
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  border: `1px solid ${selected ? theme.palette.primary.main : alpha(theme.palette.common.white, 0.3)}`,
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.dark : alpha(theme.palette.common.white, 0.1),
  },
  '& .MuiChip-avatar': {
    width: 24,
    height: 24,
    marginLeft: 4,
    backgroundColor: 'transparent',
  },
}));

const TeamSelection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  const { control, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: {
      team: '',
      driver: '',
    },
  });

  const selectedTeam = watch('team');
  const selectedDriver = watch('driver');

  const currentTeamData = useMemo(() => {
    if (!selectedTeam) return null;
    return (teamsData as TeamsData).teams.find(t => t.id === selectedTeam) || null;
  }, [selectedTeam]);

  const manufacturers = useMemo(() => {
    return (teamsData as TeamsData).manufacturers || [];
  }, []);

  const filteredTeams = useMemo(() => {
    if (!selectedManufacturer) return (teamsData as TeamsData).teams;
    return (teamsData as TeamsData).teams.filter(
      team => team.manufacturer?.name === selectedManufacturer
    );
  }, [selectedManufacturer]);

  useEffect(() => {
    // Reset driver when team changes
    setValue('driver', '');
  }, [selectedTeam, setValue]);

  const onSubmit = async (data: { team: string; driver: string }) => {
    if (data.team && data.driver) {
      try {
        const selectedTeamData = (teamsData as TeamsData).teams.find(t => t.id === data.team);
        const selectedDriverData = selectedTeamData?.drivers.find(d => d.id === data.driver);
        dispatch(setSelectedTeamId(data.team));
        dispatch(setSelectedDriverId(data.driver));
        dispatch(setSelectedTeamData(selectedTeamData || null));
        dispatch(setSelectedDriverData(selectedDriverData || null));
        navigate('/configurator');
      } catch (error) {
        console.error('Error saving selection:', error);
      }
    }
  };

  const selectedDriverDetails = currentTeamData?.drivers.find(d => d.id === selectedDriver);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)',
        position: 'relative',
        overflow: 'auto',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        }
      }}
    >
      <SelectionContainer>
        <Box sx={{ textAlign: 'center', mb: 4, px: { xs: 1, sm: 0 } }}>
          <RocketLaunchIcon sx={{ 
            fontSize: { xs: 36, sm: 48 }, 
            color: 'primary.main', 
            mb: 2,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)' },
            }
          }} />
          <Typography variant="h4" component="h1" fontWeight="700" sx={{ 
            mb: 1,
            fontSize: { xs: '2rem', sm: '2.5rem' },
            background: 'linear-gradient(45deg, #fff 30%, #999 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            NASCAR Configurator
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: '1rem', sm: '1.15rem' } }}>
            Select your team and driver to begin customizing your race car
          </Typography>
        </Box>

        <SelectionCard elevation={4}>
          <ManufacturerFilterContainer>
            <ManufacturerPill
              label="All Manufacturers"
              clickable
              selected={!selectedManufacturer}
              onClick={() => {
                setSelectedManufacturer(null);
                setValue('team', '');
                setValue('driver', '');
              }}
            />
            {manufacturers.map((manufacturer) => (
              <ManufacturerPill
                key={manufacturer.name}
                label={manufacturer.name}
                avatar={<Avatar src={manufacturer.logo} alt={manufacturer.name} />}
                clickable
                selected={selectedManufacturer === manufacturer.name}
                onClick={() => {
                  setSelectedManufacturer(manufacturer.name);
                  setValue('team', '');
                  setValue('driver', '');
                }}
              />
            ))}
          </ManufacturerFilterContainer>

          {currentTeamData?.logo && (
            <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3 } }}>
              <TeamLogo src={currentTeamData.logo} alt={currentTeamData.name} />
              {currentTeamData.manufacturer && (
                <ManufacturerChip
                  avatar={<Avatar alt={currentTeamData.manufacturer.name} src={currentTeamData.manufacturer.logo} />}
                  label={`${currentTeamData.manufacturer.name} Racing Team`}
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.8rem', sm: '1rem' }, px: { xs: 0.5, sm: 1 } }}
                />
              )}
            </Box>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl fullWidth sx={{ mb: { xs: 2, sm: 3 } }}>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Select Team</InputLabel>
              <Controller
                name="team"
                control={control}
                render={({ field }) => (
                  <StyledSelect
                    {...field}
                    label="Select Team"
                  >
                    {filteredTeams.map((team) => (
                      <MenuItem key={team.id} value={team.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GarageIcon sx={{ color: 'primary.main' }} fontSize="small" />
                          {team.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </StyledSelect>
                )}
              />
            </FormControl>

            <FormControl fullWidth sx={{ mb: { xs: 3, sm: 4 } }} disabled={!selectedTeam}>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Select Driver</InputLabel>
              <Controller
                name="driver"
                control={control}
                render={({ field }) => (
                  <StyledSelect
                    {...field}
                    label="Select Driver"
                  >
                    {currentTeamData?.drivers
                      .slice()
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((driver) => (
                        <MenuItem key={driver.id} value={driver.id}>
                          {driver.name}
                        </MenuItem>
                      ))}
                  </StyledSelect>
                )}
              />
            </FormControl>

            {selectedDriverDetails && (
              <Box sx={{ 
                mb: { xs: 3, sm: 4 }, 
                p: { xs: 1.5, sm: 2.5 }, 
                bgcolor: alpha('#fff', 0.05), 
                borderRadius: 1,
                border: `1px solid ${alpha('#fff', 0.1)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha('#fff', 0.07),
                  transform: 'translateY(-2px)',
                }
              }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  Selected Driver:
                </Typography>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                  {selectedDriverDetails.name}
                </Typography>
                <Button
                  href={selectedDriverDetails.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    mt: 1, 
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    color: 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      color: 'primary.main',
                    }
                  }}
                >
                  View Profile →
                </Button>
              </Box>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              type="submit"
              disabled={!selectedTeam || !selectedDriver || isSubmitting}
              sx={{
                py: { xs: 1, sm: 1.5 },
                fontSize: { xs: '1rem', sm: '1.1rem' },
                borderRadius: 2,
                background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1565C0 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 10px 2px rgba(33, 150, 243, .3)',
                }
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Continue to Configurator'
              )}
            </Button>
          </form>
        </SelectionCard>
      </SelectionContainer>
    </Box>
  );
};

export default TeamSelection;