import { Box, Stack, Typography } from '@mui/material';
import HubRounded from '@mui/icons-material/HubRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';

const points = ['Track every lead from first contact to close', 'Keep companies and contacts together', 'Assign tasks so nothing slips'];

// shared split-screen layout for Login and Register
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' } }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'center', p: 8, color: '#fff',
          background: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#0ea5e9 100%)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 5 }}>
          <HubRounded sx={{ fontSize: 40 }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Mini CRM</Typography>
        </Stack>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.15 }}>Keep every lead moving.</Typography>
        <Typography sx={{ opacity: 0.85, maxWidth: 440, mb: 4 }}>A simple workspace for your sales team.</Typography>
        <Stack spacing={1.5}>
          {points.map((p) => (
            <Stack key={p} direction="row" spacing={1.5} alignItems="center">
              <CheckCircleRounded sx={{ opacity: 0.9 }} />
              <Typography>{p}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
      <Box sx={{ display: 'grid', placeItems: 'center', p: 3, bgcolor: 'background.default' }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ display: { xs: 'flex', md: 'none' }, mb: 3, color: 'primary.main' }}>
            <HubRounded />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>MINI CRM</Typography>
          </Stack>
          <Typography variant="h5">{title}</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>{subtitle}</Typography>
          {children}
          <Box sx={{ mt: 3, textAlign: 'center' }}>{footer}</Box>
        </Box>
      </Box>
    </Box>
  );
}
