import asyncHandler from 'express-async-handler';
import AlloyPCD from './AlloyPCDModel.js';
import checkRequired from '../../utils/checkRequired.js';

const getAlloyPCDs = asyncHandler(async (req, res) => {
  const pageSize = Number(process.env.LIMIT) || 50;
  const page = Number(req.query.pageNumber) || 1;
  const count = await AlloyPCD.countDocuments({});
  const items = await AlloyPCD.find({})
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });
  res.json({ items, page, pages: Math.ceil(count / pageSize), count });
});

const getAllAlloyPCDs = asyncHandler(async (req, res) => {
  const items = await AlloyPCD.find({}).limit(200).sort({ name: 1 });
  res.json(items);
});

const getAlloyPCDById = asyncHandler(async (req, res) => {
  const item = await AlloyPCD.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Alloy PCD not found');
  }
  res.json(item);
});

const createAlloyPCD = asyncHandler(async (req, res) => {
  const data = checkRequired(req.body);
  data.name = (data.name || '').trim();
  // Drop extended fields to keep only name
  delete data.pcdValue;
  delete data.numberOfBolts;
  delete data.diameter;
  delete data.description;
  if (req.user) data.created_by = req.user._id;
  const created = await AlloyPCD.create(data);
  res.status(201).json(created);
});

const updateAlloyPCD = asyncHandler(async (req, res) => {
  const feed = checkRequired(req.body);
  if (feed.name) feed.name = feed.name.trim();
  delete feed.pcdValue;
  delete feed.numberOfBolts;
  delete feed.diameter;
  delete feed.description;
  if (req.user) feed.updated_by = req.user._id;
  const doc = await AlloyPCD.findById(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Alloy PCD not found');
  }
  Object.assign(doc, feed);
  const updated = await doc.save();
  res.json(updated);
});

const deleteAlloyPCD = asyncHandler(async (req, res) => {
  const doc = await AlloyPCD.findById(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Alloy PCD not found');
  }
  await doc.remove();
  res.json({ message: 'Alloy PCD removed' });
});

export {
  getAlloyPCDs,
  getAllAlloyPCDs,
  getAlloyPCDById,
  createAlloyPCD,
  updateAlloyPCD,
  deleteAlloyPCD,
};
