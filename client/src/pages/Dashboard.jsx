import { useQuery } from '@tanstack/react-query';
import { alpha } from '@mui/material/styles';
import { Alert, Box, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import PeopleAltRounded from '@mui/icons-material/PeopleAltRounded';
import VerifiedRounded from '@mui/icons-material/VerifiedRounded';
import EventRounded from '@mui/icons-material/EventRounded';
import TaskAltRounded from '@mui/icons-material/TaskAltRounded';
import api, { errMsg } from '../api/axios';
import { useAuth } from '../context/AuthContext';

const cards = [
  ['Total Leads', 'totalLeads', PeopleAltRounded, '#4f46e5'],
  ['Qualified Leads', 'qualifiedLeads', VerifiedRounded, '#16a34a'],
  ['Tasks Due Today', 'tasksDueToday', EventRounded, '#d97706'],
  ['Completed Tasks', 'completedTasks', TaskAltRounded, '#0284c7'],
];

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({ queryKey: ['dashboard'], queryFn: async () => (await api.get('/dashboard')).data });
  return (
    <>
      <Typography variant="h5">Dashboard</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Welcome back, {user?.name}</Typography>
      {isLoading && <CircularProgress />}
      {error && <Alert severity="error">{errMsg(error)}</Alert>}
      {data && (
        <Grid container spacing={2.5}>
          {cards.map(([label, key, Icon, color]) => (
            <Grid item xs={12} sm={6} lg={3} key={key}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: alpha(color, 0.12), color }}>
                  <Icon />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="h4">{data[key]}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}
