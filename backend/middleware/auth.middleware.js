import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export function authenticate(required = true) {
  return async (req, res, next) => {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      if (required) {
        return res.status(401).json({ message: 'Chưa đăng nhập' });
      }
      return next();
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.sub);
      if (!user) {
        return res.status(401).json({ message: 'Người dùng không tồn tại' });
      }
      req.user = user;
      next();
    } catch {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
  };
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    next();
  };
}
