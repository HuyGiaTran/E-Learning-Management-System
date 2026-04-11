import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { Course } from '../models/Course.js';
import { Lesson } from '../models/Lesson.js';
import { ScormProgress } from '../models/ScormProgress.js';
import { User } from '../models/User.js';
import { extractScormZip, defaultScormExtractRoot } from '../utils/scormZip.js';
import {
  findImsManifestPath,
  resolveScormLaunchHref,
} from '../utils/scormManifest.js';
import { assertCanAccessLessonCmi } from '../utils/lessonAccess.js';

function scormStaticBasePath() {
  return defaultScormExtractRoot();
}

function publicLaunchPath(packageId, entryHref) {
  const safe = String(entryHref || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');
  if (safe.includes('..')) return null;
  return `/scorm-content/${encodeURIComponent(packageId)}/${safe
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/')}`;
}

function parseScoreRaw(raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** POST multipart: file (.zip), courseId, title? */
export async function uploadScormPackage(req, res, next) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: 'Thiếu file .zip' });
    }
    const { courseId, title } = req.body;
    if (!courseId) {
      return res.status(400).json({ message: 'Thiếu courseId' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Khóa học không tồn tại' });
    }

    const isInstructor = String(course.instructor) === String(req.user._id);
    const canUpload =
      req.user.role === User.ROLES.ADMIN ||
      (req.user.role === User.ROLES.TEACHER && isInstructor);
    if (!canUpload) {
      return res
        .status(403)
        .json({ message: 'Chỉ Admin hoặc Giáo viên phụ trách khóa được tải SCORM' });
    }

    const packageId = randomUUID();
    const destDir = path.join(scormStaticBasePath(), packageId);
    extractScormZip(req.file.buffer, destDir);

    const manifestPath = findImsManifestPath(destDir);
    if (!manifestPath) {
      fs.rmSync(destDir, { recursive: true, force: true });
      return res.status(400).json({
        message: 'Gói zip không chứa imsmanifest.xml hợp lệ',
      });
    }

    let entryHref;
    try {
      entryHref = resolveScormLaunchHref(manifestPath);
    } catch (e) {
      fs.rmSync(destDir, { recursive: true, force: true });
      return res.status(400).json({ message: e.message || 'Lỗi đọc manifest' });
    }

    const lessonTitle =
      (title && String(title).trim()) ||
      `Bài SCORM — ${path.basename(destDir).slice(0, 8)}`;

    const launchPath = publicLaunchPath(packageId, entryHref);
    const lesson = await Lesson.create({
      title: lessonTitle,
      type: 'SCORM',
      course: courseId,
      scormPackageId: packageId,
      scormEntryHref: entryHref,
      content: launchPath || '',
    });

    course.lessons.push(lesson._id);
    await course.save();

    return res.status(201).json({
      lesson,
      packageId,
      entryHref,
      launchPath,
      manifestPath: path.relative(destDir, manifestPath).replace(/\\/g, '/'),
    });
  } catch (err) {
    next(err);
  }
}

/** POST JSON: lessonId + (lesson_status | cmi.core.lesson_status) + (score_raw | cmi.core.score.raw) */
export async function saveScormCmi(req, res, next) {
  try {
    const body = req.body || {};
    const { lessonId } = body;
    const lesson_status =
      body.lesson_status ?? body['cmi.core.lesson_status'] ?? body.cmi?.core?.lesson_status;
    const score_raw =
      body.score_raw ?? body['cmi.core.score.raw'] ?? body.cmi?.core?.score?.raw;
    if (!lessonId) {
      return res.status(400).json({ message: 'Thiếu lessonId' });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson || lesson.type !== 'SCORM') {
      return res.status(404).json({ message: 'Bài SCORM không tồn tại' });
    }
    try {
      await assertCanAccessLessonCmi(req.user, lesson);
    } catch (e) {
      return res.status(e.status || 403).json({ message: e.message });
    }

    const statusStr =
      lesson_status !== undefined && lesson_status !== null
        ? String(lesson_status).trim().slice(0, 64)
        : '';

    const scoreVal = parseScoreRaw(score_raw);

    const doc = await ScormProgress.findOneAndUpdate(
      { user: req.user._id, lesson: lessonId },
      {
        lessonStatus: statusStr,
        scoreRaw: scoreVal,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      ok: true,
      progress: {
        lessonId: String(lesson._id),
        cmi: {
          'cmi.core.lesson_status': doc.lessonStatus,
          'cmi.core.score.raw':
            doc.scoreRaw === null || doc.scoreRaw === undefined
              ? ''
              : String(doc.scoreRaw),
        },
        updatedAt: doc.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/** GET tiến độ hiện tại (cho SCORM API wrapper khi vào bài) */
export async function getScormCmi(req, res, next) {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId);
    if (!lesson || lesson.type !== 'SCORM') {
      return res.status(404).json({ message: 'Bài SCORM không tồn tại' });
    }
    try {
      await assertCanAccessLessonCmi(req.user, lesson);
    } catch (e) {
      return res.status(e.status || 403).json({ message: e.message });
    }

    const doc = await ScormProgress.findOne({
      user: req.user._id,
      lesson: lessonId,
    }).lean();

    const raw =
      doc?.scoreRaw === null || doc?.scoreRaw === undefined ? '' : String(doc.scoreRaw);

    return res.json({
      lessonId: String(lesson._id),
      cmi: {
        'cmi.core.lesson_status': doc?.lessonStatus ?? '',
        'cmi.core.score.raw': raw,
      },
    });
  } catch (err) {
    next(err);
  }
}
