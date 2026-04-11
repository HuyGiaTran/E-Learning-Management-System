import { User } from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signUserToken } from '../utils/token.js';

function userPublic(u) {
  return {
    id: String(u._id),
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
  };
}

/** Đăng ký — mặc định tạo Học viên */
export async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.body || {};
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Thiếu họ tên, email hoặc mật khẩu' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Mật khẩu tối thiểu 6 ký tự' });
    }
    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: 'Email đã được sử dụng' });
    }
    const hashed = await hashPassword(password);
    const user = await User.create({
      fullName: String(fullName).trim(),
      email: String(email).toLowerCase().trim(),
      password: hashed,
      role: User.ROLES.STUDENT,
    });
    const token = signUserToken(user._id);
    return res.status(201).json({ token, user: userPublic(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Thiếu email hoặc mật khẩu' });
    }
    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
    }
    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
    }
    const token = signUserToken(user._id);
    const u = user.toObject();
    delete u.password;
    return res.json({ token, user: userPublic(u) });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({ user: userPublic(req.user) });
}
