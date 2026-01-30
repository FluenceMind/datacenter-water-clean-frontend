import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Water, Upload, History } from '@mui/icons-material';

function Layout({ children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Water sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            DataCenter Water Clean
          </Typography>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            startIcon={<Upload />}
          >
            Upload
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/history"
            startIcon={<History />}
          >
            History
          </Button>
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flex: 1, py: 4 }}>
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: 'primary.light',
          color: 'primary.contrastText',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            DataCenter Water Clean - Water Quality Analysis System
          </Typography>
          <Typography variant="caption" align="center" display="block" sx={{ mt: 1 }}>
            pH Target Range: 7.5-8.3 | TDS Categories: Low (&lt;100), Moderate (100-299), High (≥300 mg/L)
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default Layout;
