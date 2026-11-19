import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, MenuItem, Pagination, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import api, { errMsg } from '../api/axios';
import StatusSelect, { leadColor } from '../components/StatusSelect';

export const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];

export default function Leads() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, error } = useQuery({
    queryKey: ['leads', debounced, status, page],
    queryFn: async () => (await api.get('/leads', { params: { search: debounced, status, page, limit: 10 } })).data,
    placeholderData: keepPreviousData,
  });

  const del = useMutation({
    mutationFn: (id) => api.delete(`/leads/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); },
  });
  const changeStatus = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/leads/${id}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); },
  });

  return (
    <>
      <Typography variant="h5" gutterBottom>Leads</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField size="small" label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <TextField size="small" select label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} sx={{ minWidth: 150 }}>
          <MenuItem value="">All</MenuItem>
          {LEAD_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
        <Button variant="contained" onClick={() => navigate('/leads/new')} sx={{ ml: 'auto' }}>+ Add Lead</Button>
      </Box>
      {(error || del.error || changeStatus.error) && <Alert severity="error" sx={{ mb: 2 }}>{errMsg(error || del.error || changeStatus.error)}</Alert>}
      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead><TableRow>
            <TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Status</TableCell><TableCell>Assigned To</TableCell><TableCell>Actions</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {data?.items.map((l) => (
              <TableRow key={l._id}>
                <TableCell>{l.name}</TableCell>
                <TableCell>{l.email}</TableCell>
                <TableCell>
                  <StatusSelect value={l.status} options={LEAD_STATUSES} colors={leadColor} onChange={(status) => changeStatus.mutate({ id: l._id, status })} />
                </TableCell>
                <TableCell>{l.assignedTo?.name || '-'}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => navigate(`/leads/${l._id}/edit`)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => window.confirm('Delete this lead?') && del.mutate(l._id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {data && data.items.length === 0 && <TableRow><TableCell colSpan={5} align="center">No leads found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Paper>
      {data?.pages > 1 && <Pagination sx={{ mt: 2 }} count={data.pages} page={page} onChange={(_, p) => setPage(p)} />}
    </>
  );
}
