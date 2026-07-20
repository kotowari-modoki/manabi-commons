// ABOUTME: 教材に載せる全楽譜データが、拍子と小節の決まりに合っているかを確認します。
// ABOUTME: 楽譜を追加したときの拍数の間違いを、公開前にここで見つけます。

import { describe, expect, it } from 'vitest';
import { SCORES } from './score-data.js';
import { findMeasureErrors, makeScoreSvg, scoreToEvents } from './score-core.js';

const entries = Object.entries(SCORES);

describe('楽譜データ', () => {
  it('楽譜が登録されている', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)('%s は拍子どおりの小節になっている', (_id, score) => {
    expect(findMeasureErrors(score)).toEqual([]);
  });

  it.each(entries)('%s はSVGとして描画できる', (_id, score) => {
    const svg = makeScoreSvg(score);
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it.each(entries)('%s は再生イベントを作れる', (_id, score) => {
    const { events, totalSeconds } = scoreToEvents(score, 80);
    expect(totalSeconds).toBeGreaterThan(0);
    for (const event of events) {
      // 子どもが鍵盤で無理なく出せる範囲に収まっているかを見ます。
      expect(event.frequency).toBeGreaterThan(100);
      expect(event.frequency).toBeLessThan(2000);
      expect(event.durationSeconds).toBeGreaterThan(0);
    }
  });

  it.each(entries)('%s は題名を持っている', (_id, score) => {
    expect(typeof score.title).toBe('string');
    expect(score.title.length).toBeGreaterThan(0);
  });
});
