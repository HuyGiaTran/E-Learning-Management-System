# Hệ thống Quản lý Học tập Trực tuyến (E-Learning LMS)

Monorepo cho trung tâm ngoại ngữ vừa và nhỏ: **backend** (Node.js/Express + MongoDB) và **frontend** (React + Tailwind CSS + Redux Toolkit).

## Thành viên nhóm

| Thành viên | Vai trò |
|------------|---------|
| Trần Nguyễn Gia Huy | Fullstack |
| Nguyễn Đặng Đại Nam | Frontend |
| Lê Viết Thành Thái | Backend |
| Dương Thành Nhân | Tester |

## Cấu trúc thư mục

```
├── backend/          # API Express, Mongoose, JWT, SCORM (adm-zip)
├── frontend/       # React (Vite), Tailwind, Redux Toolkit
├── package.json    # npm workspaces
└── README.md
```

## Yêu cầu môi trường

- Node.js 18+
- MongoDB (local hoặc Atlas)

## Chạy nhanh

### Backend

```bash
cd backend
cp .env.example .env
# Chỉnh MONGODB_URI và các biến JWT/CLOUDINARY trong .env
npm install
npm run dev
```

API mặc định: `http://localhost:5001` 

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Ứng dụng mặc định: `http://localhost:5173`

### Từ thư mục gốc (workspaces)

```bash
npm install
npm run dev:backend
npm run dev:frontend
```

Mở `http://localhost:5173` → **Đăng ký** tạo tài khoản **Học viên**; tài khoản **Admin** / **Giáo viên** do Admin tạo tại trang **Admin** sau khi đăng nhập Admin (tạo thủ công trong DB lần đầu hoặc dùng tài khoản admin đã có).

### Vai trò & API chính (tóm tắt)

| Vai trò | Frontend | Backend |
|--------|-----------|---------|
| **Học viên** | `/student` — ghi danh, vào khóa, học Text/Video/SCORM | `POST /api/auth/register`, `GET /api/courses?discover=true`, `POST /api/courses/:id/enroll`, SCORM CMI khi đã ghi danh |
| **Giáo viên** | `/teacher` — tạo khóa, bài học, upload SCORM, quản lý học viên khóa mình | `POST /api/courses`, `POST /api/courses/:id/lessons`, `POST /api/scorm/packages` (chỉ GV phụ trách), quản lý `students` |
| **Admin** | `/admin` — người dùng + mọi khóa học | `GET/POST/PATCH/DELETE /api/users`, toàn quyền khóa học |

JWT: `Authorization: Bearer <token>` — đăng nhập trả về `token`, frontend lưu `localStorage` key `lms_token`.

## Giấy phép

Dự án phục vụ mục đích học tập / đồ án.
