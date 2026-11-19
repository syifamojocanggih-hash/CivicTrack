// Service Worker CivicTrack Lamongan - Early-Warning Push Notifications
const CACHE_NAME = 'civictrack-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = { title: 'CivicTrack Lamongan', body: 'Pemberitahuan proyek baru di sekitar Anda.', url: '/' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || data.pesan,
    icon: '/civictrack-icon.png',
    badge: '/favicon-64x64.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      proyek_id: data.proyek_id,
      trigger_type: data.trigger_type,
    },
    actions: [
      { action: 'open_route', title: 'Lihat Rute AI' },
      { action: 'close', title: 'Tutup' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || data.judul || 'Early-Warning CivicTrack', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
