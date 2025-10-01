// Mock service for Audit Logs

const getLogsFromStorage = () => {
  if (typeof window === 'undefined') return [];
  const logs = localStorage.getItem('auditLogs');
  return logs ? JSON.parse(logs) : [];
};

const saveLogsToStorage = logs => {
  localStorage.setItem('auditLogs', JSON.stringify(logs));
};

const delay = ms => new Promise(res => setTimeout(res, ms));

export const auditLogService = {
  async getLogs() {
    await delay(300);
    const logs = getLogsFromStorage();
    return {
      data: logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    };
  },

  logAction(action, entityType, entityId, details) {
    if (typeof window === 'undefined') return;
    const logs = getLogsFromStorage();
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: localStorage.getItem('authToken') || 'System', // Get user from auth token
      action, // e.g., 'CREATE', 'UPDATE', 'DELETE'
      entityType, // e.g., 'Subject', 'Question'
      entityId,
      details, // e.g., `Subject name changed from 'A' to 'B'`
    };
    const updatedLogs = [newLog, ...logs];
    saveLogsToStorage(updatedLogs);
  },
};
