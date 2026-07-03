// ABOUTME: content-routes.ts のルート列挙ロジックを検証するユニットテストです。
// ABOUTME: 実リポジトリのコンテンツディレクトリを入力として境界条件を確認します。
import { describe, expect, it } from 'vitest';
import { contentRoutes } from './content-routes';

describe('contentRoutes', () => {
  it('collects md/mdx files as extension-less routes', () => {
    const routes = contentRoutes();
    expect(routes).toContain('japanese/hyakunin-isshu');
    expect(routes).toContain('math/sho2-kuku-oboekata');
  });

  it('maps index files to their directory route', () => {
    const routes = contentRoutes();
    expect(routes).toContain('japanese');
    expect(routes).toContain('');
  });

  it('excludes non-content files such as colocated test files', () => {
    const routes = contentRoutes();
    expect(routes.every((r) => !r.includes('.test'))).toBe(true);
  });

  it('returns lowercase routes only', () => {
    const routes = contentRoutes();
    expect(routes.every((r) => r === r.toLowerCase())).toBe(true);
  });
});
