import multer from 'multer';

const storage = multer.memoryStorage();

const zipMimetype = /^application\/(zip|x-zip-compressed)$/i;

export const uploadMemory = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
});

export const uploadScormZip = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const okMime = zipMimetype.test(file.mimetype || '');
    const okName = (file.originalname || '').toLowerCase().endsWith('.zip');
    if (okMime || okName) return cb(null, true);
    cb(new Error('Chỉ chấp nhận file .zip (gói SCORM)'));
  },
});
