// ABOUTME: page-tts-core.js の DOM 組み立てとボタン連携を確認する結合テストです。
// ABOUTME: 読み上げ UI の挿入位置と開始・停止・再開の一連の状態変化を検証します。
import { beforeEach, describe, expect, it } from 'vitest';
import { mountPageTts } from '../../public/page-tts-core.js';

function createSpeechHarness() {
  const events = [];
  let activeUtterance = null;

  class TestSpeechSynthesisUtterance {
    constructor(text) {
      this.text = text;
      this.lang = '';
      this.voice = null;
      this.rate = 1;
      this.pitch = 1;
      this.onend = null;
      this.onpause = null;
      this.onresume = null;
      this.onerror = null;
    }
  }

  const speechSynthesis = {
    speaking: false,
    paused: false,
    getVoices() {
      return [{ name: 'Google 日本語', lang: 'ja-JP' }];
    },
    speak(utterance) {
      this.speaking = true;
      this.paused = false;
      activeUtterance = utterance;
      events.push({ type: 'speak', text: utterance.text, lang: utterance.lang });
    },
    pause() {
      this.paused = true;
      events.push({ type: 'pause' });
      activeUtterance?.onpause?.();
    },
    resume() {
      this.paused = false;
      events.push({ type: 'resume' });
      activeUtterance?.onresume?.();
    },
    cancel() {
      this.speaking = false;
      this.paused = false;
      events.push({ type: 'cancel' });
      const finishingUtterance = activeUtterance;
      activeUtterance = null;
      finishingUtterance?.onend?.();
    },
  };

  return {
    events,
    windowObj: {
      speechSynthesis,
      SpeechSynthesisUtterance: TestSpeechSynthesisUtterance,
      addEventListener() {},
    },
  };
}

describe('mountPageTts', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <main>
        <h1 id="_top">音声読み上げテスト</h1>
        <div class="sl-markdown-content">
          <p>このページを声で読んでみます。</p>
        </div>
      </main>
    `;
  });

  it('injects controls before the markdown content and starts in idle state', () => {
    const { windowObj } = createSpeechHarness();
    const result = mountPageTts(document, windowObj);

    const controls = document.querySelector('[data-tts-controls="true"]');

    expect(result?.readableText).toContain('音声読み上げテスト');
    expect(controls?.nextElementSibling).toBe(document.querySelector('.sl-markdown-content'));
    expect(controls?.getAttribute('data-state')).toBe('idle');
  });

  it('starts, pauses, resumes, and stops speech from the control buttons', () => {
    const { events, windowObj } = createSpeechHarness();
    mountPageTts(document, windowObj);

    const controls = document.querySelector('[data-tts-controls="true"]');
    const playButton = controls?.querySelector('[data-tts-play]');
    const stopButton = controls?.querySelector('[data-tts-stop]');
    const status = controls?.querySelector('[data-tts-status]');

    playButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(events[0]).toMatchObject({ type: 'speak', lang: 'ja-JP' });
    expect(status?.textContent).toContain('始めます');
    expect(controls?.getAttribute('data-state')).toBe('speaking');

    playButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(events[1]).toMatchObject({ type: 'pause' });
    expect(controls?.getAttribute('data-state')).toBe('paused');

    playButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(events[2]).toMatchObject({ type: 'resume' });
    expect(status?.textContent).toContain('再開');
    expect(controls?.getAttribute('data-state')).toBe('speaking');

    stopButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(events[3]).toMatchObject({ type: 'cancel' });
    expect(controls?.getAttribute('data-state')).toBe('idle');
    expect(status?.textContent).toContain('止めました');
  });
});
