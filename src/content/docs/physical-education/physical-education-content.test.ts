// ABOUTME: Unit tests for the physical education content pages.
// ABOUTME: Verifies the new section keeps expected metadata and safety-focused headings.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const INDEX_PATH = join(process.cwd(), 'src/content/docs/physical-education/index.md');
const BICYCLE_PATH = join(process.cwd(), 'src/content/docs/physical-education/hajimete-no-jitensha-renshu.md');
const SAKAAGARI_PATH = join(process.cwd(), 'src/content/docs/physical-education/sakaagari-no-kotsu.md');

function readContent(path: string) {
  return readFileSync(path, 'utf8');
}

describe('physical education content', () => {
  it('defines the section index and page list', () => {
    const content = readContent(INDEX_PATH);
    expect(content).toContain('title: 体育');
    expect(content).toContain('description: 小学生向けに、体を安全に動かすためのコツをまとめた体育のページです。');
    expect(content).toContain('[初めて自転車に乗るれんしゅうのやり方](hajimete-no-jitensha-renshu/)');
    expect(content).toContain('[逆上がりのコツ](sakaagari-no-kotsu/)');
  });

  it('keeps bicycle practice guidance focused on safety and steps', () => {
    const content = readContent(BICYCLE_PATH);
    expect(content).toContain('title: 初めて自転車に乗るれんしゅうのやり方');
    expect(content).toContain('## はじめる前に、いちばん大切なこと');
    expect(content).toContain('## れんしゅうは「足で進む」から始めよう');
    expect(content).toContain('## ペダルをこぐ前に、止まり方をれんしゅうしよう');
    expect(content).toContain('## 参考にした情報源');
  });

  it('keeps sakaagari guidance focused on safe support and movement', () => {
    const content = readContent(SAKAAGARI_PATH);
    expect(content).toContain('title: 逆上がりのコツ');
    expect(content).toContain('## 先に、安全のことをたしかめよう');
    expect(content).toContain('## 逆上がりの動きを3つに分ける');
    expect(content).toContain('## うまくいかないときの見直しポイント');
    expect(content).toContain('## 参考にした情報源');
  });
});
