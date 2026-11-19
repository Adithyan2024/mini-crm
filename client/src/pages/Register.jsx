import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import AuthShell from '../components/AuthShell';
import PasswordField from '../components/PasswordField';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api/axios';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const errors = {
    name: !form.name.trim() ? 'Name is required' : '',
    email: !form.email ? 'Email is required' : !/^\S+@\S+\.\S+$/.test(form.email) ? 'Enter a valid email' : '',
    password: !form.password ? 'Password is required' : form.password.length < 6 ? 'At least 6 characters' : '',
    confirm: form.confirm !== form.password ? 'Passwords do not match' : '',
  };
  const shown = (k) => (touched ? errors[k] : '');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setError('');
    if (Object.values(errors).some(Boolean)) return;
    setLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Sign up to start managing your leads"
      footer={<Typography variant="body2" color="text.secondary">Already have an account? <Link to="/login">Login</Link></Typography>}
    >
      <Box component="form" onSubmit={submit} noValidate sx={{ display: 'grid', gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Full name" autoComplete="name" value={form.name} onChange={set('name')} error={!!shown('name')} helperText={shown('name')} />
        <TextField label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={!!shown('email')} helperText={shown('email')} />
        <PasswordField label="Password" autoComplete="new-password" value={form.password} onChange={set('password')} error={!!shown('password')} helperText={shown('password')} />
        <PasswordField label="Confirm password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={!!shown('confirm')} helperText={shown('confirm')} />
        <Button type="submit" variant="contained" size="large" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</Button>
      </Box>
    </AuthShell>
  );
}
