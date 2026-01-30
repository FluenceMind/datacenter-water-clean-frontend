import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { Upload as UploadIcon, CheckCircle } from '@mui/icons-material';
import { uploadCSV } from '../services/api';

function Upload() {
  const [file, setFile] = useState(null);
  const [siteName, setSiteName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await uploadCSV(file, siteName);
      setResult(data);
      setFile(null);
      setSiteName('');
      // Reset file input
      event.target.reset();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    if (category.includes('target') || category === 'Low') return 'success';
    if (category.includes('Moderate')) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Water Quality Analysis
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Upload CSV File
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload a CSV file with pH and TDS measurements
          </Typography>

          <TextField
            fullWidth
            label="Site Name (Optional)"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="e.g., Server Room A"
          />

          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            fullWidth
            sx={{ mb: 2, py: 1.5 }}
          >
            {file ? file.name : 'Choose CSV File'}
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={handleFileChange}
            />
          </Button>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!file || loading}
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Analyze Water Quality'}
          </Button>
        </form>
      </Paper>

      {result && (
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircle color="success" sx={{ mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Analysis Complete
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              File: {result.original_filename}
            </Typography>
            {result.site_name && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Site: {result.site_name}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Water Quality Summary
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                <strong>Average pH:</strong> {result.summary.avg_ph.toFixed(2)}
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: `${getCategoryColor(result.summary.ph_category)}.light`,
                    color: `${getCategoryColor(result.summary.ph_category)}.dark`,
                    fontSize: '0.875rem',
                  }}
                >
                  {result.summary.ph_category}
                </Box>
              </Typography>

              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Average TDS:</strong> {result.summary.avg_tds.toFixed(2)} mg/L
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: `${getCategoryColor(result.summary.tds_category)}.light`,
                    color: `${getCategoryColor(result.summary.tds_category)}.dark`,
                    fontSize: '0.875rem',
                  }}
                >
                  {result.summary.tds_category}
                </Box>
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Samples analyzed: {result.summary.row_count}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Treatment Recommendation
            </Typography>

            <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {result.recommendation.treatment_train}
              </Typography>
              <Typography variant="body2">
                {result.recommendation.explanation}
              </Typography>
            </Paper>

            <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
              Analysis ID: {result.analysis_id}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default Upload;
