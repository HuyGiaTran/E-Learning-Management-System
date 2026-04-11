/** Khớp với backend `User.role` */
export const ROLES = {
  ADMIN: 'Admin',
  TEACHER: 'Giáo viên',
  STUDENT: 'Học viên',
};

export const ROLE_HOME = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.TEACHER]: '/teacher',
  [ROLES.STUDENT]: '/student',
};
