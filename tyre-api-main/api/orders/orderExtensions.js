import asyncHandler from 'express-async-handler';
import Order from './OrderModel.js';

// @desc    Add order note
// @route   POST /api/orders/:id/notes
// @access  Private
const addOrderNote = asyncHandler(async (req, res) => {
  try {
    const { note, note_type } = req.body;

    if (!note) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required',
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check user permissions
    if (req.user) {
      const canAddNote =
        req.user.role === 'ADMIN' ||
        req.user.role === 'SUPER_ADMIN' ||
        (req.user.role === 'VENDOR' &&
          order.vendor_commissions.some(
            (vc) => vc.vendor.toString() === req.user._id.toString()
          )) ||
        (req.user.role === 'CUSTOMER' &&
          order.customer.customer &&
          order.customer.customer.toString() === req.user._id.toString());

      if (!canAddNote) {
        return res.status(403).json({
          success: false,
          message:
            'Access denied. You do not have permission to add notes to this order.',
        });
      }
    }

    // Initialize order_notes if it doesn't exist
    if (!order.order_notes) {
      order.order_notes = [];
    }

    order.order_notes.push({
      note,
      added_by: req.user._id,
      note_type: note_type || 'INTERNAL',
      created_at: new Date(),
    });

    order.updated_by = req.user._id;
    const updatedOrder = await order.save();

    // Populate the response
    const populatedOrder = await Order.findById(updatedOrder._id).populate(
      'order_notes.added_by',
      'name email role'
    );

    res.json({
      success: true,
      order: populatedOrder,
      message: 'Order note added successfully',
    });
  } catch (error) {
    console.error('Add Order Note Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong while adding order note.',
    });
  }
});

// @desc    Get order notes
// @route   GET /api/orders/:id/notes
// @access  Private
const getOrderNotes = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('order_notes.added_by', 'name email role')
      .select('order_notes');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      notes: order.order_notes || [],
      message: 'Order notes retrieved successfully',
    });
  } catch (error) {
    console.error('Get Order Notes Error:', error);
    res.status(500).json({
      success: false,
      message:
        error.message || 'Something went wrong while fetching order notes.',
    });
  }
});

// @desc    Schedule installation
// @route   PUT /api/orders/:id/installation/schedule
// @access  Private
const scheduleInstallation = asyncHandler(async (req, res) => {
  try {
    const {
      option,
      scheduled_date,
      scheduled_time_slot,
      installation_address,
      special_instructions,
    } = req.body;

    if (!option) {
      return res.status(400).json({
        success: false,
        message: 'Installation option is required',
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Initialize installation_details if it doesn't exist
    if (!order.installation_details) {
      order.installation_details = {};
    }

    order.installation_details.option = option;

    if (scheduled_date) {
      order.installation_details.scheduled_date = new Date(scheduled_date);
    }

    if (scheduled_time_slot) {
      order.installation_details.scheduled_time_slot = scheduled_time_slot;
    }

    if (installation_address && option === 'HOME') {
      order.installation_details.installation_address = installation_address;
    }

    if (special_instructions) {
      order.installation_details.special_instructions = special_instructions;
    }

    // Update order status if installation is scheduled
    if (scheduled_date && order.status === 'DELIVERED') {
      order.status = 'INSTALLATION_SCHEDULED';
    }

    order.updated_by = req.user._id;

    // Add order note
    if (!order.order_notes) {
      order.order_notes = [];
    }

    order.order_notes.push({
      note: `Installation scheduled for ${scheduled_date} at ${scheduled_time_slot} (${option})`,
      added_by: req.user._id,
      note_type: 'INTERNAL',
      created_at: new Date(),
    });

    const updatedOrder = await order.save();

    res.json({
      success: true,
      order: updatedOrder,
      message: 'Installation scheduled successfully',
    });
  } catch (error) {
    console.error('Schedule Installation Error:', error);
    res.status(500).json({
      success: false,
      message:
        error.message || 'Something went wrong while scheduling installation.',
    });
  }
});

// @desc    Update installation status
// @route   PUT /api/orders/:id/installation/status
// @access  Private
const updateInstallationStatus = asyncHandler(async (req, res) => {
  try {
    const { status, completion_notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Installation status is required',
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Update order status based on installation status
    if (status === 'COMPLETED') {
      order.status = 'INSTALLATION_COMPLETED';
    } else if (status === 'PENDING') {
      order.status = 'INSTALLATION_PENDING';
    } else if (status === 'SCHEDULED') {
      order.status = 'INSTALLATION_SCHEDULED';
    }

    order.updated_by = req.user._id;

    // Add order note
    if (!order.order_notes) {
      order.order_notes = [];
    }

    order.order_notes.push({
      note: `Installation status updated to ${status}${
        completion_notes ? `. Notes: ${completion_notes}` : ''
      }`,
      added_by: req.user._id,
      note_type: 'INTERNAL',
      created_at: new Date(),
    });

    const updatedOrder = await order.save();

    res.json({
      success: true,
      order: updatedOrder,
      message: 'Installation status updated successfully',
    });
  } catch (error) {
    console.error('Update Installation Status Error:', error);
    res.status(500).json({
      success: false,
      message:
        error.message ||
        'Something went wrong while updating installation status.',
    });
  }
});

// @desc    Get vendor orders (for vendor dashboard)
// @route   GET /api/orders/vendor/:vendorId
// @access  Private
const getVendorOrders = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;

    let searchParams = {
      published_status: 'PUBLISHED',
      'vendor_commissions.vendor': vendorId,
    };

    // Additional filters
    if (req.query.status) {
      searchParams['status'] = req.query.status;
    }

    if (req.query.payment_status) {
      searchParams['payment_details.payment_status'] = req.query.payment_status;
    }

    const count = await Order.countDocuments(searchParams);
    const orders = await Order.find(searchParams)
      .limit(pageSize)
      .populate('products.product', 'name slug brand size')
      .populate('products.vendor', 'name store_name')
      .populate('customer.customer', 'name email phone')
      .populate('vendor_commissions.vendor', 'name store_name')
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      count: count,
      message: 'Vendor orders retrieved successfully',
    });
  } catch (error) {
    console.error('Get Vendor Orders Error:', error);
    res.status(500).json({
      success: false,
      message:
        error.message || 'Something went wrong while fetching vendor orders.',
    });
  }
});

export {
  addOrderNote,
  getOrderNotes,
  scheduleInstallation,
  updateInstallationStatus,
  getVendorOrders,
};
