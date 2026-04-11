import jwt from 'jsonwebtoken';

export function signUserToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Thiếu JWT_SECRET');
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ sub: String(userId) }, secret, { expiresIn });
}
