// ABOUTME: 印刷対象の教材ページへ、現在URLのQRコードを起動時に追加します。
// ABOUTME: Astroのページ遷移後にも再実行し、重複生成はコア側で防ぎます。

import { mountPrintQr } from './print-qr-core.js';

const mount = () => mountPrintQr(document, window);

document.addEventListener('DOMContentLoaded', mount, { once: true });
document.addEventListener('astro:page-load', mount);
