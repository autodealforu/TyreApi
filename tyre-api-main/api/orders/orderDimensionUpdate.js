import asyncHandler from 'express-async-handler';
import Order from './OrderModel.js';

// @desc    Update a order
// @route   PUT /api/orders/:id
// @access  Private
const orderDimensionsUpdate = asyncHandler(async (req, res) => {
  try {
    const { length, width, height, breadth, weight } = req.body;
    const data = await Order.findById(req.params.id);

    if (data) {
      data.set({
        courier_details: {
          length,
          width,
          height,
          breadth,
          weight,
        },
      });
      await data.save();
      res.json(data);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    console.log(error);
    res.status(502);
    throw new Error('Something Went Wrong.');
  }
});
export { orderDimensionsUpdate };
