// ABOUTME: src/content/docs 配下のコンテンツファイルから公開 URL パス一覧を作るヘルパーです。
// ABOUTME: 全ページ共通のスモーク E2E テストがルート列挙に使います。
import { readdirSync } from 'node:fs';

export function contentRoutes(contentDir = 'src/content/docs'): string[] {
  const entries = readdirSync(contentDir, { recursive: true, encoding: 'utf8' });

  return entries
    .filter((path) => /\.(md|mdx)$/.test(path))
    .map((path) =>
      path
        .replace(/\\/g, '/')
        .replace(/\.(md|mdx)$/, '')
        .replace(/(^|\/)index$/, '')
        .replace(/\/$/, '')
        .toLowerCase(),
    );
}
