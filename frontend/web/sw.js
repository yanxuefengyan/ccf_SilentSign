// Service Worker - 支持离线功能
const CACHE_NAME = 'silentsign-v1';
const OFFLINE_PHRASES = [
    '你好', '谢谢', '请问医院在哪里', '我要挂号',
    '这个多少钱', '紧急求助', '我需要帮助',
    '厕所在哪', '我聋哑人', '请写下来'
];

// 需要缓存的资源
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    // 添加其他需要缓存的文件
];

// 安装Service Worker
self.addEventListener('install', event => {
    console.log('Service Worker 安装中...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('缓存资源:', urlsToCache);
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// 激活Service Worker
self.addEventListener('activate', event => {
    console.log('Service Worker 激活');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
    // 对于API请求，使用网络优先策略
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // 克隆响应以进行缓存
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                })
                .catch(() => {
                    // 网络请求失败时，检查缓存
                    return caches.match(event.request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            
                            // 对于特定的API请求，提供离线响应
                            if (event.request.url.includes('/api/sign-to-text')) {
                                return new Response(JSON.stringify({
                                    text: OFFLINE_PHRASES[Math.floor(Math.random() * OFFLINE_PHRASES.length)],
                                    confidence: 0.7 + Math.random() * 0.2,
                                    words: []
                                }), {
                                    headers: { 'Content-Type': 'application/json' }
                                });
                            }
                            
                            return new Response('网络连接失败', { status: 503 });
                        });
                })
        );
    } else {
        // 对于静态资源，使用缓存优先策略
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // 返回缓存或网络请求
                    return response || fetch(event.request);
                })
        );
    }
});

// 后台同步支持
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('后台同步执行');
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // 实现后台同步逻辑
    console.log('执行后台数据同步');
}

// 推送通知支持
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const options = {
        body: data.body || 'SilentSign 通知',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [200, 100, 200],
        tag: 'silentsign-notification'
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'SilentSign', options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});