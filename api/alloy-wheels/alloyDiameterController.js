import asyncHandler from 'express-async-handler';
import AlloyDiameter from './AlloyDiameterModel.js';
import checkRequired from '../../utils/checkRequired.js';

const getAlloyDiameters = asyncHandler(async (req, res) => {
  const pageSize = Number(process.env.LIMIT) || 50;
  const page = Number(req.query.pageNumber) || 1;
  const count = await AlloyDiameter.countDocuments({});
  const items = await AlloyDiameter.find({})
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });
  res.json({ items, page, pages: Math.ceil(count / pageSize), count });
});

const getAllAlloyDiameters = asyncHandler(async (req, res) => {
  const items = await AlloyDiameter.find({}).limit(200).sort({ name: 1 });
  res.json(items);
});

const getAlloyDiameterById = asyncHandler(async (req, res) => {
  const item = await AlloyDiameter.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Alloy Diameter not found');
  }
  res.json(item);
});

const createAlloyDiameter = asyncHandler(async (req, res) => {
  const data = checkRequired(req.body);
  // Expect only name like Tyre Rim Diameter
  data.name = (data.name || '').trim();
  delete data.diameterInches;
  delete data.description;
  if (req.user) data.created_by = req.user._id;
  const created = await AlloyDiameter.create(data);
  res.status(201).json(created);
});

const updateAlloyDiameter = asyncHandler(async (req, res) => {
  const feed = checkRequired(req.body);
  if (feed.name) feed.name = feed.name.trim();
  delete feed.diameterInches;
  delete feed.description;
  if (req.user) feed.updated_by = req.user._id;
  const doc = await AlloyDiameter.findById(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Alloy Diameter not found');
  }
  Object.assign(doc, feed);
  const updated = await doc.save();
  res.json(updated);
});

const deleteAlloyDiameter = asyncHandler(async (req, res) => {
  const doc = await AlloyDiameter.findById(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Alloy Diameter not found');
  }
  await doc.remove();
  res.json({ message: 'Alloy Diameter removed' });
});

export {
  getAlloyDiameters,
  getAllAlloyDiameters,
  getAlloyDiameterById,
  createAlloyDiameter,
  updateAlloyDiameter,
  deleteAlloyDiameter,
};
