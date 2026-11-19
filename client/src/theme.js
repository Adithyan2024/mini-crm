import { createTheme } from '@mui/material/styles';

export default createTheme({
  palette: {
    primary: { main: '#4f46e5' },
    secondary: { main: '#0ea5e9' },
    background: { default: '#f5f6fa' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter","Segoe UI",Roboto,Helvetica,Arial,sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none', '&.MuiPaper-elevation1': { boxShadow: '0 1px 3px rgba(16,24,40,.06)', border: '1px solid #eceef5' } },
      },
    },
    MuiTableHead: {
      styleOverrides: { root: { backgroundColor: '#f0f1f9', '& .MuiTableCell-root': { fontWeight: 600, color: '#475569' } } },
    },
    MuiTableRow: { styleOverrides: { root: { '&:last-child td': { borderBottom: 0 } } } },
  },
});
