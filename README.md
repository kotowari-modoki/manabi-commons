# Starlight Starter Kit: Basics

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

## プロジェクト概要

小学3年生〜高校3年生を対象とした、無料・オープンな日本語教科書サイト。
Starlight (Astro) で構築し、GitHub Pages で公開する。
ライセンス: CC BY 4.0

## ファイル構成

```
src/content/docs/
├── index.mdx              # トップページ
├── math/                  # 算数・数学
│   ├── index.md
│   └── grade5/
│       └── fractions.md
├── science/               # 理科
├── english/               # 英語
├── social/                # 社会
└── japanese/              # 国語
```

## コンテンツ追加ルール

### frontmatter 必須フィールド

```yaml
---
title: ページタイトル（子供が読んでわかる言葉で）
description: 1〜2文の説明
sidebar:
  order: 数字（章内の順序）
---
```

### 文体ルール

- 対象学年を冒頭に明記（例：「小学5年生向け」）
- 漢字にはルビを振る（MDXコンポーネント `<Ruby>` を使う）
- 一文を短く。60字以内を目安
- 「です・ます」調
- 難しい概念は必ず具体例を先に出す

### 禁止事項

- 著作権のある図版・文章の転載
- 特定の教科書・出版社への言及
- 政治的・宗教的に偏った内容

## よく使うコマンド

```bash
npm run dev      # ローカル確認
npm run build    # ビルド
npm run preview  # ビルド確認
```

## Codexへの典型的な指示パターン

```
「src/content/docs/math/grade5/fractions.md を作成して。
小学5年生向けに分数の足し算を説明する章。
frontmatterを含め、Starlightの形式で。
具体例はピザを使って。」
```



```
pnpm create astro@latest -- --template starlight
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro + Starlight project, you'll see the following folders and files:

```
.
├── public/
├── src/
│   ├── assets/
│   ├── content/
│   │   └── docs/
│   └── content.config.ts
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

Starlight looks for `.md` or `.mdx` files in the `src/content/docs/` directory. Each file is exposed as a route based on its file name.

Images can be added to `src/assets/` and embedded in Markdown with a relative link.

Static assets, like favicons, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Check out [Starlight’s docs](https://starlight.astro.build/), read [the Astro documentation](https://docs.astro.build), or jump into the [Astro Discord server](https://astro.build/chat).
