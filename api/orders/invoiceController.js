import Order from './OrderModel.js';
import PDFDocument from 'pdfkit';

/**
 * Helper to format currency in INR
 */
const formatCurrency = (amount) => {
  return `Rs. ${(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Helper to format dates
 */
const formatDate = (dateInput) => {
  if (!dateInput) return new Date().toLocaleDateString('en-IN');
  return new Date(dateInput).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Generate PDF Tax Invoice for an Order
 * GET /api/orders/:id/invoice
 */
export const generateOrderInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;

    // Find order by Mongo _id or numeric order_id
    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id).populate('customer.customer', 'name email phone');
    } else {
      order = await Order.findOne({ order_id: Number(id) }).populate('customer.customer', 'name email phone');
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Invoice details
    const orderYear = new Date(order.order_date || Date.now()).getFullYear();
    const invoiceNum = order.invoice_number || `INV-${orderYear}-${order.order_id || order._id.toString().slice(-6)}`;
    const invoiceDateStr = formatDate(order.invoice_date || order.order_date || Date.now());

    // Create PDF Document
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    // Set Response Headers for PDF Download / Inline view
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="Invoice_${order.order_id || 'order'}.pdf"`
    );

    doc.pipe(res);

    // --- COLOR PALETTE ---
    const primaryColor = '#1A365D'; // Navy
    const secondaryColor = '#2B6CB0'; // Slate Blue
    const darkTextColor = '#2D3748';
    const lightBgColor = '#F7FAFC';
    const borderColor = '#E2E8F0';

    // --- HEADER SECTION ---
    doc
      .fillColor(primaryColor)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('AUTODEAL4U / TYRE MULTIVENDOR', 40, 40);

    doc
      .fillColor(darkTextColor)
      .fontSize(9)
      .font('Helvetica')
      .text(process.env.ADDRESS || '3rd Floor, Shree Ram Palace, Bhoja Market, Sector 27', 40, 68)
      .text('Noida, 201301, Uttar Pradesh, India', 40, 80)
      .text(`Email: ${process.env.ADMIN_EMAIL || 'support@autodeal4u.in'} | Web: ${process.env.URI_SITE || 'https://autodeal4u.in'}`, 40, 92);

    // INVOICE BADGE (Top Right)
    doc
      .fillColor(primaryColor)
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('TAX INVOICE', 380, 40, { align: 'right' });

    doc
      .fillColor(darkTextColor)
      .fontSize(9)
      .font('Helvetica')
      .text(`Invoice No: ${invoiceNum}`, 380, 68, { align: 'right' })
      .text(`Invoice Date: ${invoiceDateStr}`, 380, 80, { align: 'right' })
      .text(`Order ID: #${order.order_id || order._id.toString().slice(-6)}`, 380, 92, { align: 'right' })
      .text(`Payment Method: ${order.payment_method || 'ONLINE'}`, 380, 104, { align: 'right' })
      .text(`Payment Status: ${order.is_paid ? 'PAID' : 'PENDING'}`, 380, 116, { align: 'right' });

    // Divider Line
    doc
      .moveTo(40, 135)
      .lineTo(555, 135)
      .strokeColor(borderColor)
      .lineWidth(1)
      .stroke();

    // --- ADDRESSES SECTION ---
    const addrY = 145;

    // Box background for Customer & Shipping
    doc
      .rect(40, addrY, 250, 90)
      .fillAndStroke(lightBgColor, borderColor);

    doc
      .rect(305, addrY, 250, 90)
      .fillAndStroke(lightBgColor, borderColor);

    // Billed To Header
    doc
      .fillColor(primaryColor)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('BILLED TO', 50, addrY + 8);

    const custName = order.customer?.name || 'Customer';
    const custPhone = order.customer?.phone || '';
    const custEmail = order.customer?.email || '';
    const billAddr = order.billing_address || order.shipping_address || {};

    doc
      .fillColor(darkTextColor)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(custName, 50, addrY + 22)
      .font('Helvetica')
      .text(`${billAddr.address_1 || ''} ${billAddr.address_2 || ''}`, 50, addrY + 34, { width: 230 })
      .text(`${billAddr.city || ''}${billAddr.state ? ', ' + billAddr.state : ''} - ${billAddr.pin || ''}`, 50, addrY + 48)
      .text(`Phone: ${custPhone} ${custEmail ? '| Email: ' + custEmail : ''}`, 50, addrY + 62, { width: 230 });

    // Shipped To Header
    doc
      .fillColor(primaryColor)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('SHIPPED TO', 315, addrY + 8);

    const shipAddr = order.shipping_address || {};
    doc
      .fillColor(darkTextColor)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(custName, 315, addrY + 22)
      .font('Helvetica')
      .text(`${shipAddr.address_1 || ''} ${shipAddr.address_2 || ''}`, 315, addrY + 34, { width: 230 })
      .text(`${shipAddr.city || ''}${shipAddr.state ? ', ' + shipAddr.state : ''} - ${shipAddr.pin || ''}`, 315, addrY + 48)
      .text(`Installation Option: ${order.installation_details?.option || 'NONE'}`, 315, addrY + 62, { width: 230 });

    // --- PRODUCTS TABLE ---
    let tableY = 250;

    // Table Header Bar
    doc
      .rect(40, tableY, 515, 22)
      .fill(secondaryColor);

    doc
      .fillColor('#FFFFFF')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('#', 45, tableY + 6)
      .text('ITEM DESCRIPTION', 70, tableY + 6)
      .text('QTY', 340, tableY + 6, { width: 40, align: 'center' })
      .text('PRICE', 390, tableY + 6, { width: 75, align: 'right' })
      .text('TOTAL', 475, tableY + 6, { width: 75, align: 'right' });

    tableY += 22;

    // Items list
    const items = order.products || [];
    items.forEach((item, index) => {
      const itemBg = index % 2 === 0 ? '#FFFFFF' : lightBgColor;
      const rowHeight = 28;

      doc
        .rect(40, tableY, 515, rowHeight)
        .fillAndStroke(itemBg, borderColor);

      const price = item.sale_price || item.regular_price || 0;
      const lineTotal = price * (item.quantity || 1);
      const prodName = `${item.name || 'Product'} ${item.size ? '(' + item.size + ')' : ''}`;
      const vendorInfo = item.vendor_details?.store_name ? `Vendor: ${item.vendor_details.store_name}` : '';

      doc
        .fillColor(darkTextColor)
        .fontSize(9)
        .font('Helvetica')
        .text((index + 1).toString(), 45, tableY + 8)
        .font('Helvetica-Bold')
        .text(prodName, 70, tableY + 4, { width: 260, ellipsis: true })
        .font('Helvetica')
        .fillColor('#718096')
        .fontSize(8)
        .text(vendorInfo, 70, tableY + 16, { width: 260, ellipsis: true })
        .fillColor(darkTextColor)
        .fontSize(9)
        .text((item.quantity || 1).toString(), 340, tableY + 8, { width: 40, align: 'center' })
        .text(formatCurrency(price), 390, tableY + 8, { width: 75, align: 'right' })
        .text(formatCurrency(lineTotal), 475, tableY + 8, { width: 75, align: 'right' });

      tableY += rowHeight;
    });

    tableY += 10;

    // --- SUMMARY BREAKDOWN ---
    const summaryX = 320;
    const summaryWidth = 235;

    const subtotal = order.sub_total || 0;
    const delivery = order.delivery_charges || 0;
    const installation = order.installation_details?.total_installation_fee || 0;
    const discount = order.discount || 0;
    const tax = order.tax || 0;
    const grandTotal = order.total_amount || (subtotal + delivery + installation + tax - discount);

    const summaryRows = [
      { label: 'Subtotal:', value: formatCurrency(subtotal) },
      { label: 'Delivery Charges:', value: delivery > 0 ? formatCurrency(delivery) : 'FREE' },
      { label: 'Installation Fee:', value: installation > 0 ? formatCurrency(installation) : 'Included / N/A' },
      { label: 'Discount / Coupon:', value: discount > 0 ? `- ${formatCurrency(discount)}` : 'Rs. 0.00' },
      { label: 'GST / Tax (Included):', value: formatCurrency(tax) },
    ];

    summaryRows.forEach((row) => {
      doc
        .fillColor(darkTextColor)
        .fontSize(9)
        .font('Helvetica')
        .text(row.label, summaryX, tableY, { width: 130, align: 'left' })
        .text(row.value, summaryX + 130, tableY, { width: 105, align: 'right' });

      tableY += 16;
    });

    // Grand Total Highlight Bar
    tableY += 5;
    doc
      .rect(summaryX, tableY, summaryWidth, 24)
      .fill(primaryColor);

    doc
      .fillColor('#FFFFFF')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('GRAND TOTAL:', summaryX + 10, tableY + 6)
      .text(formatCurrency(grandTotal), summaryX + 110, tableY + 6, { width: 115, align: 'right' });

    // --- FOOTER & TERMS ---
    const footerY = 700;
    doc
      .moveTo(40, footerY)
      .lineTo(555, footerY)
      .strokeColor(borderColor)
      .stroke();

    doc
      .fillColor(primaryColor)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Terms & Conditions:', 40, footerY + 10)
      .font('Helvetica')
      .fillColor('#718096')
      .fontSize(8)
      .text('1. Goods once sold can only be returned per our return policy within 7 days.', 40, footerY + 22)
      .text('2. Please retain this tax invoice for warranty claims & installation verification.', 40, footerY + 32)
      .text('3. This is a computer generated invoice and does not require a physical signature.', 40, footerY + 42);

    doc.end();
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({ message: 'Failed to generate invoice PDF', error: error.message });
  }
};

