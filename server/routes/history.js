const expressHistory = require('express');
const History = require('../models/History');
const authHistory = require('../middleware/auth');
const historyRouter = expressHistory.Router();

historyRouter.use(authHistory);
historyRouter.get('/:userId', async (req, res) => {
  const history = await History.find({ user_id: req.params.userId });
  res.json(history);
});
historyRouter.post('/', async (req, res) => {
  const record = await History.create(req.body);
  res.status(201).json(record);
});
module.exports = historyRouter;