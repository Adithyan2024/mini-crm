import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import api, { errMsg } from '../api/axios';

export default function Companies() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', industry: '', location: '' });
  const { data, error } = useQuery({ queryKey: ['companies'], queryFn: async () => (await api.get('/companies')).data });

  const create = useMutation({
    mutationFn: () => api.post('/companies', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['companies'] }); setOpen(false); setForm({ name: '', industry: '', location: '' }); },
  });

  return (
    <>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>Companies</Typography>
        <Button variant="contained" onClick={() => { create.reset(); setOpen(true); }}>+ Add Company</Button>
      </Box>
      {error && <Alert severity="error">{errMsg(error)}</Alert>}
      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead><TableRow><TableCell>Company Name</TableCell><TableCell>Industry</TableCell><TableCell>Location</TableCell></TableRow></TableHead>
          <TableBody>
            {data?.map((c) => (
              <TableRow key={c._id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/companies/${c._id}`)}>
                <TableCell>{c.name}</TableCell><TableCell>{c.industry}</TableCell><TableCell>{c.location}</TableCell>
              </TableRow>
            ))}
            {data?.length === 0 && <TableRow><TableCell colSpan={3} align="center">No companies yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add Company</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
          {create.error && <Alert severity="error">{errMsg(create.error)}</Alert>}
          <TextField label="Company Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <TextField label="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          <TextField label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!form.name || create.isPending} onClick={() => create.mutate()}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
