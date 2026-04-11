import multer from 'multer';

export function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err?.message?.includes('Chỉ chấp nhận file .zip')) {
    return res.status(400).json({ message: err.message });
  }
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Lỗi máy chủ';
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }
  res.status(status).json({ message });
}
