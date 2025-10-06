import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Configurator from '@/components/configurator/Configurator';
import ConfigurationApproval from '@/components/approvals/ConfigurationApproval';
import TeamSelection from '@/components/TeamSelection/TeamSelection';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import PerformanceMonitor from '@components/PerformanceMonitor/PerformanceMonitor';
import Notification from '@/components/common/Notification/Notification';
import sampleConfiguration from '@/utils/staticData/SampleConfigurations.json';

function App() {

  const existingConfigs = localStorage.getItem('savedConfigurations');
  const configs = existingConfigs ? JSON.parse(existingConfigs) : [];

  if (configs.length === 0) {
    localStorage.setItem('savedConfigurations', JSON.stringify(sampleConfiguration));
    console.log('No configurations found. Sample configuration added to local storage.');
  }
  // Create a custom Material UI theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: '#666666',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/select-team" replace />} />
            <Route path="/select-team" element={<TeamSelection />} />
            <Route path="/configurator" element={<Configurator />} />
            <Route path="/approval" element={<ConfigurationApproval />} />
          </Routes>
        </Router>
        <Notification />
      </ThemeProvider>
      <PerformanceMonitor />
    </>
  )
}

export default App
