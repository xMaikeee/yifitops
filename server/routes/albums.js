const expressAlbums = require('express');
const Album = require('../models/Album');
const authAlbums = require('../middleware/auth');
const albumRouter = expressAlbums.Router();

albumRouter.use(authAlbums);
albumRouter.get('/', async (req, res) => {
  const albums = await Album.find();
  res.json(albums);
});
albumRouter.post('/', async (req, res) => {
  const album = await Album.create(req.body);
  res.status(201).json(album);
});
module.exports = albumRouter;
