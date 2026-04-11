import { getStoredToken } from '../hooks/useAuthToken';

export async function uploadScormPackage({ courseId, file, title }) {
  const token = getStoredToken();
  const fd = new FormData();
  fd.append('file', file);
  fd.append('courseId', courseId);
  if (title) fd.append('title', title);
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch('/api/scorm/packages', { method: 'POST', headers, body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Upload SCORM thất bại');
    err.status = res.status;
    throw err;
  }
  return data;
}
