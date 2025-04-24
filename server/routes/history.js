const express = require('express');
const router = express.Router();
const History = require('../models/History');

// Get play history for a user
router.get('/:userId', async (req, res) => {
  const history = await History.find({ user_id: req.params.userId });
  res.json(history);
});

// Add a play record
router.post('/', async (req, res) => {
  const record = new History(req.body);
  await record.save();
  res.status(201).json(record);
});

module.exports = router;
