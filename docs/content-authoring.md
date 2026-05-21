# コンテンツ作成ガイド

子ども向け無料教科書サイトとして、正確性と読みやすさを優先して教材を追加します。

## 基本方針

- 学習指導要領との整合を意識する
- 対象学年に合った語彙で書く
- 不適切な表現や危険な内容を避ける
- frontmatter を正しく書く

## 編集してよい場所

- `src/content/docs/` 以下の `.md` / `.mdx`
- `astro.config.mjs` のサイドバー設定
- `src/styles/custom.css`
- `public/`

## frontmatter の基本形

```yaml
---
title: ページタイトル
description: 1〜2文の説明
sidebar:
  order: 10
---
```

## 書き方の目安

- 冒頭で対象学年を明記する
- 一文を短くする
- 「です・ます」調で書く
- 難しい概念は具体例から入る
- 子どもが読んで意味を取りやすい見出しにする

## 避けること

- 著作権のある図版や文章の転載
- 特定の教科書会社や出版社への依存した説明
- 政治的、宗教的に偏った表現
- 正確性に自信がないまま断定する説明

## レビュー時に確認したいこと

- 対象学年が本文と合っている
- 見出し構造が自然
- 例題や説明が対象読者に難しすぎない
- 出典や参考情報を説明できる

## PR コメントに残したい情報

- 対象学年
- 対応する学習指導要領の項目
- 参考にした情報源

内容の正確性に自信が持てないときは、断定せず人間レビューを前提にしてください。

## AI支援時の確認チェックリスト

AI支援で教材の下書き、構成整理、リライト、事実確認を行った場合は、公開前に次を確認します。

- 対象学年に語彙・例題・文量が合っているか
- 学習指導要領との対応を説明できるか
- 参考情報源を説明できるか
- AIが作った説明に誤りや飛躍がないか
- 子どもが誤解しやすい表現がないか
- 保護者・教師が見ても不自然でないか
- 例題と解説が一致しているか
- 不確かな説明を断定していないか
- 危険、不適切、偏った内容が含まれていないか

## optional metadata

既存記事へ一括追加する必要はありません。
新規教材や大幅更新教材で、レビュー可能性を高めたい場合に任意で使います。

```yaml
learning_context:
  grade: 小学4年
  subject: 算数
  unit: わり算の筆算
  curriculum_ref: "学習指導要領 算数 第4学年 A 数と計算"
  prerequisite:
    - 九九
    - かけ算の筆算

review:
  source_ref:
    - "文部科学省 小学校学習指導要領"
  ai_process:
    - structure
    - rewrite
    - fact_check
  confidence: medium
  human_review: required
  safety_review: required
  age_level_review: required

content_status:
  claim_status: tentative
  related_pages:
    - /math/elementary-math-overview/
  update_note: "説明を大きく変えたため、例題と難易度の確認が必要。"
```

`confidence` は教材の正しさを保証するものではありません。
AI支援後の編集上の自己評価として扱い、迷う場合は `medium` 以下にします。
