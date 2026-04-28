import asyncHandler from 'express-async-handler';
import AlloyBoreSize from './AlloyBoreSizeModel.js';
import checkRequired from '../../utils/checkRequired.js';

const getAlloyBores = asyncHandler(async (req, res) => {
  const pageSize = Number(process.env.LIMIT) || 50;
  const page = Number(req.query.pageNumber) || 1;
  const count = await AlloyBoreSize.countDocuments({});
  const items = await AlloyBoreSize.find({})
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });
  res.json({ items, page, pages: Math.ceil(count / pageSize), count });
});

const getAllAlloyBores = asyncHandler(async (req, res) => {
  const items = await AlloyBoreSize.find({}).limit(200).sort({ name: 1 });
  res.json(items);
});

const getAlloyBoreById = asyncHandler(async (req, res) => {
  const item = await AlloyBoreSize.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Alloy Bore not found');
  }
  res.json(item);
});

const createAlloyBore = asyncHandler(async (req, res) => {
  const data = checkRequired(req.body);
  data.name = (data.name || '').trim();
  delete data.boreSizeMM;
  delete data.description;
  if (req.user) data.created_by = req.user._id;
  const created = await AlloyBoreSize.create(data);
  res.status(201).json(created);
});

const updateAlloyBore = asyncHandler(async (req, res) => {
  const feed = checkRequired(req.body);
  if (feed.name) feed.name = feed.name.trim();
  delete feed.boreSizeMM;
  delete feed.description;
  if (req.user) feed.updated_by = req.user._id;
  const doc = await AlloyBoreSize.findById(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Alloy Bore not found');
  }
  Object.assign(doc, feed);
  const updated = await doc.save();
  res.json(updated);
});

const deleteAlloyBore = asyncHandler(async (req, res) => {
  const doc = await AlloyBoreSize.findById(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Alloy Bore not found');
  }
  await doc.remove();
  res.json({ message: 'Alloy Bore removed' });
});

export {
  getAlloyBores,
  getAllAlloyBores,
  getAlloyBoreById,
  createAlloyBore,
  updateAlloyBore,
  deleteAlloyBore,
};
