const fs = require('node:fs');
const path = require('node:path');

const indexPath = path.resolve(process.cwd(), 'dist', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

const pwaHead = `
    <meta name="theme-color" content="#3A6FF7" />
    <meta name="description" content="予定・Todo・家計簿をまとめて管理する暮らしノート" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="暮らしノート" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/icon-192.png" />`;

const serviceWorkerRegistration = `
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/service-worker.js').catch(function (error) {
          console.error('Service Worker registration failed:', error);
        });
      });
    }
  </script>`;

const withHead = html.includes('rel="manifest"') ? html : html.replace('</head>', `${pwaHead}\n  </head>`);
const withServiceWorker = withHead.includes("serviceWorker.register('/service-worker.js')")
  ? withHead
  : withHead.replace('</body>', `${serviceWorkerRegistration}\n</body>`);

fs.writeFileSync(indexPath, withServiceWorker);
console.log('PWA metadata and Service Worker registration added to dist/index.html');
