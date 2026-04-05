// ABOUTME: page-tts-core.js の本文抽出と状態計算を検証するユニットテストです。
// ABOUTME: 読み上げ対象テキストの組み立てと音声選択の境界条件を確認します。
import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildReadableText,
  getControlState,
  normalizeText,
  pickJapaneseVoice,
  pickTextRoot,
} from '../../public/page-tts-core.js';

describe('normalizeText', () => {
  it('collapses line breaks and repeated spaces', () => {
    expect(normalizeText('  こえで\n  よむ   れんしゅう  ')).toBe('こえで よむ れんしゅう');
  });
});

describe('pickTextRoot', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('prefers the Starlight markdown container when present', () => {
    document.body.innerHTML = `
      <main>
        <article>article fallback</article>
        <div class="sl-markdown-content">markdown content</div>
      </main>
    `;

    expect(pickTextRoot(document)?.className).toBe('sl-markdown-content');
  });
});

describe('buildReadableText', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('collects the page title and readable body text in order', () => {
    document.body.innerHTML = `
      <main>
        <h1 id="_top">分数のたし算</h1>
        <div class="sl-markdown-content">
          <h1 id="_top">分数のたし算</h1>
          <h2>やり方</h2>
          <p>分母をそろえてから考えます。</p>
          <ul>
            <li>通分する</li>
          </ul>
          <nav>
            <p>サイドバーの説明</p>
          </nav>
          <button type="button">よみあげ</button>
        </div>
      </main>
    `;

    expect(
      buildReadableText({
        root: pickTextRoot(document),
        pageTitle: '分数のたし算',
      }),
    ).toBe([
      '分数のたし算',
      'やり方',
      '分母をそろえてから考えます。',
      '通分する',
    ].join('\n'));
  });
});

describe('pickJapaneseVoice', () => {
  it('chooses a Japanese voice before a non-Japanese fallback', () => {
    const voice = pickJapaneseVoice([
      { name: 'English Voice', lang: 'en-US' },
      { name: 'Google 日本語', lang: 'ja-JP' },
    ]);

    expect(voice?.lang).toBe('ja-JP');
  });
});

describe('getControlState', () => {
  it('returns an unsupported state when the API is unavailable', () => {
    expect(getControlState({ supported: false })).toMatchObject({
      state: 'unsupported',
      playDisabled: true,
      stopDisabled: true,
    });
  });

  it('returns the paused labels when reading is paused', () => {
    expect(getControlState({ supported: true, mode: 'paused' })).toMatchObject({
      state: 'paused',
      playLabel: 'つづけて読む',
      stopDisabled: false,
    });
  });
});
