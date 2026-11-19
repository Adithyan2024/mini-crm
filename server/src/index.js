require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { auth } = require('./middleware/auth');

const app = express();
app.use(cors({ origin: (process.env.CLIENT_URL || '*').split(',') }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
// every route below requires a valid access token
app.use('/api/users', auth, require('./routes/users'));
app.use('/api/leads', auth, require('./routes/leads'));
app.use('/api/companies', auth, require('./routes/companies'));
app.use('/api/tasks', auth, require('./routes/tasks'));
app.use('/api/dashboard', auth, require('./routes/dashboard'));

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, _req, res, _next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id' });
  if (err.code === 11000) return res.status(409).json({ message: 'Duplicate value: ' + Object.keys(err.keyValue).join(', ') });
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log('API on port ' + PORT)))
  .catch((e) => { console.error('Mongo connection failed', e.message); process.exit(1); });
