import path from 'path';
import express from 'express';
import multer from 'multer';
const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    console.log(file);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  // fileFilter: function (req, file, cb) {
  //   checkFileType(file, cb);
  // },
});

const videoUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for videos
  fileFilter: function (req, file, cb) {
    const videoTypes = /mp4|webm|mov|avi|mkv/;
    const extname = videoTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetypes = /video\/(mp4|webm|quicktime|x-msvideo|x-matroska)/;
    const mimetype = mimetypes.test(file.mimetype);

    if (extname || mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Video files only! (mp4, webm, mov, avi, mkv)'));
    }
  },
});

router.post('/', upload.single('image'), (req, res) => {
  res.send(`/${req.file.path}`);
});
router.post('/video', videoUpload.single('video'), (req, res) => {
  res.send(`/${req.file.path}`);
});
router.post('/gallery', upload.array('gallery'), (req, res) => {
  console.log(req.files);
  const newImages = req.files.map((item) => {
    return `/${item.path}`;
  });
  res.send(newImages);
});

export default router;
