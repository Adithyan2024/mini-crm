const mongoose = require('mongoose');

const STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
    phone: { type: String, trim: true },
    status: { type: String, enum: { values: STATUSES, message: 'Invalid status' }, default: 'New' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,
  },
  { timestamps: true }
);

// Soft delete safety net: every normal read/update query automatically excludes
// deleted leads. Pass .setOptions({ withDeleted: true }) to bypass deliberately.
['find', 'findOne', 'findOneAndUpdate', 'countDocuments', 'updateOne', 'updateMany'].forEach((op) => {
  leadSchema.pre(op, function (next) {
    if (!this.getOptions().withDeleted) this.where({ isDeleted: false });
    next();
  });
});
// aggregate() does not go through query hooks, so exclude deleted leads there too
leadSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: false } });
  next();
});

const Lead = mongoose.model('Lead', leadSchema);
Lead.STATUSES = STATUSES;
module.exports = Lead;
