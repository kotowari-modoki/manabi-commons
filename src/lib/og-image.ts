// ABOUTME: 教材のタイトルと教科から、共有用の日本語OGP画像とメタデータを作ります。
// ABOUTME: 同梱フォントとSharpで描画し、公開ビルド中に外部サービスへ接続しません。
import { resolve } from 'node:path';
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;
const SITE_NAME = 'まなびコモンズ';
const FONT_FILE = resolve('public/fonts/zen-kaku-gothic-new/ZenKakuGothicNew-Bold.ttf');

type HeadEntry = { tag: string; attrs?: Record<string, unknown> };
type MetaTag = { tag: 'meta'; attrs: Record<string, string> };

export function getOgImagePath(id: string, base: string): string {
  const prefix = base.replace(/^\/+|\/+$/g, '');
  const slug = (id || 'index').split('/').map(encodeURIComponent).join('/');
  return `${prefix ? `/${prefix}` : ''}/og/${slug}.png`;
}

/** Return only missing tags, preserving images explicitly configured in frontmatter. */
export function getSocialImageTags({ id, title, site, base, head = [] }: {
  id: string;
  title: string;
  site: URL;
  base: string;
  head?: readonly HeadEntry[];
}): MetaTag[] {
  const tags: MetaTag[] = [];
  const existing = (key: string) => head.find(({ tag, attrs }) =>
    tag === 'meta' && (attrs?.property === key || attrs?.name === key),
  )?.attrs?.content;
  const add = (key: string, content: string) => {
    if (existing(key) !== undefined) return;
    tags.push({ tag: 'meta', attrs: {
      [key.startsWith('og:') ? 'property' : 'name']: key, content,
    } });
  };
  const customImage = existing('og:image');
  const image = typeof customImage === 'string'
    ? customImage : new URL(getOgImagePath(id, base), site).href;
  const alt = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;

  if (!customImage) {
    add('og:image', image);
    add('og:image:type', 'image/png');
    add('og:image:width', String(WIDTH));
    add('og:image:height', String(HEIGHT));
    add('og:image:alt', alt);
  }
  add('twitter:card', 'summary_large_image');
  if (!existing('twitter:image')) {
    add('twitter:image', image);
    const imageAlt = existing('og:image:alt') ?? (!customImage ? alt : undefined);
    if (typeof imageAlt === 'string') add('twitter:image:alt', imageAlt);
  }
  return tags;
}

const themes: Record<string, { label: string; color: string; light: string }> = {
  math: { label: '算数・数学', color: '#2563eb', light: '#e1ecff' },
  japanese: { label: '国語', color: '#be4b64', light: '#fce4e9' },
  science: { label: '理科', color: '#18785b', light: '#dff3e7' },
  social: { label: '社会', color: '#b06a16', light: '#fff0d3' },
  english: { label: '外国語', color: '#6750b5', light: '#ece5fb' },
  music: { label: '音楽', color: '#9a4384', light: '#f5e3f0' },
  art: { label: '図工・アート', color: '#bf572b', light: '#ffe9db' },
  'physical-education': { label: '体育', color: '#167d91', light: '#dff3f6' },
  'school-guide': { label: '学びのガイド', color: '#457552', light: '#e6f0dc' },
  'parent-guide': { label: 'おうちの方へ', color: '#95632f', light: '#f6ead9' },
  about: { label: 'このサイトについて', color: '#526981', light: '#e5edf5' },
};
const defaultTheme = { label: '無料の教科書', color: '#2563eb', light: '#e1ecff' };

