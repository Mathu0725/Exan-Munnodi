// Local attempt persistence to survive refresh/power loss (demo)

const keyFor = (examId, userEmail) => `attempt:${examId}:${userEmail || 'anon'}`;

export function loadAttempt(examId, userEmail) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(keyFor(examId, userEmail));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAttempt(examId, userEmail, data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(keyFor(examId, userEmail), JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
  } catch {}
}

export function clearAttempt(examId, userEmail) {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(keyFor(examId, userEmail)); } catch {}
}


