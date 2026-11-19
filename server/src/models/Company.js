const mongoose = require('mongoose');

module.exports = mongoose.model(
  'Company',
  new mongoose.Schema(
    {
      name: { type: String, required: [true, 'Company name is required'], trim: true },
      industry: { type: String, trim: true },
      location: { type: String, trim: true },
    },
    { timestamps: true }
  )
);
