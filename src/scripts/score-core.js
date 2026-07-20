// ABOUTME: 単旋律の楽譜データから、五線譜のSVGと再生用の音イベントを作ります。
// ABOUTME: 表示と再生を同じデータから導くため、譜面と鳴る音がずれません。

const STEPS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const BEATS = { w: 4, h: 2, q: 1, e: 0.5 };

// ト音記号の五線は、下から順に E4 G4 B4 D5 F5。E4 を基準の高さとして扱います。
const BOTTOM_LINE = 4 * 7 + 2;

const LINE_GAP = 10;
const STAFF_HEIGHT = LINE_GAP * 4;
const NOTE_STEP = LINE_GAP / 2;
const LEFT_PAD = 62;
const RIGHT_PAD = 12;
const NOTE_GAP = 30;
const TOP_PAD = 34;
const BOTTOM_PAD = 44;

/** 音名を、ドを0とする通し番号（ダイアトニック段数）に変換します。 */
export function diatonicIndex(step, octave) {
  const position = STEPS.indexOf(step);
  if (position === -1) throw new RangeError(`使えない音名です: ${step}`);
  return octave * 7 + position;
}

/** 音名を MIDI ノート番号に変換します。C4 が 60 です。 */
export function toMidi(step, octave) {
  const semitone = SEMITONES[step];
  if (semitone === undefined) throw new RangeError(`使えない音名です: ${step}`);
  return 12 * (octave + 1) + semitone;
}

