import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import RequireAuth from './components/auth/RequireAuth';
import GuestOnly from './components/auth/GuestOnly';
import RequireRole from './components/auth/RequireRole';
import HomeRedirect from './pages/HomeRedirect';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherCoursePage from './pages/TeacherCoursePage';
import StudentDashboard from './pages/StudentDashboard';
import StudentCoursePage from './pages/StudentCoursePage';
import ScormLessonPage from './pages/ScormLessonPage';
import LessonViewPage from './pages/LessonViewPage';
import { ROLES } from './constants/roles';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestOnly />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route index element={<HomeRedirect />} />
            <Route element={<RequireRole roles={[ROLES.ADMIN]} />}>
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
            <Route element={<RequireRole roles={[ROLES.TEACHER, ROLES.ADMIN]} />}>
              <Route path="teacher" element={<TeacherDashboard />} />
              <Route path="teacher/courses/:courseId" element={<TeacherCoursePage />} />
            </Route>
            <Route element={<RequireRole roles={[ROLES.STUDENT, ROLES.ADMIN]} />}>
              <Route path="student" element={<StudentDashboard />} />
              <Route path="student/courses/:courseId" element={<StudentCoursePage />} />
            </Route>
            <Route path="learn/:lessonId" element={<ScormLessonPage />} />
            <Route path="lesson/:lessonId" element={<LessonViewPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
