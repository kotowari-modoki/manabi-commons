// ABOUTME: 教材で使う楽譜データをまとめます。表示と再生の両方がここを参照します。
// ABOUTME: 曲の旋律を追加するときは、権利状態と音の正しさを確認してから登録します。

/**
 * 楽譜データの書き方
 *   timeSignature: [拍数, 音符の種類] 例 [4, 4]
 *   pickup: true にすると、最初と最後の小節が短くてもよくなります（弱起）
 *   notes の dur: 'w' 全音符 / 'h' 二分音符 / 'q' 四分音符 / 'e' 八分音符
 *                 dot: true で付点（1.5倍）
 *   solfa / finger は補助表示用で、表示するかは各ページで選びます。
 */
export const SCORES = {
  'do-re-mi': {
    title: 'ドから高いドまで',
    timeSignature: [4, 4],
    measures: [
      {
        number: 1,
        notes: [
          { step: 'C', octave: 4, dur: 'q', solfa: 'ド', finger: 1 },
          { step: 'D', octave: 4, dur: 'q', solfa: 'レ', finger: 2 },
          { step: 'E', octave: 4, dur: 'q', solfa: 'ミ', finger: 3 },
          { step: 'F', octave: 4, dur: 'q', solfa: 'ファ', finger: 4 },
        ],
      },
      {
        number: 2,
        notes: [
          { step: 'G', octave: 4, dur: 'q', solfa: 'ソ', finger: 5 },
          { step: 'A', octave: 4, dur: 'q', solfa: 'ラ' },
          { step: 'B', octave: 4, dur: 'q', solfa: 'シ' },
          { step: 'C', octave: 5, dur: 'q', solfa: 'ド' },
        ],
      },
      {
        number: 3,
        notes: [{ step: 'C', octave: 5, dur: 'w', solfa: 'ド' }],
      },
    ],
  },

  'onaji-oto': {
    title: '同じ音がつづくところ',
    timeSignature: [4, 4],
    measures: [
      {
        number: 1,
        notes: [
          { step: 'G', octave: 4, dur: 'q', solfa: 'ソ' },
          { step: 'G', octave: 4, dur: 'q', solfa: 'ソ' },
          { step: 'G', octave: 4, dur: 'q', solfa: 'ソ' },
          { step: 'E', octave: 4, dur: 'q', solfa: 'ミ' },
        ],
      },
      {
        number: 2,
        notes: [
          { step: 'F', octave: 4, dur: 'q', solfa: 'ファ' },
          { step: 'F', octave: 4, dur: 'q', solfa: 'ファ' },
          { step: 'E', octave: 4, dur: 'h', solfa: 'ミ' },
        ],
      },
    ],
  },

  'onpu-no-nagasa': {
    title: '音符の長さをくらべる',
    timeSignature: [4, 4],
    measures: [
      { number: 1, notes: [{ step: 'G', octave: 4, dur: 'w' }] },
      {
        number: 2,
        notes: [
          { step: 'G', octave: 4, dur: 'h' },
          { step: 'G', octave: 4, dur: 'h' },
        ],
      },
      {
        number: 3,
        notes: [
          { step: 'G', octave: 4, dur: 'q' },
          { step: 'G', octave: 4, dur: 'q' },
          { step: 'G', octave: 4, dur: 'q' },
          { step: 'G', octave: 4, dur: 'q' },
        ],
      },
      {
        number: 4,
        notes: [
          { step: 'G', octave: 4, dur: 'e' },
          { step: 'G', octave: 4, dur: 'e' },
          { step: 'G', octave: 4, dur: 'e' },
          { step: 'G', octave: 4, dur: 'e' },
          { step: 'G', octave: 4, dur: 'q' },
          { step: 'G', octave: 4, dur: 'q' },
        ],
      },
    ],
  },

  'tenten-onpu': {
    title: '付点二分音符と休符',
    timeSignature: [4, 4],
    measures: [
      {
        number: 1,
        notes: [
          { step: 'E', octave: 4, dur: 'h', dot: true },
          { step: 'D', octave: 4, dur: 'q' },
        ],
      },
      {
        number: 2,
        notes: [
          { step: 'C', octave: 4, dur: 'h' },
          { rest: true, dur: 'h' },
        ],
      },
      {
        number: 3,
        notes: [
          { step: 'E', octave: 4, dur: 'q' },
          { rest: true, dur: 'q' },
          { step: 'G', octave: 4, dur: 'q' },
          { rest: true, dur: 'q' },
        ],
      },
    ],
  },

  'yonbunno-yon': {
    title: '4分の4拍子',
    timeSignature: [4, 4],
    measures: [
      {
        number: 1,
        notes: [
          { step: 'C', octave: 4, dur: 'q' },
          { step: 'D', octave: 4, dur: 'q' },
          { step: 'E', octave: 4, dur: 'q' },
          { step: 'F', octave: 4, dur: 'q' },
        ],
      },
      {
        number: 2,
        notes: [
          { step: 'G', octave: 4, dur: 'h' },
          { step: 'E', octave: 4, dur: 'h' },
        ],
      },
    ],
  },

  'sanbyoushi': {
    title: '3拍子',
    timeSignature: [3, 4],
    measures: [
      {
        number: 1,
        notes: [
          { step: 'C', octave: 4, dur: 'q' },
          { step: 'E', octave: 4, dur: 'q' },
          { step: 'G', octave: 4, dur: 'q' },
        ],
      },
      {
        number: 2,
        notes: [{ step: 'C', octave: 5, dur: 'h', dot: true }],
      },
    ],
  },

  'jakki': {
    title: '弱起（1拍目より前から始まる）',
    timeSignature: [3, 4],
    pickup: true,
    measures: [
      { number: 0, notes: [{ step: 'G', octave: 4, dur: 'q' }] },
      {
        number: 1,
        notes: [
          { step: 'C', octave: 5, dur: 'h' },
          { step: 'C', octave: 5, dur: 'q' },
        ],
      },
      {
        number: 2,
        notes: [{ step: 'A', octave: 4, dur: 'h', dot: true }],
      },
      { number: 3, notes: [{ step: 'G', octave: 4, dur: 'h' }] },
    ],
  },

  'kugitte-renshuu': {
    title: '区切って練習する例',
    timeSignature: [4, 4],
    measures: [
      {
        number: 1,
        notes: [
          { step: 'E', octave: 4, dur: 'q' },
          { step: 'G', octave: 4, dur: 'q' },
          { step: 'A', octave: 4, dur: 'h' },
        ],
      },
      {
        number: 2,
        notes: [
          { step: 'G', octave: 4, dur: 'e' },
          { step: 'F', octave: 4, dur: 'e' },
          { step: 'E', octave: 4, dur: 'h' },
          { rest: true, dur: 'q' },
        ],
      },
    ],
  },
};
