const router = require('express').Router();
const Company = require('../models/Company');
const Lead = require('../models/Lead');

router.post('/', async (req, res, next) => {
  try {
    const { name, industry, location } = req.body;
    res.status(201).json(await Company.create({ name, industry, location }));
  } catch (e) { next(e); }
});

router.get('/', async (_req, res, next) => {
  try { res.json(await Company.find().sort('name')); } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    // Lead queries auto-exclude soft-deleted leads
    const leads = await Lead.find({ company: company._id }).populate('assignedTo', 'name').sort('-createdAt');
    res.json({ company, leads });
  } catch (e) { next(e); }
});

module.exports = router;
