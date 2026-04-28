import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = './uploads/csv_uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage for CSV upload files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const vendorId = req.body.vendor_id || 'unknown';
    cb(
      null,
      `bulk_upload_${vendorId}_${uniqueSuffix}${path.extname(
        file.originalname
      )}`
    );
  },
});

// File filter for CSV files only
const fileFilter = (req, file, cb) => {
  // Check file extension
  const allowedExtensions = ['.csv'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(fileExtension)) {
    // Check MIME type
    const allowedMimes = ['text/csv', 'text/plain', 'application/csv'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV files are allowed.'), false);
    }
  } else {
    cb(
      new Error('Invalid file extension. Only .csv files are allowed.'),
      false
    );
  }
};

// Configure multer for CSV uploads
const csvUploadConfig = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 1, // Only one file at a time
  },
});

// Middleware for handling CSV upload
export const uploadCSV = csvUploadConfig.single('csvFile');

// Error handling middleware for multer
export const handleCSVUploadError = (err, req, res, next) => {
  console.log(err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size allowed is 5MB.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Use "csvFile" as the field name.',
      });
    }
  }

  if (err.message.includes('Invalid file')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
};

export default csvUploadConfig;
