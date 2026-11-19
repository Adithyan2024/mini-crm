const router = require('express').Router();
const Task = require('../models/Task');
const Lead = require('../models/Lead');
const User = require('../models/User');

const populate = [{ path: 'lead', select: 'name' }, { path: 'assignedTo', select: 'name email' }];

// list tasks (optional ?mine=true to show only my tasks)
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.mine === 'true') filter.assignedTo = req.user._id;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.lead) filter.lead = req.query.lead;
    res.json(await Task.find(filter).populate(populate).sort('dueDate'));
  } catch (e) { next(e); }
});

// any logged-in user can create a task for a lead and assign it to any user
router.post('/', async (req, res, next) => {
  try {
    const { title, lead, assignedTo, dueDate } = req.body;
    if (lead && !(await Lead.exists({ _id: lead }))) return res.status(400).json({ message: 'Lead not found' });
    if (assignedTo && !(await User.exists({ _id: assignedTo }))) return res.status(400).json({ message: 'Assignee not found' });
    const task = await Task.create({ title, lead, assignedTo, dueDate, createdBy: req.user._id });
    res.status(201).json(await task.populate(populate));
  } catch (e) { next(e); }
});

// AUTHORIZATION: only the user the task is assigned to may change its status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (String(task.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the assigned user can update this task' });
    }
    task.status = req.body.status;
    await task.save();
    res.json(await task.populate(populate));
  } catch (e) { next(e); }
});

module.exports = router;