function escapeMarkup(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function titleMarkup(text: string): string {
  const groups: string[] = [];
  const particles = /^(の|に|を|は|が|で|と|も|へ|や|から|まで|だけ|って|[、。！？）」』])$/u;
  for (const { segment } of new Intl.Segmenter('ja', { granularity: 'word' }).segment(text)) {
    if (groups.length && particles.test(segment) && !/\s$/u.test(groups[groups.length - 1])) {
      groups[groups.length - 1] += segment;
    } else {
      groups.push(segment);
    }
  }
  return groups.map((group) => /^\s+$/u.test(group) ? group
    : `<span allow_breaks="false">${escapeMarkup(group)}</span>`).join('');
}

/** Pango handles Japanese line breaking; measure the result before placing it on the card. */
async function textBlock(text: string, size: number, color: string, width: number, height: number, balance = false) {
  const normalized = text.replace(/\s+/gu, ' ').trim();
  const content = balance ? titleMarkup(normalized) : escapeMarkup(normalized);
  for (let fontSize = size; ; fontSize = Math.max(12, fontSize - 4)) {
    const render = (lineWidth: number) => sharp({ text: {
      text: `<span foreground="${color}">${content}</span>`,
      font: `Zen Kaku Gothic New Bold ${fontSize}`,
      fontfile: FONT_FILE,
      width: lineWidth,
      spacing: 10,
      wrap: 'word-char',
      rgba: true,
    } }).png().toBuffer({ resolveWithObject: true });
    let result = await render(width);
    if (result.info.width <= width && result.info.height <= height) {
      if (balance && result.info.height > fontSize * 1.5) {
        // Find a narrower measure with the same line count, avoiding a lone final character.
        const maxHeight = Math.min(height, result.info.height + Math.floor(fontSize / 10));
        let low = fontSize;
        let high = width;
        for (let attempt = 0; attempt < 7 && high - low > 2; attempt++) {
          const candidateWidth = Math.floor((low + high) / 2);
          const candidate = await render(candidateWidth);
          if (candidate.info.height <= maxHeight && candidate.info.width <= width) {
            high = candidateWidth;
            result = candidate;
          } else {
            low = candidateWidth;
          }
        }
      }
      return result;
    }
    if (fontSize === 12) {
      return sharp(result.data).resize({ width, height, fit: 'inside', withoutEnlargement: true })
        .png().toBuffer({ resolveWithObject: true });
    }
  }
}

function background(color: string, light: string, badgeWidth: number): Buffer {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse">
        <path d="M26 0H0V26" fill="none" stroke="${color}" stroke-opacity=".09"/>
      </pattern>
    </defs>
    <rect width="1200" height="630" fill="#faf8f1"/>
    <rect width="1200" height="10" fill="${color}"/>
    <circle cx="1140" cy="40" r="202" fill="${light}" opacity=".65"/>
    <path d="M64 140H1136M64 526H1136" stroke="#dddeda" stroke-width="2"/>
    <rect x="64" y="178" width="${badgeWidth}" height="46" rx="23" fill="${light}"/>
    <circle cx="87" cy="201" r="5" fill="${color}"/>
    <rect x="911" y="233" width="244" height="244" rx="122" fill="${light}" opacity=".65"/>
    <rect x="891" y="213" width="264" height="264" fill="url(#grid)"/>
    <g transform="translate(904 264) rotate(-9 112 88)">
      <rect x="12" y="39" width="197" height="134" rx="12" fill="#233b53" opacity=".08"/>
      <rect x="20" y="20" width="192" height="136" rx="10" fill="#f0c763"/>
      <path d="M111 33C83 15 46 18 10 26V155C46 147 83 146 111 164C139 146 176 147 212 155V26C176 18 139 15 111 33Z"
        fill="${color}" stroke="${color}" stroke-width="8" stroke-linejoin="round"/>
      <path d="M111 33C83 15 46 18 10 26V145C47 137 80 139 111 155Z" fill="#fffef9"/>
      <path d="M111 33C139 15 176 18 212 26V145C175 137 142 139 111 155Z" fill="#f1f3ef"/>
      <path d="M111 35V151" stroke="${color}" stroke-opacity=".3" stroke-width="3"/>
      <path d="M29 55Q63 47 91 59M29 77Q62 70 91 81M29 99Q62 92 79 99M132 57Q163 46 194 55M132 79Q162 68 194 77M132 101Q159 92 183 97"
        fill="none" stroke="${color}" stroke-opacity=".3" stroke-width="5" stroke-linecap="round"/>
      <path d="M176 24V75L166 68L156 75V24" fill="#eeab52"/>
    </g>
    <path d="M1106 211L1112 228L1129 234L1112 240L1106 257L1100 240L1083 234L1100 228Z" fill="#e9b949"/>
    <circle cx="925" cy="246" r="7" fill="${color}" opacity=".5"/>
    <circle cx="1133" cy="418" r="5" fill="#e9b949"/>
    <path d="M885 428h18m-9-9v18" stroke="${color}" stroke-width="3" stroke-linecap="round" opacity=".6"/>
    <rect x="1056" y="557" width="22" height="22" rx="5" fill="${color}"/>
    <rect x="1085" y="557" width="22" height="22" rx="5" fill="#efc55d"/>
    <rect x="1114" y="557" width="22" height="22" rx="5" fill="#84ae92"/>
  </svg>`);
}

export async function renderOgImage({ id, title, grade, subject }: {
  id: string;
  title: string;
  grade?: string;
  subject?: string;
}): Promise<Buffer> {
  const theme = themes[id.split('/')[0]] ?? defaultTheme;
  const [brand, label, heading, footer, wordmark, icon] = await Promise.all([
    textBlock(SITE_NAME, 32, '#203b54', 440, 50),
    textBlock(subject?.trim() || theme.label, 23, theme.color, 410, 30),
    textBlock(title.trim() || SITE_NAME, 72, '#203b54', 792, 228, true),
    textBlock('だれでも、無料で学べる教科書', 22, '#586b75', 760, 36),
    textBlock('MANABI COMMONS', 18, '#617280', 250, 28),
    sharp(resolve('public/favicon.svg')).resize(60, 60).png().toBuffer(),
  ]);
  const badgeWidth = label.info.width + 60;
  const layers: sharp.OverlayOptions[] = [
    { input: icon, left: 58, top: 52 },
    { input: brand.data, left: 132, top: 69 },
    { input: wordmark.data, left: 1136 - wordmark.info.width, top: 77 },
    { input: label.data, left: 105, top: 178 + Math.round((46 - label.info.height) / 2) },
    { input: heading.data, left: 64, top: 256 + Math.round((228 - heading.info.height) / 2) },
    { input: footer.data, left: 64, top: 554 },
  ];
  if (grade?.trim()) {
    const gradeText = await textBlock(grade, 21, '#617280', 780 - badgeWidth, 32);
    layers.push({ input: gradeText.data, left: 64 + badgeWidth + 20,
      top: 178 + Math.round((46 - gradeText.info.height) / 2) });
  }
  return sharp(background(theme.color, theme.light, badgeWidth))
    .composite(layers).removeAlpha().png().toBuffer();
}
