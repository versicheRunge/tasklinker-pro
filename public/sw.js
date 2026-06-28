// Service Worker — handles Web Push notifications

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try { payload = event.data.json(); }
  catch { payload = { title: 'TaskLinker', body: event.data.text() }; }

  const options = {
    body: payload.body ?? '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload.tag ?? 'tasklinker',
    data: { url: payload.url ?? '/' },
    requireInteraction: payload.requireInteraction ?? false,
  };

  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'TaskLinker', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
