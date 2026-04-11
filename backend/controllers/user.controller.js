import { User } from '../models/User.js';
import { hashPassword } from '../utils/password.js';

function userPublic(u) {
  return {
    id: String(u._id),
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
  };
}

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password').lean();
    res.json(users.map((u) => userPublic(u)));
  } catch (err) {
    next(err);
  }
}

/** Admin tạo Giáo viên / Học viên / Admin */
export async function createUser(req, res, next) {
  try {
    const { fullName, email, password, role } = req.body || {};
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    if (![User.ROLES.ADMIN, User.ROLES.TEACHER, User.ROLES.STUDENT].includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Mật khẩu tối thiểu 6 ký tự' });
    }
    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: 'Email đã tồn tại' });
    }
    const hashed = await hashPassword(password);
    const user = await User.create({
      fullName: String(fullName).trim(),
      email: String(email).toLowerCase().trim(),
      password: hashed,
      role,
    });
    return res.status(201).json({ user: userPublic(user) });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { fullName, role } = req.body || {};
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    if (fullName != null) user.fullName = String(fullName).trim();
    if (role != null) {
      if (![User.ROLES.ADMIN, User.ROLES.TEACHER, User.ROLES.STUDENT].includes(role)) {
        return res.status(400).json({ message: 'Vai trò không hợp lệ' });
      }
      user.role = role;
    }
    await user.save();
    res.json({ user: userPublic(user) });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    if (String(id) === String(req.user._id)) {
      return res.status(400).json({ message: 'Không thể xóa chính mình' });
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
