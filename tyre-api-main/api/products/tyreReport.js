import asyncHandler from 'express-async-handler';
import TyreModel from '../tyres/TyreModel.js';
import Product from './ProductModel.js';
import csvtojson from 'csvtojson';
import fs from 'fs';

// @desc    Generate CSV report of all tyres
// @route   GET /api/products/generate-tyre-report
// @access  Private (Admin/Vendor)
const generateTyreReport = asyncHandler(async (req, res) => {
  try {
    // Get all published tyres with required details
    const tyres = await TyreModel.find({ published_status: 'PUBLISHED' })
      .populate('tyreWidth', 'name width_value')
      .populate('aspectRatio', 'name ratio_value')
      .populate('rimDiameter', 'name diameter_value')
      .populate('productBrand', 'name')
      .select('_id tyreWidth aspectRatio rimDiameter productBrand construction')
      .lean();

    if (!tyres || tyres.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No tyres found',
      });
    }

    // Create CSV data
    const csvData = tyres.map((tyre) => {
      const tyreWidth = tyre.tyreWidth?.name || '';
      const aspectRatio = tyre.aspectRatio?.name || '';
      const rimDiameter = tyre.rimDiameter?.name || '';
      const construction = tyre.construction || '';
      const brand = tyre.productBrand?.name || '';

      // Structure the name as: width/aspectRatio + construction + rimDiameter
      // Only include parts that have values
      let tyreName = '';
      if (tyreWidth && aspectRatio) {
        tyreName = `${tyreWidth}/${aspectRatio}`;
      }
      if (construction) {
        tyreName += construction;
      }
      if (rimDiameter) {
        tyreName += rimDiameter;
      }

      return {
        tyre_id: tyre._id.toString(),
        tyre_name: tyreName,
        brand: brand,
        tyre_width: tyreWidth,
        aspect_ratio: aspectRatio,
        rim_diameter: rimDiameter,
        // Product model keys - empty for vendors to fill
        // If vendor fills these, it means they want this tyre
        tyre_cost: '',
        tyre_price_mrp: '',
        tyre_price_rcp: '',
        tyre_price_auto_deal: '',
        stock: '',
        in_stock: '',
        published_status: '', // PUBLISHED/DRAFT
      };
    });

    // Convert to CSV format
    const csvHeaders = [
      'tyre_id',
      'tyre_name',
      'brand',
      'tyre_width',
      'aspect_ratio',
      'rim_diameter',
      'tyre_cost',
      'tyre_price_mrp',
      'tyre_price_rcp',
      'tyre_price_auto_deal',
      'stock',
      'in_stock',
      'published_status', // PUBLISHED/DRAFT
    ];

    let csvContent = csvHeaders.join(',') + '\n';

    csvData.forEach((row) => {
      const csvRow = csvHeaders
        .map((header) => {
          const value = row[header] || '';
          // Escape commas and quotes in CSV
          if (
            value.toString().includes(',') ||
            value.toString().includes('"')
          ) {
            return `"${value.toString().replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',');
      csvContent += csvRow + '\n';
    });

    // Set headers for CSV download
    const fileName = `tyre_report_${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Send CSV content
    res.send(csvContent);
  } catch (error) {
    console.error('Generate Tyre Report Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong while generating report.',
    });
  }
});

// @desc    Process bulk product upload from CSV
// @route   POST /api/products/bulk-upload-csv
// @access  Private (Admin/Vendor)
const processBulkUploadCSV = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is required',
      });
    }

    console.log('Request Body:', req.body);

    const { vendorId } = req.body;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID is required',
      });
    }

    // Verify vendor permissions (if user is vendor, they can only upload for themselves)
    if (
      req.user.role === 'VENDOR' &&
      req.user._id.toString() !== vendorId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Access denied. You can only upload products for your own store.',
      });
    }

    const csvFilePath = req.file.path;
    const createdProducts = [];
    const errors = [];
    let processedCount = 0;
    let successCount = 0;

    try {
      // Parse CSV file
      const csvData = await csvtojson().fromFile(csvFilePath);

      console.log(`Processing ${csvData.length} rows from CSV`);

      // Process each row
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        processedCount++;

        try {
          // Skip rows that don't have tyre_cost filled (vendor doesn't want this tyre)
          if (!row.tyre_cost || row.tyre_cost.trim() === '') {
            continue; // Skip this row - vendor doesn't want this tyre
          }

          // Validate required fields
          if (!row.tyre_id) {
            errors.push(`Row ${i + 1}: Missing tyre_id`);
            continue;
          }

          // Check if tyre exists
          const tyre = await TyreModel.findById(row.tyre_id);
          if (!tyre) {
            errors.push(`Row ${i + 1}: Tyre with ID ${row.tyre_id} not found`);
            continue;
          }

          // Check if product already exists for this vendor and tyre
          const existingProduct = await Product.findOne({
            tyre: row.tyre_id,
            vendor: vendorId,
          });

          if (existingProduct) {
            errors.push(
              `Row ${i + 1}: Product already exists for this tyre and vendor`
            );
            continue;
          }

          // Validate and parse pricing
          const tyreCost = parseFloat(row.tyre_cost) || 0;
          if (tyreCost <= 0) {
            errors.push(
              `Row ${i + 1}: Invalid tyre_cost - must be a positive number`
            );
            continue;
          }

          // Create product data
          const productData = {
            tyre: row.tyre_id,
            vendor: vendorId,
            tyre_cost: tyreCost,
            tyre_price_mrp: parseFloat(row.tyre_price_mrp) || 0,
            tyre_price_rcp: parseFloat(row.tyre_price_rcp) || 0,
            tyre_price_auto_deal: parseFloat(row.tyre_price_auto_deal) || 0,
            stock: parseInt(row.stock) || 0,
            in_stock: row.in_stock?.toLowerCase() === 'true',
            published_status: row.published_status || 'PUBLISHED',
            product_status: 'Active',
            created_by: req.user._id,
            published_date: new Date(),
          };

          // Create the product
          const product = new Product(productData);
          await product.save();

          createdProducts.push(product);
          successCount++;
        } catch (rowError) {
          console.error(`Error processing row ${i + 1}:`, rowError);
          errors.push(`Row ${i + 1}: ${rowError.message}`);
        }
      }

      // Clean up uploaded file
      fs.unlinkSync(csvFilePath);

      // Populate created products for response
      const populatedProducts = await Product.find({
        _id: { $in: createdProducts.map((p) => p._id) },
      })
        .populate('tyre', 'tyreWidth aspectRatio rimDiameter productBrand')
        .populate('vendor', 'name store_name')
        .limit(10); // Limit response size

      res.json({
        success: true,
        summary: {
          total_rows_processed: processedCount,
          products_created: successCount,
          errors_count: errors.length,
          success_rate:
            processedCount > 0
              ? `${((successCount / processedCount) * 100).toFixed(2)}%`
              : '0%',
        },
        created_products: populatedProducts,
        errors: errors.slice(0, 20), // Limit errors shown
        message: `Bulk upload completed. ${successCount} products created successfully.`,
      });
    } catch (parseError) {
      // Clean up file on parse error
      if (fs.existsSync(csvFilePath)) {
        fs.unlinkSync(csvFilePath);
      }
      throw parseError;
    }
  } catch (error) {
    console.error('Process Bulk Upload CSV Error:', error);

    // Clean up uploaded file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message:
        error.message || 'Something went wrong while processing bulk upload.',
    });
  }
});

export { generateTyreReport, processBulkUploadCSV };
