/**
 * Cầu nối SCORM 1.2 tối thiểu: gắn `window.API` để runtime trong iframe (cùng origin qua proxy)
 * gọi LMSInitialize / LMSSetValue / LMSCommit / LMSFinish và đồng bộ CMI về backend LMS.
 */
const DEBOUNCE_MS = 800;

function defaultCmi() {
  return {
    'cmi.core.student_id': '',
    'cmi.core.student_name': '',
    'cmi.core.lesson_status': 'not attempted',
    'cmi.core.score.raw': '',
    'cmi.core.session_time': '0000:00:00',
    'cmi.suspend_data': '',
  };
}

/**
 * @param {object} opts
 * @param {string} opts.lessonId
 * @param {() => string|null|undefined} opts.getToken
 * @param {Record<string,string>} [opts.initialCmi]
 * @param {(payload: { lessonId: string, cmi: Record<string,string> }) => void} [opts.onOutbound]
 */
export function attachScorm12RuntimeBridge(opts) {
  const { lessonId, getToken, initialCmi, onOutbound } = opts;
  const MARK = '__lmsScormBridge';

  const cmi = { ...defaultCmi(), ...(initialCmi || {}) };
  let debounceTimer;
  let lastSent = '';

  const snapshot = () => ({
    'cmi.core.lesson_status': cmi['cmi.core.lesson_status'] ?? '',
    'cmi.core.score.raw': cmi['cmi.core.score.raw'] ?? '',
  });

  async function pushToLms() {
    const snap = snapshot();
    const key = JSON.stringify(snap);
    if (key === lastSent) return;
    lastSent = key;

    const token = getToken?.();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const body = {
      lessonId,
      'cmi.core.lesson_status': snap['cmi.core.lesson_status'],
      'cmi.core.score.raw': snap['cmi.core.score.raw'],
    };

    onOutbound?.({ lessonId, cmi: { ...snap } });

    try {
      const res = await fetch('/api/scorm/cmi', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn('[SCORM bridge] Lưu CMI thất bại:', err?.message || res.status);
      }
    } catch (e) {
      console.warn('[SCORM bridge]', e);
    }
  }

  function schedulePush() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      void pushToLms();
    }, DEBOUNCE_MS);
  }

  const api = {
    LMSInitialize() {
      return 'true';
    },
    LMSFinish() {
      void pushToLms();
      return 'true';
    },
    LMSGetValue(element) {
      return cmi[element] != null ? String(cmi[element]) : '';
    },
    LMSSetValue(element, value) {
      cmi[element] = String(value);
      if (element === 'cmi.core.lesson_status' || element === 'cmi.core.score.raw') {
        schedulePush();
      }
      return 'true';
    },
    LMSCommit() {
      void pushToLms();
      return 'true';
    },
    LMSGetLastError() {
      return '0';
    },
    LMSGetErrorString() {
      return '';
    },
    LMSGetDiagnostic() {
      return '';
    },
    [MARK]: true,
  };

  window.API = api;

  return {
    mergeCmi(partial) {
      Object.assign(cmi, partial);
    },
    flush: () => pushToLms(),
    detach() {
      clearTimeout(debounceTimer);
      if (window.API && window.API[MARK]) {
        delete window.API[MARK];
        delete window.API;
      }
    },
  };
}
