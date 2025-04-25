const expressGenres = require('express');
const Genre = require('../models/Genre');
const authGenres = require('../middleware/auth');
const genreRouter = expressGenres.Router();

genreRouter.use(authGenres);
genreRouter.get('/', async (req, res) => {
  const genres = await Genre.find();
  res.json(genres);
});
genreRouter.post('/', async (req, res) => {
  const genre = await Genre.create(req.body);
  res.status(201).json(genre);
});
module.exports = genreRouter;