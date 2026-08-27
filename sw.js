// 서비스워커: 푸시를 받아 알림 표시 + 최신 조출 브리핑을 저장(페이지가 읽어서 표시).
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

async function storeBriefing(data) {
  try {
    const cache = await caches.open('briefing');
    const payload = JSON.stringify({ title: data.title || '', body: data.body || '', date: data.date || '', at: Date.now() });
    await cache.put('/last', new Response(payload, { headers: { 'Content-Type': 'application/json' } }));
  } catch (e) {}
}

self.addEventListener('push', (event) => {
  let data = { title: '🎾 예약 변동', body: '', url: '' };
  try { data = Object.assign(data, event.data.json()); }
  catch (_) { if (event.data) data.body = event.data.text(); }
  event.waitUntil((async () => {
    await storeBriefing(data);
    await self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icon.png',
      badge: './icon.png',
      tag: 'tennis-reserve',
      renotify: true,
    });
  })());
});

// 알림 클릭 → 이 구독 페이지를 연다(예약포털 X).
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = self.registration.scope;
  event.waitUntil((async () => {
    const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if (c.url.startsWith(target) && 'focus' in c) return c.focus();
    }
    return clients.openWindow(target);
  })());
});
