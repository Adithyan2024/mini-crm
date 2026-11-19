const router = require('express').Router();
const Lead = require('../models/Lead');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const populate = [{ path: 'assignedTo', select: 'name email' }, { path: 'company', select: 'name' }];
const pick = (b) => {
  const out = {};
  ['name', 'email', 'phone', 'status', 'assignedTo', 'company'].forEach((k) => {
    if (b[k] !== undefined) out[k] = b[k] === '' ? undefined : b[k];
  });
  return out;
};

// list: pagination + search + status filter
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const rx = new RegExp(escapeRegex(req.query.search), 'i');
      filter.$or = [{ name: rx }, { email: rx }];
    }
    const [items, total] = await Promise.all([
      Lead.find(filter).populate(populate).sort('-createdAt').skip((page - 1) * limit).limit(limit),
      Lead.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const lead = await Lead.create(pick(req.body));
    res.status(201).json(lead);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id).populate(populate);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    lead.set(pick(req.body));
    await lead.save();
    res.json(lead);
  } catch (e) { next(e); }
});

// dedicated status update
router.patch('/:id/status', async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    lead.status = req.body.status;
    await lead.save();
    res.json(lead);
  } catch (e) { next(e); }
});

// soft delete
router.delete('/:id', async (req, res, next) => {
  try {
    const lead = await Lead.findOneAndUpdate({ _id: req.params.id }, { isDeleted: true, deletedAt: new Date() }, { new: true });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
