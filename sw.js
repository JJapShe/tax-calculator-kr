const CACHE_NAME = 'car-tax-calculator-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/main.js',
  '/manifest.json'
];

// 설치 이벤트
self.addEventListener('install', function(event) {
  console.log('Service Worker installing');
  self.skipWaiting(); // 즉시 새로운 버전으로 교체
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim(); // 모든 클라이언트를 즉시 제어
    })
  );
});

// 페치 이벤트
self.addEventListener('fetch', function(event) {
  // chrome-extension 및 기타 unsupported 스킴 필터링
  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 캐시에서 찾으면 반환
        if (response) {
          return response;
        }
        
        // 네트워크에서 가져오기
        return fetch(event.request).then(function(response) {
          // 유효한 응답이 아니면 그대로 반환
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // 응답을 복제하여 캐시에 저장
          const responseToCache = response.clone();
          
          // 안전한 캐시 저장 (에러 발생 시 무시)
          caches.open(CACHE_NAME)
            .then(function(cache) {
              try {
                return cache.put(event.request, responseToCache);
              } catch (error) {
                console.log('Cache put failed:', error);
              }
            })
            .catch(function(error) {
              console.log('Cache open error:', error);
            });
          
          return response;
        }).catch(function(error) {
          console.log('Network fetch failed:', error);
          return response;
        });
      })
  );
}); 