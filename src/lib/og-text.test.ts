// ABOUTME: SVG用の日本語テキストが欠落せず指定領域へ収まることを検証します。
// ABOUTME: 長い単語、禁則文字、単語と助詞の区切りを共通の組版処理で確認します。
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { layoutText, textSvg } from './og-text';

const box = { fontSize: 72, width: 792, height: 228, balance: true };

describe('SVG text layout', () => {
  it('keeps all words while balancing Japanese lines', () => {
    const title = '明日の学びに役立つこと、毎日に気をつけること';
    const layout = layoutText(title, box);
    expect(layout.lines.map(({ text }) => text).join('')).toBe(title);
    expect(layout.lines.length).toBeGreaterThan(1);
    expect(layout.width).toBeLessThanOrEqual(box.width);
    expect(layout.height).toBeLessThanOrEqual(box.height);
    for (const { text } of layout.lines) {
      expect(text).not.toMatch(/^[、。）」』にのを]/u);
      expect(text).not.toMatch(/[（「『]$/u);
    }
  });

  it('wraps a long Latin word without losing characters or overflowing', () => {
    const title = 'W'.repeat(100);
    const layout = layoutText(title, box);
    expect(layout.lines.map(({ text }) => text).join('')).toBe(title);
    expect(layout.width).toBeLessThanOrEqual(box.width);
    expect(layout.height).toBeLessThanOrEqual(box.height);
  });

  it('measures wide and narrow Latin glyphs using the bundled font', () => {
    const wide = layoutText('WWW', box);
    const narrow = layoutText('iii', box);
    expect(wide.width).toBeGreaterThan(narrow.width * 2);
  });

  it('escapes title text so it cannot add SVG elements', () => {
    const layout = layoutText('A & <image href="bad"/>', box);
    const svg = textSvg(layout, 64, 256, '#203b54');
    expect(svg).toContain('&amp;');
    expect(svg).toContain('&lt;');
    expect(svg).not.toContain('<image');
  });
});
