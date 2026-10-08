// ABOUTME: resvgで実際の字形を測定し、日本語テキストをSVGの指定領域へ組みます。
// ABOUTME: 同梱フォントだけを使い、測定結果を再利用して単語と助詞の区切りを保ちます。
import { resolve } from 'node:path';
import { Resvg, type ResvgRenderOptions } from '@resvg/resvg-js';

const FONT_FAMILY = 'Zen Kaku Gothic New';
export const fontOptions: ResvgRenderOptions = {
  font: {
    fontFiles: [resolve('public/fonts/zen-kaku-gothic-new/ZenKakuGothicNew-Bold.ttf')],
    loadSystemFonts: false,
    defaultFontFamily: FONT_FAMILY,
  },
  languages: ['ja'],
};
type Bounds = { x: number; y: number; width: number; height: number };
const measurements = new Map<string, Bounds>();
const words = new Intl.Segmenter('ja', { granularity: 'word' });
const graphemes = new Intl.Segmenter('ja', { granularity: 'grapheme' });

function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function measure(text: string): Bounds {
  const cached = measurements.get(text);
  if (cached) return cached;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="10000" height="200">
    <text y="100" font-family="${FONT_FAMILY}" font-size="100" font-weight="700">${escapeXml(text)}</text>
  </svg>`;
  const bounds = new Resvg(svg, fontOptions).getBBox();
  const result = bounds
    ? { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }
    : { x: 0, y: 0, width: 0, height: 0 };
  measurements.set(text, result);
  return result;
}

function wordGroups(text: string): string[] {
  const groups: string[] = [];
  const attached = /^(の|に|を|は|が|で|と|も|へ|や|から|まで|だけ|って|[、。！？）」』])$/u;
  let opening = '';
  for (const { segment } of words.segment(text)) {
    if (/^[（「『]$/u.test(segment)) {
      opening += segment;
    } else if (groups.length && attached.test(segment) && !/\s$/u.test(groups[groups.length - 1])) {
      groups[groups.length - 1] += opening + segment;
      opening = '';
    } else {
      groups.push(opening + segment);
      opening = '';
    }
  }
  if (opening) groups.push(opening);
  return groups;
}

function wrap(tokens: string[], fontSize: number, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  const append = (token: string) => {
    const candidate = (line + token).trimStart();
    if (measure(candidate.trim()).width * fontSize / 100 <= width) {
      line = candidate;
      return;
    }
    if (line.trim()) {
      lines.push(line.trim());
      line = '';
      append(token);
      return;
    }
    const characters = Array.from(graphemes.segment(token), ({ segment }) => segment);
    if (characters.length > 1) characters.forEach(append);
    else line = token;
  };
  tokens.forEach(append);
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function dimensions(lines: string[], fontSize: number) {
  const lineHeight = fontSize + 10;
  const measured = lines.map((text) => ({ text, bounds: measure(text),
    width: measure(text).width * fontSize / 100 }));
  return {
    lines: measured, fontSize, lineHeight,
    width: Math.max(0, ...measured.map(({ width }) => width)),
    height: Math.max(0, measured.length - 1) * lineHeight
      + Math.max(0, ...measured.map(({ bounds }) => bounds.height * fontSize / 100)),
  };
}

export function layoutText(text: string, { fontSize: requestedSize, width, height, balance = false }: {
  fontSize: number; width: number; height: number; balance?: boolean;
}) {
  const tokens = wordGroups(text.replace(/\s+/gu, ' ').trim());
  for (let fontSize = requestedSize; ; fontSize = Math.max(12, fontSize - 4)) {
    let layout = dimensions(wrap(tokens, fontSize, width), fontSize);
    if (layout.width <= width && layout.height <= height) {
      if (balance && layout.lines.length > 1) {
        let low = fontSize;
        let high = width;
        for (let attempt = 0; attempt < 7 && high - low > 2; attempt++) {
          const candidateWidth = (low + high) / 2;
          const candidate = dimensions(wrap(tokens, fontSize, candidateWidth), fontSize);
          if (candidate.lines.length <= layout.lines.length && candidate.height <= height) {
            high = candidateWidth;
            layout = candidate;
          } else low = candidateWidth;
        }
      }
      return layout;
    }
    if (fontSize === 12) {
      const scale = Math.min(width / layout.width, height / layout.height);
      return { ...layout, fontSize: fontSize * scale, lineHeight: layout.lineHeight * scale,
        width: layout.width * scale, height: layout.height * scale,
        lines: layout.lines.map((line) => ({ ...line, width: line.width * scale })) };
    }
  }
}

export function textSvg(layout: ReturnType<typeof layoutText>, left: number, top: number, color: string): string {
  const scale = layout.fontSize / 100;
  return `<g fill="${color}" font-family="${FONT_FAMILY}" font-weight="700" font-size="${layout.fontSize}">
    ${layout.lines.map(({ text, bounds }, i) =>
      `<text x="${left - bounds.x * scale}" y="${top + i * layout.lineHeight + (100 - bounds.y) * scale}">${escapeXml(text)}</text>`,
    ).join('')}
  </g>`;
}
