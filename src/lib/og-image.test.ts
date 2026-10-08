// ABOUTME: OGP画像のURL、既存メタデータの扱い、日本語PNGの生成を検証します。
// ABOUTME: ページ個別の教材内容ではなく、共有画像の共通処理を対象にします。
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { getOgImagePath, getSocialImageTags, renderOgImage } from './og-image';

describe('OGP image URLs', () => {
  it('resolves the home page and nested pages below the deployment base', () => {
    expect(getOgImagePath('', '/manabi-commons/')).toBe('/manabi-commons/og/index.png');
    expect(getOgImagePath('index', '/manabi-commons')).toBe('/manabi-commons/og/index.png');
    expect(getOgImagePath('japanese/aquarium/area-01', '/manabi-commons'))
      .toBe('/manabi-commons/og/japanese/aquarium/area-01.png');
    expect(getOgImagePath('math/lesson', '/')).toBe('/og/math/lesson.png');
  });

  it('encodes each path segment without losing nested directories', () => {
    expect(getOgImagePath('国語/読み & 書き', '/manabi-commons'))
      .toBe(`/manabi-commons/og/${encodeURIComponent('国語')}/${encodeURIComponent('読み & 書き')}.png`);
  });
});

describe('social image metadata', () => {
  const page = {
    id: 'math/lesson', title: '算数の学び',
    site: new URL('https://kotowari-modoki.github.io/'), base: '/manabi-commons',
  };
  const value = (tags: ReturnType<typeof getSocialImageTags>, key: string) =>
    tags.find(({ attrs }) => (attrs.property || attrs.name) === key)?.attrs.content;

  it('provides absolute PNG URLs, dimensions, alt text, and a large Twitter card', () => {
    const tags = getSocialImageTags(page);
    expect(value(tags, 'og:image')).toBe('https://kotowari-modoki.github.io/manabi-commons/og/math/lesson.png');
    expect(value(tags, 'og:image:width')).toBe('1200');
    expect(value(tags, 'og:image:height')).toBe('630');
    expect(value(tags, 'og:image:type')).toBe('image/png');
    expect(value(tags, 'og:image:alt')).toContain('算数の学び');
    expect(value(tags, 'twitter:image')).toBe(value(tags, 'og:image'));
    expect(value(tags, 'twitter:image:alt')).toBe(value(tags, 'og:image:alt'));
    expect(value(tags, 'twitter:card')).toBe('summary_large_image');
  });

  it('keeps manually configured images and does not attach generated dimensions to them', () => {
    const tags = getSocialImageTags({ ...page, head: [
      { tag: 'meta', attrs: { property: 'og:image', content: 'https://example.org/custom.jpg' } },
      { tag: 'meta', attrs: { property: 'og:image:alt', content: '自分で用意した画像' } },
      { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary' } },
    ] });
    expect(value(tags, 'og:image')).toBeUndefined();
    expect(value(tags, 'og:image:width')).toBeUndefined();
    expect(value(tags, 'og:image:type')).toBeUndefined();
    expect(value(tags, 'twitter:card')).toBeUndefined();
    expect(value(tags, 'twitter:image')).toBe('https://example.org/custom.jpg');
    expect(value(tags, 'twitter:image:alt')).toBe('自分で用意した画像');
  });

  it('preserves a separate Twitter image without adding mismatched alt text', () => {
    const tags = getSocialImageTags({ ...page, head: [
      { tag: 'meta', attrs: { name: 'twitter:image', content: 'https://example.org/twitter.jpg' } },
    ] });
    expect(value(tags, 'og:image')).toContain('/og/math/lesson.png');
    expect(value(tags, 'twitter:image')).toBeUndefined();
    expect(value(tags, 'twitter:image:alt')).toBeUndefined();
  });
});

describe('PNG generation', () => {
  it('renders a Japanese title as an opaque 1200 × 630 PNG', async () => {
    const png = await renderOgImage({ id: 'math/lesson', title: '5年生の算数 コスモクエスト', grade: '小学5年' });
    const metadata = await sharp(png).metadata();
    expect(metadata).toMatchObject({ format: 'png', width: 1200, height: 630 });
    expect((await sharp(png).stats()).isOpaque).toBe(true);
    expect(png.byteLength).toBeLessThan(500_000);
  });

  it('uses Japanese glyphs instead of identical missing-character boxes', async () => {
    const first = await renderOgImage({ id: 'japanese', title: '漢字' });
    const second = await renderOgImage({ id: 'japanese', title: '算数' });
    expect(first.equals(second)).toBe(false);
  });

  it('fits long text and treats markup as literal title text', async () => {
    const png = await renderOgImage({
      id: 'school-guide/lesson',
      title: '「何から始める？」 & <b>学びの作戦</b> '.repeat(5),
      grade: '小学校1年生から6年生ごろ',
    });
    expect(await sharp(png).metadata()).toMatchObject({ width: 1200, height: 630 });
  });
});