/**
 * Get Invoice Data as JSON
 * GET /api/orders/:id/invoice/data
 */
export const getOrderInvoiceData = async (req, res) => {
  try {
    const { id } = req.params;

    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id).populate('customer.customer', 'name email phone');
    } else {
      order = await Order.findOne({ order_id: Number(id) }).populate('customer.customer', 'name email phone');
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderYear = new Date(order.order_date || Date.now()).getFullYear();
    const invoiceNum = order.invoice_number || `INV-${orderYear}-${order.order_id || order._id.toString().slice(-6)}`;
    const invoiceDateStr = formatDate(order.invoice_date || order.order_date || Date.now());

    res.json({
      success: true,
      invoice_number: invoiceNum,
      invoice_date: invoiceDateStr,
      company: {
        name: 'AUTODEAL4U / TYRE MULTIVENDOR',
        address: process.env.ADDRESS || '3rd Floor, Shree Ram Palace, Bhoja Market, Sector 27, Noida, 201301, UP',
        email: process.env.ADMIN_EMAIL || 'support@autodeal4u.in',
        website: process.env.URI_SITE || 'https://autodeal4u.in',
        logo: process.env.LOGO || 'https://pickkro.com/assets/images/icon/logo.png',
      },
      order: order,
    });
  } catch (error) {
    console.error('Error fetching invoice data:', error);
    res.status(500).json({ message: 'Server error fetching invoice data', error: error.message });
  }
};

