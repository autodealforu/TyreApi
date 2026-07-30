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
 * Helper to format address block as clean multi-line string
 */
const formatAddressText = (addr) => {
  if (!addr) return '';
  const lines = [];
  if (addr.address_1) lines.push(addr.address_1);
  if (addr.address_2) lines.push(addr.address_2);
  const cityStatePin = [addr.city, addr.state].filter(Boolean).join(', ') + (addr.pin ? ` - ${addr.pin}` : '');
  if (cityStatePin.trim()) lines.push(cityStatePin);
  if (addr.landmark) lines.push(`Landmark: ${addr.landmark}`);
  return lines.join('\n');
};

/**
 * Helper to safely extract string SKU without returning Mongoose methods
 */
const getSafeSKU = (item) => {
  if (typeof item.sku === 'string' && item.sku.trim()) return item.sku.trim();
  if (item.product && typeof item.product.sku === 'string' && item.product.sku.trim()) return item.product.sku.trim();
  if (item.product && typeof item.product.model_name === 'string' && item.product.model_name.trim()) return item.product.model_name.trim();
  if (item.product && typeof item.product.product_id === 'number') return `PRD-${item.product.product_id}`;
  return '';
};

/**
 * Render PDF Content onto a PDFKit doc stream
 */
const renderPDFContent = (doc, order) => {
  const orderYear = new Date(order.order_date || Date.now()).getFullYear();
  const invoiceNum = order.invoice_number || `INV-${orderYear}-${order.order_id || order._id.toString().slice(-6)}`;
  const invoiceDateStr = formatDate(order.invoice_date || order.order_date || Date.now());

  const primaryColor = '#1A365D';
  const secondaryColor = '#2B6CB0';
  const darkTextColor = '#2D3748';
  const lightBgColor = '#F7FAFC';
  const borderColor = '#CBD5E0';

  // --- HEADER SECTION ---
  doc
    .fillColor(primaryColor)
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('AUTODEAL4U', 40, 40, { width: 330 });

  doc
    .fillColor(darkTextColor)
    .fontSize(8.5)
    .font('Helvetica')
    .text(process.env.ADDRESS || '3rd Floor, Shree Ram Palace, Bhoja Market, Sector 27', 40, 62, { width: 330 })
    .text('Noida, 201301, Uttar Pradesh, India', 40, 74, { width: 330 })
    .text(`Email: ${process.env.ADMIN_EMAIL || 'support@autodeal4u.in'} | Web: ${process.env.URI_SITE || 'https://autodeal4u.in'}`, 40, 86, { width: 330 });

  // INVOICE BADGE (Top Right)
  doc
    .fillColor(primaryColor)
    .fontSize(18)
    .font('Helvetica-Bold')
    .text('TAX INVOICE', 380, 40, { width: 175, align: 'right' });

  doc
    .fillColor(darkTextColor)
    .fontSize(8.5)
    .font('Helvetica')
    .text(`Invoice No: ${invoiceNum}`, 380, 62, { width: 175, align: 'right' })
    .text(`Invoice Date: ${invoiceDateStr}`, 380, 74, { width: 175, align: 'right' })
    .text(`Order ID: #${order.order_id || order._id.toString().slice(-6)}`, 380, 86, { width: 175, align: 'right' })
    .text(`Payment Method: ${order.payment_method || 'ONLINE'}`, 380, 98, { width: 175, align: 'right' })
    .text(`Payment Status: ${order.is_paid ? 'PAID' : 'PENDING'}`, 380, 110, { width: 175, align: 'right' });

  // Divider Line
  doc
    .moveTo(40, 128)
    .lineTo(555, 128)
    .strokeColor(borderColor)
    .lineWidth(1)
    .stroke();

  // --- ADDRESSES SECTION ---
  const addrY = 138;
  const boxHeight = 105;

  doc.rect(40, addrY, 250, boxHeight).fillAndStroke(lightBgColor, borderColor);
  doc.rect(305, addrY, 250, boxHeight).fillAndStroke(lightBgColor, borderColor);

  // Billed To Header
  doc
    .fillColor(primaryColor)
    .fontSize(9.5)
    .font('Helvetica-Bold')
    .text('BILLED TO', 50, addrY + 6);

  const custName = order.customer?.name || 'Customer';
  const custPhone = order.customer?.phone || '';
  const custEmail = order.customer?.email || '';
  const billAddr = order.billing_address || order.shipping_address || {};

  const billLines = [
    custName,
    billAddr.address_1,
    billAddr.address_2,
    [billAddr.city, billAddr.state].filter(Boolean).join(', ') + (billAddr.pin ? ` - ${billAddr.pin}` : ''),
    billAddr.landmark ? `Landmark: ${billAddr.landmark}` : null,
    (custPhone || custEmail) ? `Phone: ${custPhone}${custEmail ? ' | ' + custEmail : ''}` : null
  ].filter(Boolean).join('\n');

  doc
    .fillColor(darkTextColor)
    .fontSize(8.5)
    .font('Helvetica')
    .text(billLines, 50, addrY + 20, { width: 230, lineGap: 1.5 });

  // Shipped To Header
  doc
    .fillColor(primaryColor)
    .fontSize(9.5)
    .font('Helvetica-Bold')
    .text('SHIPPED TO', 315, addrY + 6);

  const shipAddr = order.shipping_address || {};
  const shipLines = [
    custName,
    shipAddr.address_1,
    shipAddr.address_2,
    [shipAddr.city, shipAddr.state].filter(Boolean).join(', ') + (shipAddr.pin ? ` - ${shipAddr.pin}` : ''),
    shipAddr.landmark ? `Landmark: ${shipAddr.landmark}` : null,
    `Installation Option: ${order.installation_details?.option || 'NONE'}`
  ].filter(Boolean).join('\n');

  doc
    .fillColor(darkTextColor)
    .fontSize(8.5)
    .font('Helvetica')
    .text(shipLines, 315, addrY + 20, { width: 230, lineGap: 1.5 });

  // --- PRODUCTS TABLE ---
  let tableY = 255;
  doc.rect(40, tableY, 515, 20).fill(secondaryColor);

  doc
    .fillColor('#FFFFFF')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('#', 45, tableY + 5)
    .text('ITEM DESCRIPTION', 70, tableY + 5)
    .text('QTY', 340, tableY + 5, { width: 40, align: 'center' })
    .text('PRICE', 390, tableY + 5, { width: 75, align: 'right' })
    .text('TOTAL', 475, tableY + 5, { width: 75, align: 'right' });

  tableY += 20;

  const items = order.products || [];
  items.forEach((item, index) => {
    const itemBg = index % 2 === 0 ? '#FFFFFF' : lightBgColor;
    const rowHeight = 28;

    doc.rect(40, tableY, 515, rowHeight).fillAndStroke(itemBg, borderColor);

    const price = item.sale_price || item.regular_price || 0;
    const lineTotal = price * (item.quantity || 1);
    const sku = getSafeSKU(item);
    const prodName = `${item.name || 'Product'} ${item.size ? '(' + item.size + ')' : ''}`;
    
    const subDetails = [
      sku ? `SKU: ${sku}` : null,
      item.vendor_details?.store_name ? `Vendor: ${item.vendor_details.store_name}` : null,
    ].filter(Boolean).join(' | ');

    doc
      .fillColor(darkTextColor)
      .fontSize(8.5)
      .font('Helvetica')
      .text((index + 1).toString(), 45, tableY + 8)
      .font('Helvetica-Bold')
      .text(prodName, 70, tableY + 4, { width: 260, ellipsis: true })
      .font('Helvetica')
      .fillColor('#718096')
      .fontSize(7.5)
      .text(subDetails, 70, tableY + 16, { width: 260, ellipsis: true })
      .fillColor(darkTextColor)
      .fontSize(8.5)
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
      .fontSize(8.5)
      .font('Helvetica')
      .text(row.label, summaryX, tableY, { width: 130, align: 'left' })
      .text(row.value, summaryX + 130, tableY, { width: 105, align: 'right' });

    tableY += 15;
  });

  tableY += 4;
  doc.rect(summaryX, tableY, summaryWidth, 22).fill(primaryColor);

  doc
    .fillColor('#FFFFFF')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('GRAND TOTAL:', summaryX + 10, tableY + 5)
    .text(formatCurrency(grandTotal), summaryX + 110, tableY + 5, { width: 115, align: 'right' });

  // --- FOOTER & TERMS ---
  const footerY = 710;
  doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor(borderColor).stroke();

  doc
    .fillColor(primaryColor)
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('Terms & Conditions:', 40, footerY + 8)
    .font('Helvetica')
    .fillColor('#718096')
    .fontSize(7.5)
    .text('1. Goods once sold can only be returned per our return policy within 7 days.', 40, footerY + 20)
    .text('2. Please retain this tax invoice for warranty claims & installation verification.', 40, footerY + 30)
    .text('3. This is a computer generated invoice and does not require a physical signature.', 40, footerY + 40);
};

/**
 * Generate PDF Tax Invoice for an Order
 * GET /api/orders/:id/invoice
 */
export const generateOrderInvoicePDF = async (req, res) => {
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

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="Invoice_${order.order_id || 'order'}.pdf"`
    );

    doc.pipe(res);
    renderPDFContent(doc, order);
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
        name: 'AUTODEAL4U',
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
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      renderPDFContent(doc, order);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
