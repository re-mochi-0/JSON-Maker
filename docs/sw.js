// Stride スマホ版の通知（PC から直接届いたものを出す）。
// ページの読み込み・保存には関わらない（fetch は横取りしない。スマホ版はいままでどおり GitHub Pages から読む）
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

// PC から届いた通知を出す（中身: { title, body, tag, pc, at }。PC で暗号化して送っていて、通知のサーバーでは読めない）
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: 'Stride', body: e.data ? e.data.text() : '' }; }
  const title = String(d.title || 'Stride').slice(0, 120);
  const opt = { body: String(d.body || '').slice(0, 600), icon: 'icon-192.png', badge: 'icon-192.png', data: { url: './', at: d.at || Date.now() } };
  if (d.tag) { opt.tag = String(d.tag).slice(0, 60); opt.renotify = true; }
  e.waitUntil(self.registration.showNotification(title, opt));
});

// 通知を押したら、スマホ版を開く（開いていれば、そこへ切り替える）
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) if (c.url.startsWith(self.registration.scope) && 'focus' in c) return c.focus();
    return self.clients.openWindow ? self.clients.openWindow(url) : null;
  }));
});
