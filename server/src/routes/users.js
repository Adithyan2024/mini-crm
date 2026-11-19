const router = require('express').Router();
const User = require('../models/User');

// used by the "Assigned To" dropdowns
router.get('/', async (_req, res, next) => {
  try { res.json(await User.find().select('name email').sort('name')); } catch (e) { next(e); }
});

module.exports = router;
