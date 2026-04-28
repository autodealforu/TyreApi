import asyncHandler from 'express-async-handler';
import AlloyFinish from './AlloyFinishModel.js';
import checkRequired from '../../utils/checkRequired.js';

const getAlloyFinishes = asyncHandler(async (req, res) => {
  const pageSize = Number(process.env.LIMIT) || 50;
  const page = Number(req.query.pageNumber) || 1;
  const count = await AlloyFinish.countDocuments({});
  const items = await AlloyFinish.find({})
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });
  res.json({ items, page, pages: Math.ceil(count / pageSize), count });
});

const getAllAlloyFinishes = asyncHandler(async (req, res) => {
  const items = await AlloyFinish.find({}).limit(200).sort({ name: 1 });
  res.json(items);
});

const getAlloyFinishById = asyncHandler(async (req, res) => {
  const item = await AlloyFinish.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Alloy Finish not found');
  }
  res.json(item);
});

const createAlloyFinish = asyncHandler(async (req, res) => {
  const data = checkRequired(req.body);
  data.name = (data.name || '').trim();
  delete data.finishType;
  delete data.color;
  if (req.user) data.created_by = req.user._id;
  const created = await AlloyFinish.create(data);
  res.status(201).json(created);
});

const updateAlloyFinish = asyncHandler(async (req, res) => {
  const feed = checkRequired(req.body);
  if (feed.name) feed.name = feed.name.trim();
  delete feed.finishType;
  delete feed.color;
  if (req.user) feed.updated_by = req.user._id;
  const doc = await AlloyFinish.findById(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Alloy Finish not found');
  }
  Object.assign(doc, feed);
  const updated = await doc.save();
  res.json(updated);
});

const deleteAlloyFinish = asyncHandler(async (req, res) => {
  const doc = await AlloyFinish.findById(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Alloy Finish not found');
  }
  await doc.remove();
  res.json({ message: 'Alloy Finish removed' });
});

export {
  getAlloyFinishes,
  getAllAlloyFinishes,
  getAlloyFinishById,
  createAlloyFinish,
  updateAlloyFinish,
  deleteAlloyFinish,
};
