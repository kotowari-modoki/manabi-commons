// ABOUTME: 五線譜の再生ボタンを有効にし、Web Audio で楽譜どおりの音を鳴らします。
// ABOUTME: 音源ファイルを使わず、ブラウザの合成音だけで再生します。

import { scoreToEvents } from './score-core.js';
import { SCORES } from './score-data.js';

let audioContext = null;
let playing = null;

function getContext() {
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!audioContext) audioContext = new Ctor();
  return audioContext;
}

function stopPlayback() {
  if (!playing) return;
  for (const node of playing.nodes) {
    try {
      node.stop();
    } catch {
      // すでに止まっている場合は何もしません。
    }
  }
  playing.figure.classList.remove('is-playing');
  const status = playing.figure.querySelector('[data-score-status]');
  if (status) status.textContent = '';
  clearTimeout(playing.timer);
  playing = null;
}

function play(figure) {
  stopPlayback();

  const context = getContext();
  const status = figure.querySelector('[data-score-status]');
  if (!context) {
    if (status) status.textContent = 'この端末では音を鳴らせません。楽譜は読めます。';
    return;
  }
  // 端末によっては、操作のあとでないと音が出せない状態から始まります。
  if (context.state === 'suspended') context.resume();

  const score = SCORES[figure.dataset.scoreId];
  if (!score) return;

  const rate = Number(figure.querySelector('[data-score-tempo]')?.value ?? 1);
  const baseTempo = Number(figure.dataset.tempo ?? 80);
  const { events, totalSeconds } = scoreToEvents(score, baseTempo * rate);

  const startAt = context.currentTime + 0.08;
  const nodes = [];

  for (const event of events) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const begin = startAt + event.startSeconds;
    // 実際の長さより少し短く鳴らし、隣り合う音がつながって聞こえないようにします。
    const end = begin + Math.max(event.durationSeconds - 0.06, 0.08);

    oscillator.type = 'triangle';
    oscillator.frequency.value = event.frequency;

    gain.gain.setValueAtTime(0, begin);
    gain.gain.linearRampToValueAtTime(0.22, begin + 0.02);
    gain.gain.setValueAtTime(0.22, Math.max(end - 0.05, begin + 0.03));
    gain.gain.linearRampToValueAtTime(0, end);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(begin);
    oscillator.stop(end + 0.02);
    nodes.push(oscillator);
  }

  figure.classList.add('is-playing');
  if (status) status.textContent = '鳴らしています';

  playing = {
    figure,
    nodes,
    timer: setTimeout(stopPlayback, (totalSeconds + 0.4) * 1000),
  };
}

export function mountScorePlayers(documentObj = document) {
  const figures = documentObj.querySelectorAll('.mu-score[data-score-id]');
  let mounted = 0;

  for (const figure of figures) {
    const controls = figure.querySelector('.mu-score-controls');
    if (!controls || controls.dataset.ready === 'true') continue;

    controls.hidden = false;
    controls.dataset.ready = 'true';
    figure.querySelector('[data-score-play]')?.addEventListener('click', () => play(figure));
    figure.querySelector('[data-score-stop]')?.addEventListener('click', stopPlayback);
    mounted += 1;
  }
  return mounted;
}

const mount = () => mountScorePlayers(document);

document.addEventListener('DOMContentLoaded', mount, { once: true });
document.addEventListener('astro:page-load', mount);
document.addEventListener('astro:before-swap', stopPlayback);
window.addEventListener('beforeprint', stopPlayback);
