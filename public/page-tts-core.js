// ABOUTME: Starlight の各ページに共通の音声読み上げ UI と本文抽出処理を提供します。
// ABOUTME: Web Speech API を使って、本文テキストの読み上げ開始・停止・再開を制御します。

const TEXT_SELECTOR = 'h1#_top, h1, h2, h3, p, li, blockquote';
const SKIP_SELECTOR = [
  'nav',
  'aside',
  'footer',
  'button',
  'summary',
  'details',
  'pre',
  'code',
  'input',
  'textarea',
  'select',
  'option',
  '.page-tts-controls',
  '.quiz-container',
  '.animated-step',
  '.expressive-code',
  '[aria-hidden="true"]',
  '[hidden]',
].join(', ');

export function normalizeText(value = '') {
  return value.replace(/\s+/g, ' ').trim();
}

export function pickTextRoot(documentObj = document) {
  return (
    documentObj.querySelector('.sl-markdown-content') ??
    documentObj.querySelector('main article') ??
    documentObj.querySelector('main')
  );
}

export function collectReadableSegments({ root, pageTitle = '' }) {
  if (!root) {
    return [];
  }

  const segments = [];
  const normalizedTitle = normalizeText(pageTitle);

  if (normalizedTitle) {
    segments.push(normalizedTitle);
  }

  for (const node of root.querySelectorAll(TEXT_SELECTOR)) {
    if (node.closest(SKIP_SELECTOR)) {
      continue;
    }

    if (node.hidden || node.getAttribute('aria-hidden') === 'true') {
      continue;
    }

    const text = normalizeText(node.textContent ?? '');

    if (!text) {
      continue;
    }

    if (segments.at(-1) === text) {
      continue;
    }

    segments.push(text);
  }

  return segments;
}

export function buildReadableText({ root, pageTitle = '' }) {
  return collectReadableSegments({ root, pageTitle }).join('\n');
}

export function pickJapaneseVoice(voices = []) {
  return (
    voices.find((voice) => /^ja(?:-|$)/i.test(voice.lang ?? '') && /google|microsoft|kyoko|otoya/i.test(voice.name ?? '')) ??
    voices.find((voice) => /^ja(?:-|$)/i.test(voice.lang ?? '')) ??
    voices[0] ??
    null
  );
}

export function getControlState({ supported, mode = 'idle' }) {
  if (!supported) {
    return {
      state: 'unsupported',
      playLabel: 'よみあげ',
      playDisabled: true,
      stopDisabled: true,
      message: 'このブラウザーでは読み上げを使えません。',
    };
  }

  if (mode === 'speaking') {
    return {
      state: 'speaking',
      playLabel: 'いったん止める',
      playDisabled: false,
      stopDisabled: false,
      message: '読み上げ中です。',
    };
  }

  if (mode === 'paused') {
    return {
      state: 'paused',
      playLabel: 'つづけて読む',
      playDisabled: false,
      stopDisabled: false,
      message: '読み上げを止めています。',
    };
  }

  return {
    state: 'idle',
    playLabel: 'よみあげ',
    playDisabled: false,
    stopDisabled: true,
    message: 'このページを読み上げます。',
  };
}

function createControls(documentObj, text) {
  const controls = documentObj.createElement('section');
  controls.className = 'page-tts-controls';
  controls.dataset.ttsControls = 'true';
  controls.dataset.ttsTextLength = String(text.length);

  controls.innerHTML = `
    <div class="page-tts-controls__header">
      <p class="page-tts-controls__title">音声で読む</p>
      <p class="page-tts-status" data-tts-status aria-live="polite"></p>
    </div>
    <div class="page-tts-controls__buttons">
      <button type="button" class="page-tts-button" data-tts-play>よみあげ</button>
      <button type="button" class="page-tts-button page-tts-button--subtle" data-tts-stop>止める</button>
    </div>
  `;

  return controls;
}

function applyControlState(controls, nextState) {
  controls.dataset.state = nextState.state;

  const playButton = controls.querySelector('[data-tts-play]');
  const stopButton = controls.querySelector('[data-tts-stop]');
  const status = controls.querySelector('[data-tts-status]');

  playButton.textContent = nextState.playLabel;
  playButton.disabled = nextState.playDisabled;
  stopButton.disabled = nextState.stopDisabled;
  status.textContent = nextState.message;
}

function buildUtterance(windowObj, text) {
  const utterance = new windowObj.SpeechSynthesisUtterance(text);
  const voices = windowObj.speechSynthesis.getVoices?.() ?? [];
  const voice = pickJapaneseVoice(voices);

  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang || 'ja-JP';
  } else {
    utterance.lang = 'ja-JP';
  }

  utterance.rate = 0.95;
  utterance.pitch = 1;

  return utterance;
}

export function mountPageTts(documentObj = document, windowObj = window) {
  if (documentObj.querySelector('[data-tts-controls="true"]')) {
    return null;
  }

  const main = documentObj.querySelector('main');
  const root = pickTextRoot(documentObj);

  if (!main || !root) {
    return null;
  }

  const pageTitle = normalizeText(main.querySelector('h1#_top, h1')?.textContent ?? '');
  const readableText = buildReadableText({ root, pageTitle });

  if (!readableText) {
    return null;
  }

  const controls = createControls(documentObj, readableText);

  if (root === main || !root.parentElement) {
    main.prepend(controls);
  } else {
    root.parentElement.insertBefore(controls, root);
  }

  const supported = Boolean(windowObj?.speechSynthesis && windowObj?.SpeechSynthesisUtterance);
  const synth = windowObj?.speechSynthesis;
  let currentUtterance = null;

  const setState = (mode, message) => {
    const baseState = getControlState({ supported, mode });
    applyControlState(controls, {
      ...baseState,
      message: message ?? baseState.message,
    });
  };

  setState('idle');

  if (!supported) {
    return { controls, readableText };
  }

  const playButton = controls.querySelector('[data-tts-play]');
  const stopButton = controls.querySelector('[data-tts-stop]');

  playButton.addEventListener('click', () => {
    if (synth.paused) {
      synth.resume();
      setState('speaking', '読み上げを再開しました。');
      return;
    }

    if (synth.speaking) {
      synth.pause();
      setState('paused');
      return;
    }

    const utterance = buildUtterance(windowObj, readableText);

    utterance.onend = () => {
      if (currentUtterance !== utterance) {
        return;
      }

      currentUtterance = null;
      setState('idle', '読み上げが終わりました。');
    };

    utterance.onpause = () => {
      if (currentUtterance !== utterance) {
        return;
      }

      setState('paused');
    };

    utterance.onresume = () => {
      if (currentUtterance !== utterance) {
        return;
      }

      setState('speaking', '読み上げを再開しました。');
    };

    utterance.onerror = () => {
      if (currentUtterance !== utterance) {
        return;
      }

      currentUtterance = null;
      setState('idle', '読み上げを始められませんでした。');
    };

    currentUtterance = utterance;
    setState('speaking', '読み上げを始めます。');
    synth.speak(utterance);
  });

  stopButton.addEventListener('click', () => {
    currentUtterance = null;
    synth.cancel();
    setState('idle', '読み上げを止めました。');
  });

  windowObj.addEventListener?.('pagehide', () => {
    currentUtterance = null;
    synth.cancel();
  });

  return { controls, readableText };
}