/** MIDI ノート番号を周波数（Hz）に変換します。A4 = 440Hz を基準にします。 */
export function toFrequency(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

/** 音符の長さを、四分音符を1とした拍数に変換します。付点は1.5倍です。 */
export function toBeats(note) {
  const base = BEATS[note.dur];
  if (base === undefined) throw new RangeError(`使えない音の長さです: ${note.dur}`);
  return note.dot ? base * 1.5 : base;
}

/**
 * 各小節の拍数が拍子と合っているかを確認します。
 * 弱起（1小節目が短い）は認めますが、途中の小節では認めません。
 */
export function findMeasureErrors(score) {
  const perMeasure = score.timeSignature[0] * (4 / score.timeSignature[1]);
  const errors = [];

  score.measures.forEach((measure, index) => {
    const total = measure.notes.reduce((sum, note) => sum + toBeats(note), 0);
    const isPickup = index === 0 && score.pickup === true;
    const isLast = index === score.measures.length - 1;
    // 弱起の曲は、最後の小節が пickup のぶんだけ短くなることがあります。
    const allowShort = isPickup || (isLast && score.pickup === true);
    if (total > perMeasure || (!allowShort && total < perMeasure)) {
      errors.push({ measure: index + 1, beats: total, expected: perMeasure });
    }
  });
  return errors;
}

/** 楽譜データを、再生用の音イベント列に変換します。 */
export function scoreToEvents(score, bpm = 90) {
  const secondsPerBeat = 60 / bpm;
  const events = [];
  let time = 0;

  for (const measure of score.measures) {
    for (const note of measure.notes) {
      const seconds = toBeats(note) * secondsPerBeat;
      if (!note.rest) {
        const midi = toMidi(note.step, note.octave);
        events.push({
          midi,
          frequency: toFrequency(midi),
          startSeconds: time,
          durationSeconds: seconds,
          measure: measure.number ?? null,
        });
      }
      time += seconds;
    }
  }
  return { events, totalSeconds: time };
}

function noteY(note, staffTop) {
  const bottomY = staffTop + STAFF_HEIGHT;
  return bottomY - (diatonicIndex(note.step, note.octave) - BOTTOM_LINE) * NOTE_STEP;
}

function ledgerLines(note, staffTop) {
  const index = diatonicIndex(note.step, note.octave);
  const lines = [];
  // 五線の下（ド の位置など）
  for (let d = BOTTOM_LINE - 2; d >= index; d -= 2) {
    lines.push(staffTop + STAFF_HEIGHT + (BOTTOM_LINE - d) * NOTE_STEP);
  }
  // 五線の上
  for (let d = BOTTOM_LINE + 10; d <= index; d += 2) {
    lines.push(staffTop + STAFF_HEIGHT - (d - BOTTOM_LINE) * NOTE_STEP);
  }
  return lines;
}

function escapeText(value) {
  return String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

function renderNoteHead(note, x, y) {
  const hollow = note.dur === 'w' || note.dur === 'h';
  const fill = hollow ? 'none' : 'currentColor';
  return `<ellipse cx="${x}" cy="${y}" rx="6" ry="4.5" fill="${fill}" stroke="currentColor" stroke-width="1.6" transform="rotate(-18 ${x} ${y})" />`;
}

function renderStem(note, x, y, staffTop) {
  if (note.dur === 'w') return '';
  const middle = staffTop + STAFF_HEIGHT / 2;
  const up = y > middle;
  const x1 = up ? x + 5.6 : x - 5.6;
  const y2 = up ? y - 30 : y + 30;
  let markup = `<line x1="${x1}" y1="${y}" x2="${x1}" y2="${y2}" stroke="currentColor" stroke-width="1.6" />`;
  if (note.dur === 'e') {
    const dir = up ? 1 : -1;
    markup += `<path d="M${x1} ${y2} q 8 ${4 * dir} 7 ${11 * dir}" fill="none" stroke="currentColor" stroke-width="1.6" />`;
  }
  return markup;
}

function renderRest(note, x, staffTop) {
  const middle = staffTop + STAFF_HEIGHT / 2;
  if (note.dur === 'w' || note.dur === 'h') {
    const y = note.dur === 'w' ? middle - NOTE_STEP : middle;
    return `<rect x="${x - 7}" y="${y - 3}" width="14" height="4" fill="currentColor" />`;
  }
  if (note.dur === 'e') {
    return `<path d="M${x - 3} ${middle + 8} l 7 -14 M${x + 4} ${middle - 6} a 3.4 3.4 0 1 0 -3 -2" fill="none" stroke="currentColor" stroke-width="1.7" />`;
  }
  return `<path d="M${x - 4} ${middle - 12} l 7.5 8.5 l -7 6.5 l 7 8" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round" />`;
}

function renderTrebleClef(x, staffTop) {
  // ト音記号は G4 の線（下から2番目）を中心に巻きます。
  const gLine = staffTop + STAFF_HEIGHT - NOTE_STEP * 2;
  return `<text x="${x}" y="${gLine + 22}" font-size="46" font-family="serif" fill="currentColor">&#119070;</text>`;
}

/**
 * 楽譜データから五線譜のSVG文字列を作ります。
 * options.showSolfa / options.showFingering で補助表示を切り替えます。
 */
export function makeScoreSvg(score, options = {}) {
  const { showSolfa = false, showFingering = false, measuresPerLine = 4 } = options;
  const errors = findMeasureErrors(score);
  if (errors.length > 0) {
    const detail = errors.map((e) => `${e.measure}小節目(${e.beats}拍)`).join(', ');
    throw new RangeError(`拍数が拍子と合いません: ${detail}`);
  }

  const rows = [];
  for (let i = 0; i < score.measures.length; i += measuresPerLine) {
    rows.push(score.measures.slice(i, i + measuresPerLine));
  }

  const rowHeight = STAFF_HEIGHT + TOP_PAD + BOTTOM_PAD;
  let widest = 0;
  const rowMarkup = rows.map((row, rowIndex) => {
    const staffTop = rowIndex * rowHeight + TOP_PAD;
    let x = LEFT_PAD;
    let body = '';

    row.forEach((measure, measureIndex) => {
      const startX = x;
      measure.notes.forEach((note) => {
        const y = note.rest ? staffTop : noteY(note, staffTop);
        if (note.rest) {
          body += renderRest(note, x, staffTop);
        } else {
          for (const ly of ledgerLines(note, staffTop)) {
            body += `<line x1="${x - 11}" y1="${ly}" x2="${x + 11}" y2="${ly}" stroke="currentColor" stroke-width="1.4" />`;
          }
          body += renderNoteHead(note, x, y);
          body += renderStem(note, x, y, staffTop);
          if (note.dot) {
            body += `<circle cx="${x + 11}" cy="${y - 0.5}" r="1.9" fill="currentColor" />`;
          }
          if (showSolfa && note.solfa) {
            // 下第一線のドと重ならない高さに置きます。
            body += `<text x="${x}" y="${staffTop + STAFF_HEIGHT + 27}" font-size="11" text-anchor="middle" fill="currentColor">${escapeText(note.solfa)}</text>`;
          }
          if (showFingering && note.finger) {
            body += `<text x="${x}" y="${staffTop - 9}" font-size="11" text-anchor="middle" fill="currentColor">${escapeText(note.finger)}</text>`;
          }
        }
        x += NOTE_GAP;
      });

      const isLastOfPiece =
        rowIndex === rows.length - 1 && measureIndex === row.length - 1;
      const barX = x - NOTE_GAP / 2;
      if (isLastOfPiece) {
        body += `<line x1="${barX - 5}" y1="${staffTop}" x2="${barX - 5}" y2="${staffTop + STAFF_HEIGHT}" stroke="currentColor" stroke-width="1.4" />`;
        body += `<rect x="${barX - 2}" y="${staffTop}" width="4" height="${STAFF_HEIGHT}" fill="currentColor" />`;
      } else {
        body += `<line x1="${barX}" y1="${staffTop}" x2="${barX}" y2="${staffTop + STAFF_HEIGHT}" stroke="currentColor" stroke-width="1.4" />`;
      }

      // 小節番号は各段の先頭だけに出します。
      // 全小節に出すと、指番号と数字が二段に並んで読み分けにくくなります。
      if (measure.number && measureIndex === 0) {
        body += `<text x="${startX - 8}" y="${staffTop - 26}" font-size="10" fill="currentColor">${escapeText(measure.number)}</text>`;
      }
      x += NOTE_GAP / 2;
    });

    // 五線は、その行の最後の小節線までで止めます。
    const rowEnd = Math.round(x - NOTE_GAP / 2);
    widest = Math.max(widest, rowEnd + RIGHT_PAD);

    let head = '';
    for (let line = 0; line < 5; line += 1) {
      const y = staffTop + line * LINE_GAP;
      head += `<line class="score-staff-line" x1="8" y1="${y}" x2="${rowEnd}" y2="${y}" stroke="currentColor" stroke-width="1.2" />`;
    }
    head += renderTrebleClef(10, staffTop);
    if (rowIndex === 0) {
      const [beats, unit] = score.timeSignature;
      head += `<text x="47" y="${staffTop + LINE_GAP * 1.85}" font-size="16" font-weight="700" text-anchor="middle" fill="currentColor">${beats}</text>`;
      head += `<text x="47" y="${staffTop + LINE_GAP * 3.85}" font-size="16" font-weight="700" text-anchor="middle" fill="currentColor">${unit}</text>`;
    }
    return head + body;
  });

  const width = Math.ceil(widest);
  const height = rows.length * rowHeight;
  const inner = rowMarkup.join('');
  const title = score.title ? `<title>${escapeText(score.title)}の楽譜</title>` : '';

  return `<svg class="score-svg" viewBox="0 0 ${width} ${height}" width="100%" role="img" aria-label="${escapeText(score.title ?? '楽譜')}" xmlns="http://www.w3.org/2000/svg">${title}${inner}</svg>`;
}
