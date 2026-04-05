// ABOUTME: ブラウザー起動時にページ読み上げコントロールを初期化します。
// ABOUTME: Astro/Starlight の各ページで同じ挙動になるよう公開アセットとして読み込みます。

import { mountPageTts } from './page-tts-core.js';

function startPageTts() {
  mountPageTts(document, window);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startPageTts, { once: true });
} else {
  startPageTts();
}

document.addEventListener('astro:page-load', startPageTts);
