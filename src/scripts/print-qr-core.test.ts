// ABOUTME: 印刷用QRコードの行列生成と、教材ページへのDOM追加を検証します。
// ABOUTME: 固定画像を使わず、現在ページのURLが反映されることを確認します。

import { describe, expect, it } from 'vitest';
import { makeQrMatrix, mountPrintQr } from './print-qr-core.js';

describe('print QR code', () => {
  it('creates a version 5 square matrix with finder patterns', () => {
    const matrix = makeQrMatrix('https://example.com/manabi-commons/example/');

    expect(matrix).toHaveLength(37);
    expect(matrix.every((row) => row.length === 37)).toBe(true);
    expect(matrix[0].slice(0, 7)).toEqual([true, true, true, true, true, true, true]);
    expect(matrix[6].slice(0, 7)).toEqual([true, true, true, true, true, true, true]);
  });

  it('adds one current-page QR link to every printable section', () => {
    document.body.innerHTML = `
      <main>
        <section class="km-mission"></section>
        <section class="km-mission"></section>
      </main>
    `;
    const windowObj = { location: { href: 'https://example.com/lesson/?print=1#part' } } as Window;

    expect(mountPrintQr(document, windowObj)).toBe(2);
    expect(mountPrintQr(document, windowObj)).toBe(0);
    const links = [...document.querySelectorAll<HTMLAnchorElement>('.print-page-qr')];
    expect(links).toHaveLength(2);
    expect(links.every((link) => link.href === 'https://example.com/lesson/')).toBe(true);
    expect(links.every((link) => link.querySelector('svg') !== null)).toBe(true);
  });

  it('rejects URLs that do not fit the supported QR size', () => {
    expect(() => makeQrMatrix(`https://example.com/${'a'.repeat(120)}`)).toThrow(RangeError);
  });
});
