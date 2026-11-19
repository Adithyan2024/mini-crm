import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import api, { errMsg } from '../api/axios';
import { LEAD_STATUSES } from './Leads';

const empty = { name: '', email: '', phone: '', status: 'New', assignedTo: '', company: '' };

export default function LeadForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);
  const [touched, setTouched] = useState(false);

  const users = useQuery({ queryKey: ['users'], queryFn: async () => (await api.get('/users')).data });
  const companies = useQuery({ queryKey: ['companies'], queryFn: async () => (await api.get('/companies')).data });
  const lead = useQuery({ queryKey: ['lead', id], enabled: !!id, queryFn: async () => (await api.get(`/leads/${id}`)).data });

  useEffect(() => {
    if (lead.data) {
      const l = lead.data;
      setForm({ name: l.name, email: l.email, phone: l.phone || '', status: l.status, assignedTo: l.assignedTo?._id || '', company: l.company?._id || '' });
    }
  }, [lead.data]);

  const save = useMutation({
    mutationFn: () => (id ? api.put(`/leads/${id}`, form) : api.post('/leads', form)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); qc.invalidateQueries({ queryKey: ['lead', id] }); navigate('/leads'); },
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!form.name || !form.email) return;
    save.mutate();
  };

  return (
    <Paper component="form" onSubmit={submit} noValidate sx={{ p: 3, maxWidth: 520, display: 'grid', gap: 2 }}>
      <Typography variant="h5">{id ? 'Edit Lead' : 'Add Lead'}</Typography>
      {save.error && <Alert severity="error">{errMsg(save.error)}</Alert>}
      <TextField label="Name" value={form.name} onChange={set('name')} error={touched && !form.name} helperText={touched && !form.name ? 'Required' : ''} />
      <TextField label="Email" type="email" value={form.email} onChange={set('email')} error={touched && !form.email} helperText={touched && !form.email ? 'Required' : ''} />
      <TextField label="Phone" value={form.phone} onChange={set('phone')} />
      <TextField select label="Status" value={form.status} onChange={set('status')}>
        {LEAD_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
      </TextField>
      <TextField select label="Assigned To" value={form.assignedTo} onChange={set('assignedTo')}>
        <MenuItem value="">Unassigned</MenuItem>
        {users.data?.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
      </TextField>
      <TextField select label="Company" value={form.company} onChange={set('company')}>
        <MenuItem value="">None</MenuItem>
        {companies.data?.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
      </TextField>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button type="submit" variant="contained" disabled={save.isPending}>Save</Button>
        <Button onClick={() => navigate('/leads')}>Cancel</Button>
      </Box>
    </Paper>
  );
}
