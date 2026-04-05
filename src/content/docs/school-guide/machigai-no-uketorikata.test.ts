// ABOUTME: Unit tests for the school-guide correction feedback guidance page.
// ABOUTME: Verifies the markdown file keeps the expected metadata and key advice sections.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const CONTENT_PATH = join(process.cwd(), 'src/content/docs/school-guide/machigai-no-uketorikata.md');

function readContent() {
  return readFileSync(CONTENT_PATH, 'utf8');
}

describe('machigai-no-uketorikata content', () => {
  it('defines the expected frontmatter', () => {
    const content = readContent();
    expect(content).toContain('title: まちがいを言われたときの受け止め方');
    expect(content).toContain('description: まちがいを指摘されると反論したくなるときに、気持ちを落ち着けて学びにつなげるコツを子ども向けにまとめたページです。');
    expect(content).toContain('order: 5');
  });

  it('includes the core guidance sections', () => {
    const content = readContent();
    expect(content).toContain('## ひとことでいうと');
    expect(content).toContain('## まずは3つだけやってみよう');
    expect(content).toContain('## 「まちがい」と「自分」をいっしょにしない');
    expect(content).toContain('## 納得できないときも、けんかにしなくていい');
    expect(content).toContain('## 参考にした情報源');
  });
});
