import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import AuthShell from '../components/AuthShell';
import PasswordField from '../components/PasswordField';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api/axios';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setError('');
    if (!form.email || !form.password) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your account to continue"
      footer={<Typography variant="body2" color="text.secondary">Don&apos;t have an account? <Link to="/register">Register</Link></Typography>}
    >
      <Box component="form" onSubmit={submit} noValidate sx={{ display: 'grid', gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={touched && !form.email} helperText={touched && !form.email ? 'Email is required' : ''} />
        <PasswordField label="Password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={touched && !form.password} helperText={touched && !form.password ? 'Password is required' : ''} />
        <Button type="submit" variant="contained" size="large" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
      </Box>
    </AuthShell>
  );
}
