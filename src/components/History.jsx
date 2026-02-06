import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import { getAnalysisHistory, updateAnalysisNotes } from '../services/api';

function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [editingNotes, setEditingNotes] = useState({}); // Track which notes are being edited
  const [notesValues, setNotesValues] = useState({}); // Track notes values
  const [savingNotes, setSavingNotes] = useState({}); // Track which notes are being saved

  useEffect(() => {
    fetchHistory();
  }, [page, rowsPerPage]);

  useEffect(() => {
    // Initialize notesValues from analyses
    const initialNotes = {};
    analyses.forEach(analysis => {
      if (analysis.user_notes) {
        initialNotes[analysis.id] = analysis.user_notes;
      }
    });
    setNotesValues(prev => ({ ...prev, ...initialNotes }));
  }, [analyses]);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await getAnalysisHistory(rowsPerPage, page * rowsPerPage);
      setAnalyses(data.analyses);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load analysis history');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getCategoryColor = (category) => {
    if (category.includes('target') || category === 'Low') return 'success';
    if (category.includes('Moderate')) return 'warning';
    return 'error';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleEditNotes = (analysisId, currentNotes) => {
    setEditingNotes({ ...editingNotes, [analysisId]: true });
    setNotesValues({ ...notesValues, [analysisId]: currentNotes || '' });
  };

  const handleSaveNotes = async (analysisId) => {
    setSavingNotes({ ...savingNotes, [analysisId]: true });
    setError('');
    
    try {
      await updateAnalysisNotes(analysisId, notesValues[analysisId] || '');
      
      // Update the local state
      setAnalyses(analyses.map(analysis => 
        analysis.id === analysisId 
          ? { ...analysis, user_notes: notesValues[analysisId] }
          : analysis
      ));
      
      setEditingNotes({ ...editingNotes, [analysisId]: false });
    } catch (err) {
      setError('Failed to save notes');
    } finally {
      setSavingNotes({ ...savingNotes, [analysisId]: false });
    }
  };

  const handleNotesChange = (analysisId, value) => {
    setNotesValues({ ...notesValues, [analysisId]: value });
  };

  const handleCancelEdit = (analysisId) => {
    setEditingNotes({ ...editingNotes, [analysisId]: false });
    // Reset to original value
    const originalAnalysis = analyses.find(a => a.id === analysisId);
    setNotesValues({ ...notesValues, [analysisId]: originalAnalysis?.user_notes || '' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Analysis History
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {analyses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No analyses found. Upload a CSV file to get started.
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>File</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Site</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">pH</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">pH Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">TDS (mg/L)</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">TDS Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Recommended Treatment</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Methods Actually Used</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analyses.map((analysis) => (
                  <TableRow
                    key={analysis.id}
                    sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(analysis.upload_timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {analysis.original_filename}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {analysis.site_name || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {analysis.avg_ph.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={analysis.ph_category}
                        color={getCategoryColor(analysis.ph_category)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {analysis.avg_tds.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={analysis.tds_category}
                        color={getCategoryColor(analysis.tds_category)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {analysis.treatment_train && analysis.explanation ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
                            {analysis.treatment_train}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                            {analysis.explanation}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary" fontStyle="italic">
                          Not available for old records
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingNotes[analysis.id] ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <TextField
                            multiline
                            rows={3}
                            value={notesValues[analysis.id] || ''}
                            onChange={(e) => handleNotesChange(analysis.id, e.target.value)}
                            placeholder="Describe the methods you actually used..."
                            variant="outlined"
                            size="small"
                            fullWidth
                            sx={{ minWidth: 250 }}
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<SaveIcon />}
                              onClick={() => handleSaveNotes(analysis.id)}
                              disabled={savingNotes[analysis.id]}
                            >
                              {savingNotes[analysis.id] ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<CancelIcon />}
                              onClick={() => handleCancelEdit(analysis.id)}
                              disabled={savingNotes[analysis.id]}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, minHeight: 60 }}>
                          {analysis.user_notes ? (
                            <>
                              <Typography variant="body2" sx={{ flex: 1, whiteSpace: 'pre-wrap' }}>
                                {analysis.user_notes}
                              </Typography>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => handleEditNotes(analysis.id, analysis.user_notes)}
                              >
                                Edit
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleEditNotes(analysis.id, '')}
                            >
                              Add Notes
                            </Button>
                          )}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}
    </Box>
  );
}

export default History;
