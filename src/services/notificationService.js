// Mock notification service - stores notifications in localStorage and logs to console

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const getNotifications = () => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem('notifications');
  return raw ? JSON.parse(raw) : [];
};

const saveNotifications = (items) => {
  localStorage.setItem('notifications', JSON.stringify(items));
};

export const notificationService = {
  async sendExamNotification({ examId, subject, message, html, recipients }) {
    // Try real email first via API
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: recipients, 
          subject, 
          text: message,
          html: html || `<pre>${message}</pre>`
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    await delay(200);
    const items = getNotifications();
    const entry = {
      id: Date.now(),
      examId,
      subject,
      message,
      html: html || `<pre>${message}</pre>`,
      recipients,
      sentAt: new Date().toISOString(),
    };
    items.push(entry);
    saveNotifications(items);
    try {
      console.log('[Notification] To:', recipients.join(','), '\nSubject:', subject, '\nMessage:', message);
    } catch {}
    return entry;
  },
};


