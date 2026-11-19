const router = require('express').Router();
const Lead = require('../models/Lead');
const Task = require('../models/Task');

router.get('/', async (_req, res, next) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);

    // Lead pre-aggregate hook already strips soft-deleted leads
    const [leadStats, taskStats] = await Promise.all([
      Lead.aggregate([
        { $group: { _id: null, total: { $sum: 1 }, qualified: { $sum: { $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0] } } } },
      ]),
      Task.aggregate([
        {
          $group: {
            _id: null,
            completed: { $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] } },
            dueToday: {
              $sum: { $cond: [{ $and: [{ $ne: ['$status', 'Done'] }, { $gte: ['$dueDate', start] }, { $lt: ['$dueDate', end] }] }, 1, 0] },
            },
          },
        },
      ]),
    ]);
    res.json({
      totalLeads: leadStats[0]?.total || 0,
      qualifiedLeads: leadStats[0]?.qualified || 0,
      tasksDueToday: taskStats[0]?.dueToday || 0,
      completedTasks: taskStats[0]?.completed || 0,
    });
  } catch (e) { next(e); }
});

module.exports = router;
