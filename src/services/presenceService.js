// Simple presence tracker using localStorage and setInterval (demo only)

const KEY = 'onlinePresence';
const TTL_MS = 30_000; // 30s heartbeat

const now = () => Date.now();

const read = () => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
};

const write = obj => localStorage.setItem(KEY, JSON.stringify(obj));

export function startPresence(userId) {
  if (typeof window === 'undefined') return () => {};
  const id = String(userId || 'anon');
  const tick = () => {
    const data = read();
    data[id] = now();
    // cleanup expired entries
    for (const k of Object.keys(data)) {
      if (now() - data[k] > TTL_MS * 2) delete data[k];
    }
    write(data);
  };
  tick();
  const handle = setInterval(tick, TTL_MS / 2);
  return () => clearInterval(handle);
}

export function getOnlineCount() {
  const data = read();
  const cutoff = now() - TTL_MS;
  return Object.values(data).filter(ts => ts >= cutoff).length;
}
