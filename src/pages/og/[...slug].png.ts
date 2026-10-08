// ABOUTME: 教材コレクションから全ページのOGP用PNGを静的に生成します。
// ABOUTME: 開発時は下書きも扱い、公開ビルドではStarlightと同じ条件で除外します。
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgImage } from '../../lib/og-image';

export const prerender = true;

export const getStaticPaths = (async () => {
  const entries = await getCollection('docs', ({ data }) =>
    import.meta.env.MODE !== 'production' || !data.draft,
  );
  return entries.map(({ id, data }) => ({
    params: { slug: id || 'index' },
    props: {
      id,
      title: data.title,
      grade: data.learning_context?.grade,
      subject: data.learning_context?.subject,
    },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage(props as Parameters<typeof renderOgImage>[0]);
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
