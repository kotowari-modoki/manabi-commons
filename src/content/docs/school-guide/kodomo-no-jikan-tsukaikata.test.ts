// ABOUTME: Unit tests for the school-guide time management content page.
// ABOUTME: Verifies the markdown file keeps the expected metadata and core sections.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const CONTENT_PATH = join(process.cwd(), 'src/content/docs/school-guide/kodomo-no-jikan-tsukaikata.md');

function readContent() {
  return readFileSync(CONTENT_PATH, 'utf8');
}

describe('kodomo-no-jikan-tsukaikata content', () => {
  it('defines the expected frontmatter', () => {
    const content = readContent();
    expect(content).toContain('title: 子どもの時間のつかい方');
    expect(content).toContain('description: 宿題、遊び、休けいのバランスをとりながら、自分で時間をつかうコツを子ども向けにまとめたページです。');
    expect(content).toContain('order: 4');
  });

  it('includes the core guidance sections', () => {
    const content = readContent();
    expect(content).toContain('## ひとことでいうと');
    expect(content).toContain('## まずは「やること」を3つに分けよう');
    expect(content).toContain('## 1日の時間わけの例');
    expect(content).toContain('## うまくいかない日があっても大丈夫');
    expect(content).toContain('## 参考にした情報源');
  });
});
