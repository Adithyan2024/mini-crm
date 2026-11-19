import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import api, { errMsg } from '../api/axios';
import { Chip } from '@mui/material';
import { leadColor } from '../components/StatusSelect';

export default function CompanyDetail() {
  const { id } = useParams();
  const { data, error } = useQuery({ queryKey: ['company', id], queryFn: async () => (await api.get(`/companies/${id}`)).data });
  if (error) return <Alert severity="error">{errMsg(error)}</Alert>;
  if (!data) return null;
  const { company, leads } = data;
  return (
    <>
      <Button component={Link} to="/companies" sx={{ mb: 1 }}>&larr; Back</Button>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5">{company.name}</Typography>
        <Typography color="text.secondary">Industry: {company.industry || '-'}</Typography>
        <Typography color="text.secondary">Location: {company.location || '-'}</Typography>
      </Paper>
      <Typography variant="h6" gutterBottom>Associated Leads</Typography>
      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Status</TableCell><TableCell>Assigned To</TableCell></TableRow></TableHead>
          <TableBody>
            {leads.map((l) => (
              <TableRow key={l._id}>
                <TableCell>{l.name}</TableCell><TableCell>{l.email}</TableCell><TableCell><Chip size="small" label={l.status} color={leadColor[l.status] || 'default'} sx={{ fontWeight: 600 }} /></TableCell><TableCell>{l.assignedTo?.name || '-'}</TableCell>
              </TableRow>
            ))}
            {leads.length === 0 && <TableRow><TableCell colSpan={4} align="center">No leads for this company</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
