// Creates the initial login users only (the UI has no register screen).
// Safe to re-run: skips users that already exist and never deletes data.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const users = [
  { name: 'John', email: 'john@mail.com', password: 'password123' },
  { name: 'Priya', email: 'priya@mail.com', password: 'password123' },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  for (const u of users) {
    if (await User.exists({ email: u.email })) console.log('exists:', u.email);
    else { await User.create(u); console.log('created:', u.email); }
  }
  process.exit(0);
})();