/**
 * Helper to generate Invoice PDF Buffer for Email Attachments
 */
export const generateOrderInvoiceBuffer = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const orderYear = new Date(order.order_date || Date.now()).getFullYear();
      const invoiceNum = order.invoice_number || `INV-${orderYear}-${order.order_id || order._id.toString().slice(-6)}`;
      const invoiceDateStr = formatDate(order.invoice_date || order.order_date || Date.now());

      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const primaryColor = '#1A365D';
      const secondaryColor = '#2B6CB0';
      const darkTextColor = '#2D3748';
      const lightBgColor = '#F7FAFC';
      const borderColor = '#E2E8F0';

      // --- HEADER SECTION ---
      doc
        .fillColor(primaryColor)
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('AUTODEAL4U / TYRE MULTIVENDOR', 40, 40);

      doc
        .fillColor(darkTextColor)
        .fontSize(9)
        .font('Helvetica')
        .text(process.env.ADDRESS || '3rd Floor, Shree Ram Palace, Bhoja Market, Sector 27', 40, 68)
        .text('Noida, 201301, Uttar Pradesh, India', 40, 80)
        .text(`Email: ${process.env.ADMIN_EMAIL || 'support@autodeal4u.in'} | Web: ${process.env.URI_SITE || 'https://autodeal4u.in'}`, 40, 92);

      // INVOICE BADGE (Top Right)
      doc
        .fillColor(primaryColor)
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('TAX INVOICE', 380, 40, { align: 'right' });

      doc
        .fillColor(darkTextColor)
        .fontSize(9)
        .font('Helvetica')
        .text(`Invoice No: ${invoiceNum}`, 380, 68, { align: 'right' })
        .text(`Invoice Date: ${invoiceDateStr}`, 380, 80, { align: 'right' })
        .text(`Order ID: #${order.order_id || order._id.toString().slice(-6)}`, 380, 92, { align: 'right' })
        .text(`Payment Method: ${order.payment_method || 'ONLINE'}`, 380, 104, { align: 'right' })
        .text(`Payment Status: ${order.is_paid ? 'PAID' : 'PENDING'}`, 380, 116, { align: 'right' });

      // Divider Line
      doc
        .moveTo(40, 135)
        .lineTo(555, 135)
        .strokeColor(borderColor)
        .lineWidth(1)
        .stroke();

      // --- ADDRESSES SECTION ---
      const addrY = 145;
      doc.rect(40, addrY, 250, 90).fillAndStroke(lightBgColor, borderColor);
      doc.rect(305, addrY, 250, 90).fillAndStroke(lightBgColor, borderColor);

      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('BILLED TO', 50, addrY + 8);
      const custName = order.customer?.name || 'Customer';
      const custPhone = order.customer?.phone || '';
      const custEmail = order.customer?.email || '';
      const billAddr = order.billing_address || order.shipping_address || {};

      doc
        .fillColor(darkTextColor)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text(custName, 50, addrY + 22)
        .font('Helvetica')
        .text(`${billAddr.address_1 || ''} ${billAddr.address_2 || ''}`, 50, addrY + 34, { width: 230 })
        .text(`${billAddr.city || ''}${billAddr.state ? ', ' + billAddr.state : ''} - ${billAddr.pin || ''}`, 50, addrY + 48)
        .text(`Phone: ${custPhone} ${custEmail ? '| Email: ' + custEmail : ''}`, 50, addrY + 62, { width: 230 });

      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('SHIPPED TO', 315, addrY + 8);
      const shipAddr = order.shipping_address || {};
      doc
        .fillColor(darkTextColor)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text(custName, 315, addrY + 22)
        .font('Helvetica')
        .text(`${shipAddr.address_1 || ''} ${shipAddr.address_2 || ''}`, 315, addrY + 34, { width: 230 })
        .text(`${shipAddr.city || ''}${shipAddr.state ? ', ' + shipAddr.state : ''} - ${shipAddr.pin || ''}`, 315, addrY + 48)
        .text(`Installation Option: ${order.installation_details?.option || 'NONE'}`, 315, addrY + 62, { width: 230 });

      // --- PRODUCTS TABLE ---
      let tableY = 250;
      doc.rect(40, tableY, 515, 22).fill(secondaryColor);
      doc
        .fillColor('#FFFFFF')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('#', 45, tableY + 6)
        .text('ITEM DESCRIPTION', 70, tableY + 6)
        .text('QTY', 340, tableY + 6, { width: 40, align: 'center' })
        .text('PRICE', 390, tableY + 6, { width: 75, align: 'right' })
        .text('TOTAL', 475, tableY + 6, { width: 75, align: 'right' });

      tableY += 22;
      const items = order.products || [];
      items.forEach((item, index) => {
        const itemBg = index % 2 === 0 ? '#FFFFFF' : lightBgColor;
        const rowHeight = 28;
        doc.rect(40, tableY, 515, rowHeight).fillAndStroke(itemBg, borderColor);

        const price = item.sale_price || item.regular_price || 0;
        const lineTotal = price * (item.quantity || 1);
        const prodName = `${item.name || 'Product'} ${item.size ? '(' + item.size + ')' : ''}`;
        const vendorInfo = item.vendor_details?.store_name ? `Vendor: ${item.vendor_details.store_name}` : '';

        doc
          .fillColor(darkTextColor)
          .fontSize(9)
          .font('Helvetica')
          .text((index + 1).toString(), 45, tableY + 8)
          .font('Helvetica-Bold')
          .text(prodName, 70, tableY + 4, { width: 260, ellipsis: true })
          .font('Helvetica')
          .fillColor('#718096')
          .fontSize(8)
          .text(vendorInfo, 70, tableY + 16, { width: 260, ellipsis: true })
          .fillColor(darkTextColor)
          .fontSize(9)
          .text((item.quantity || 1).toString(), 340, tableY + 8, { width: 40, align: 'center' })
          .text(formatCurrency(price), 390, tableY + 8, { width: 75, align: 'right' })
          .text(formatCurrency(lineTotal), 475, tableY + 8, { width: 75, align: 'right' });

        tableY += rowHeight;
      });

      tableY += 10;
      const summaryX = 320;
      const summaryWidth = 235;
      const subtotal = order.sub_total || 0;
      const delivery = order.delivery_charges || 0;
      const installation = order.installation_details?.total_installation_fee || 0;
      const discount = order.discount || 0;
      const tax = order.tax || 0;
      const grandTotal = order.total_amount || (subtotal + delivery + installation + tax - discount);

      const summaryRows = [
        { label: 'Subtotal:', value: formatCurrency(subtotal) },
        { label: 'Delivery Charges:', value: delivery > 0 ? formatCurrency(delivery) : 'FREE' },
        { label: 'Installation Fee:', value: installation > 0 ? formatCurrency(installation) : 'Included / N/A' },
        { label: 'Discount / Coupon:', value: discount > 0 ? `- ${formatCurrency(discount)}` : 'Rs. 0.00' },
        { label: 'GST / Tax (Included):', value: formatCurrency(tax) },
      ];

      summaryRows.forEach((row) => {
        doc
          .fillColor(darkTextColor)
          .fontSize(9)
          .font('Helvetica')
          .text(row.label, summaryX, tableY, { width: 130, align: 'left' })
          .text(row.value, summaryX + 130, tableY, { width: 105, align: 'right' });
        tableY += 16;
      });

      tableY += 5;
      doc.rect(summaryX, tableY, summaryWidth, 24).fill(primaryColor);
      doc
        .fillColor('#FFFFFF')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('GRAND TOTAL:', summaryX + 10, tableY + 6)
        .text(formatCurrency(grandTotal), summaryX + 110, tableY + 6, { width: 115, align: 'right' });

      const footerY = 700;
      doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor(borderColor).stroke();

      doc
        .fillColor(primaryColor)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('Terms & Conditions:', 40, footerY + 10)
        .font('Helvetica')
        .fillColor('#718096')
        .fontSize(8)
        .text('1. Goods once sold can only be returned per our return policy within 7 days.', 40, footerY + 22)
        .text('2. Please retain this tax invoice for warranty claims & installation verification.', 40, footerY + 32)
        .text('3. This is a computer generated invoice and does not require a physical signature.', 40, footerY + 42);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
