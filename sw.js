// 서비스워커: 백그라운드에서 푸시를 받아 시스템 알림으로 표시한다.
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = { title: '🎾 예약 변동', body: '', url: '' };
  try {
    data = Object.assign(data, event.data.json());
  } catch (_) {
    if (event.data) data.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icon.png',
      badge: './icon.png',
      tag: 'tennis-reserve',
      renotify: true,
      data: { url: data.url },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url =
    (event.notification.data && event.notification.data.url) ||
    'https://reserve.busan.go.kr/rent/preStep?resveProgrmSe=R&resveGroupSn=55&progrmSn=214';
  event.waitUntil(clients.openWindow(url));
});
