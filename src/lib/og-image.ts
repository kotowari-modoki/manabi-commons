// ABOUTME: 教材のタイトルと教科から、共有用の日本語OGP画像とメタデータを作ります。
// ABOUTME: 同梱フォントとRust製のresvgで描画し、公開ビルド中に外部サービスへ接続しません。
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { fontOptions, layoutText, textSvg } from './og-text.ts';

const WIDTH = 1200;
const HEIGHT = 630;
const SITE_NAME = 'まなびコモンズ';

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

function background(color: string, light: string, badgeWidth: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
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
  `;
}

export async function renderOgImage({ id, title, grade, subject }: {
  id: string;
  title: string;
  grade?: string;
  subject?: string;
}): Promise<Buffer> {
  const theme = themes[id.split('/')[0]] ?? defaultTheme;
  const brand = layoutText(SITE_NAME, { fontSize: 32, width: 440, height: 50 });
  const label = layoutText(subject?.trim() || theme.label, { fontSize: 23, width: 410, height: 30 });
  const heading = layoutText(title.trim() || SITE_NAME, { fontSize: 72, width: 792, height: 228, balance: true });
  const footer = layoutText('だれでも、無料で学べる教科書', { fontSize: 22, width: 760, height: 36 });
  const wordmark = layoutText('MANABI COMMONS', { fontSize: 18, width: 250, height: 28 });
  const icon = (await readFile(resolve('public/favicon.svg'))).toString('base64');
  const badgeWidth = label.width + 60;
  const layers = [
    `<image x="58" y="52" width="60" height="60" xlink:href="data:image/svg+xml;base64,${icon}"/>`,
    textSvg(brand, 132, 69, '#203b54'),
    textSvg(wordmark, 1136 - wordmark.width, 77, '#617280'),
    textSvg(label, 105, 178 + (46 - label.height) / 2, theme.color),
    textSvg(heading, 64, 256 + (228 - heading.height) / 2, '#203b54'),
    textSvg(footer, 64, 554, '#586b75'),
  ];
  if (grade?.trim()) {
    const gradeText = layoutText(grade, { fontSize: 21, width: 780 - badgeWidth, height: 32 });
    layers.push(textSvg(gradeText, 64 + badgeWidth + 20, 178 + (46 - gradeText.height) / 2, '#617280'));
  }
  const svg = background(theme.color, theme.light, badgeWidth) + layers.join('') + '</svg>';
  return new Resvg(svg, fontOptions).render().asPng();
}
