import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import api, { errMsg } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusSelect, { taskColor } from '../components/StatusSelect';

const TASK_STATUSES = ['Pending', 'In Progress', 'Done'];
const blank = { title: '', lead: '', assignedTo: '', dueDate: '' };

export default function Tasks() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);

  const tasks = useQuery({ queryKey: ['tasks'], queryFn: async () => (await api.get('/tasks')).data });
  const users = useQuery({ queryKey: ['users'], queryFn: async () => (await api.get('/users')).data });
  const leads = useQuery({ queryKey: ['leads', 'all'], enabled: open, queryFn: async () => (await api.get('/leads', { params: { limit: 100 } })).data.items });

  const refresh = () => { qc.invalidateQueries({ queryKey: ['tasks'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); };
  const create = useMutation({ mutationFn: () => api.post('/tasks', form), onSuccess: () => { refresh(); setOpen(false); setForm(blank); } });
  const update = useMutation({ mutationFn: ({ id, status }) => api.patch(`/tasks/${id}/status`, { status }), onSuccess: refresh });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid = form.title && form.lead && form.assignedTo && form.dueDate;

  return (
    <>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>Tasks</Typography>
        <Button variant="contained" onClick={() => { create.reset(); setOpen(true); }}>+ Add Task</Button>
      </Box>
      {(tasks.error || update.error) && <Alert severity="error" sx={{ mb: 2 }}>{errMsg(tasks.error || update.error)}</Alert>}
      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead><TableRow>
            <TableCell>Title</TableCell><TableCell>Lead</TableCell><TableCell>Assigned To</TableCell><TableCell>Due Date</TableCell><TableCell>Status</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {tasks.data?.map((t) => {
              const mine = t.assignedTo?._id === user.id;
              return (
                <TableRow key={t._id}>
                  <TableCell>{t.title}</TableCell>
                  <TableCell>{t.lead?.name || '(deleted lead)'}</TableCell>
                  <TableCell>{t.assignedTo?.name}</TableCell>
                  <TableCell>{new Date(t.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Tooltip title={mine ? '' : 'Only the assigned user can change status'}>
                      <span>
                        <StatusSelect value={t.status} options={TASK_STATUSES} colors={taskColor} disabled={!mine} onChange={(status) => update.mutate({ id: t._id, status })} />
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {tasks.data?.length === 0 && <TableRow><TableCell colSpan={5} align="center">No tasks yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add Task</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
          {create.error && <Alert severity="error">{errMsg(create.error)}</Alert>}
          <TextField label="Title" value={form.title} onChange={set('title')} required />
          <TextField select label="Lead" value={form.lead} onChange={set('lead')} required>
            {leads.data?.map((l) => <MenuItem key={l._id} value={l._id}>{l.name}</MenuItem>)}
          </TextField>
          <TextField select label="Assign To" value={form.assignedTo} onChange={set('assignedTo')} required>
            {users.data?.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
          </TextField>
          <TextField label="Due Date" type="date" InputLabelProps={{ shrink: true }} value={form.dueDate} onChange={set('dueDate')} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!valid || create.isPending} onClick={() => create.mutate()}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
