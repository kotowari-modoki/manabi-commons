// ABOUTME: 楽譜データからSVGと再生イベントを作る処理を検証します。
// ABOUTME: 譜面の高さ・拍数と、再生される音の高さ・長さが一致することを確認します。

import { describe, expect, it } from 'vitest';
import {
  diatonicIndex,
  findMeasureErrors,
  makeScoreSvg,
  scoreToEvents,
  toBeats,
  toFrequency,
  toMidi,
} from './score-core.js';

const fourFour = (notes: unknown[]) => ({
  title: 'テスト',
  timeSignature: [4, 4] as [number, number],
  measures: [{ number: 1, notes }],
});

describe('音の高さ', () => {
  it('C4 を MIDI 60 として扱う', () => {
    expect(toMidi('C', 4)).toBe(60);
    expect(toMidi('A', 4)).toBe(69);
  });

  it('A4 を 440Hz として扱う', () => {
    expect(toFrequency(69)).toBeCloseTo(440, 6);
    expect(toFrequency(81)).toBeCloseTo(880, 6);
  });

  it('ダイアトニック段数が音名順に1ずつ増える', () => {
    expect(diatonicIndex('D', 4) - diatonicIndex('C', 4)).toBe(1);
    expect(diatonicIndex('C', 5) - diatonicIndex('B', 4)).toBe(1);
  });

  it('使えない音名を拒否する', () => {
    expect(() => toMidi('H', 4)).toThrow(RangeError);
  });
});

describe('音の長さ', () => {
  it('四分音符を1拍として数える', () => {
    expect(toBeats({ dur: 'q' })).toBe(1);
    expect(toBeats({ dur: 'h' })).toBe(2);
    expect(toBeats({ dur: 'w' })).toBe(4);
    expect(toBeats({ dur: 'e' })).toBe(0.5);
  });

  it('付点で1.5倍になる', () => {
    expect(toBeats({ dur: 'h', dot: true })).toBe(3);
    expect(toBeats({ dur: 'q', dot: true })).toBe(1.5);
  });
});

describe('小節の拍数', () => {
  it('拍子と合っていれば問題を返さない', () => {
    const score = fourFour([
      { step: 'C', octave: 4, dur: 'q' },
      { step: 'D', octave: 4, dur: 'q' },
      { step: 'E', octave: 4, dur: 'h' },
    ]);
    expect(findMeasureErrors(score)).toEqual([]);
  });

  it('拍数が足りない小節を見つける', () => {
    const score = fourFour([{ step: 'C', octave: 4, dur: 'q' }]);
    expect(findMeasureErrors(score)).toEqual([
      { measure: 1, beats: 1, expected: 4 },
    ]);
  });

  it('3拍子を正しく数える', () => {
    const score = {
      timeSignature: [3, 4] as [number, number],
      measures: [{ number: 1, notes: [{ step: 'G', octave: 4, dur: 'h', dot: true }] }],
    };
    expect(findMeasureErrors(score)).toEqual([]);
  });

  it('弱起の曲では最初と最後の小節が短くてよい', () => {
    const score = {
      timeSignature: [3, 4] as [number, number],
      pickup: true,
      measures: [
        { number: 0, notes: [{ step: 'G', octave: 4, dur: 'q' }] },
        { number: 1, notes: [{ step: 'C', octave: 5, dur: 'h', dot: true }] },
        { number: 2, notes: [{ step: 'C', octave: 5, dur: 'h' }] },
      ],
    };
    expect(findMeasureErrors(score)).toEqual([]);
  });
});

describe('再生イベント', () => {
  it('譜面の音の高さと長さがそのまま再生に反映される', () => {
    const score = fourFour([
      { step: 'C', octave: 4, dur: 'h' },
      { step: 'G', octave: 4, dur: 'h' },
    ]);
    const { events, totalSeconds } = scoreToEvents(score, 60);

    expect(events).toHaveLength(2);
    expect(events[0].midi).toBe(60);
    expect(events[0].startSeconds).toBe(0);
    expect(events[0].durationSeconds).toBe(2);
    expect(events[1].midi).toBe(67);
    expect(events[1].startSeconds).toBe(2);
    expect(totalSeconds).toBe(4);
  });

  it('テンポを遅くすると音が長くなる', () => {
    const score = fourFour([{ step: 'C', octave: 4, dur: 'w' }]);
    expect(scoreToEvents(score, 60).totalSeconds).toBe(4);
    expect(scoreToEvents(score, 30).totalSeconds).toBe(8);
  });

  it('休符は音を鳴らさないが時間は進む', () => {
    const score = fourFour([
      { rest: true, dur: 'h' },
      { step: 'E', octave: 4, dur: 'h' },
    ]);
    const { events } = scoreToEvents(score, 60);

    expect(events).toHaveLength(1);
    expect(events[0].startSeconds).toBe(2);
  });
});

describe('五線譜のSVG', () => {
  const score = fourFour([
    { step: 'C', octave: 4, dur: 'q', solfa: 'ド', finger: 1 },
    { step: 'E', octave: 4, dur: 'q' },
    { step: 'G', octave: 4, dur: 'h' },
  ]);

  it('五線とSVG要素を出力する', () => {
    const svg = makeScoreSvg(score);
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('viewBox');
    expect([...svg.matchAll(/class="score-staff-line"/g)]).toHaveLength(5);
  });

  it('高い音ほど上に描く', () => {
    const svg = makeScoreSvg(score);
    const heads = [...svg.matchAll(/<ellipse cx="([\d.]+)" cy="([\d.]+)"/g)].map((m) => ({
      x: Number(m[1]),
      y: Number(m[2]),
    }));

    expect(heads).toHaveLength(3);
    expect(heads[0].y).toBeGreaterThan(heads[1].y);
    expect(heads[1].y).toBeGreaterThan(heads[2].y);
    expect(heads[0].x).toBeLessThan(heads[1].x);
  });

  it('補助表示は指定したときだけ出す', () => {
    expect(makeScoreSvg(score)).not.toContain('ド');
    expect(makeScoreSvg(score, { showSolfa: true })).toContain('ド');
  });

  it('拍数が合わない楽譜は描画せずに知らせる', () => {
    const broken = fourFour([{ step: 'C', octave: 4, dur: 'q' }]);
    expect(() => makeScoreSvg(broken)).toThrow(/拍数/);
  });
});
