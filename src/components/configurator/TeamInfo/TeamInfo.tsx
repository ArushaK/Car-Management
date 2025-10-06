import { Box, Paper, Typography, Button, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearTeamSelection } from '@/store/actions/teamSelectionSlice';
import { TeamInfoProps } from './types';

const TeamInfoContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  top: 24,
  left: 24,
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  zIndex: 100,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
}));

const TeamLogo = styled('img')({
  width: 48,
  height: 48,
  objectFit: 'contain',
});

const ManufacturerLogo = styled('img')({
  width: 24,
  height: 24,
  objectFit: 'contain',
});

const TeamInfo = ({ teamData, driverData }: TeamInfoProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChangeTeam = () => {
    dispatch(clearTeamSelection());
    navigate('/select-team');
  };

  return (
    <TeamInfoContainer elevation={4}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TeamLogo src={teamData.logo} alt={teamData.name} />
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle1" fontWeight="600">
              {teamData.name}
            </Typography>
            {teamData.manufacturer && (
              <ManufacturerLogo
                src={teamData.manufacturer.logo}
                alt={teamData.manufacturer.name}
                title={teamData.manufacturer.name}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            Driver: {driverData.name}
          </Typography>
        </Box>
      </Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleChangeTeam}
        size="small"
        sx={{
          ml: 2,
          color: 'text.secondary',
          '&:hover': {
            color: 'text.primary',
          },
        }}
      >
        Change
      </Button>
    </TeamInfoContainer>
  );
};

export default TeamInfo;