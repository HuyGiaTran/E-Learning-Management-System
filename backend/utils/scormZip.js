import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Giải nén file SCORM (.zip) vào thư mục tạm — dùng adm-zip theo yêu cầu dự án.
 * @param {string} zipBuffer - Buffer của file zip
 * @param {string} destDir - Thư mục đích (tuyệt đối)
 */
export function extractScormZip(zipBuffer, destDir) {
  const zip = new AdmZip(zipBuffer);
  fs.mkdirSync(destDir, { recursive: true });
  zip.extractAllTo(destDir, true);
  return destDir;
}

/** Ví dụ đường dẫn lưu SCORM trong dev (có thể thay bằng Cloudinary + public URL) */
export function defaultScormExtractRoot() {
  return path.join(__dirname, '..', 'uploads', 'scorm');
}
