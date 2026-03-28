# まなびコモンズ

小学生から高校生までを対象にした、無料で使える日本語教科書サイトです。
Astro + Starlight で構築し、GitHub Pages で公開します。

## このリポジトリでできること

- `src/content/docs/` に教材ページを追加する
- `astro.config.mjs` でサイドバーやサイト設定を調整する
- `src/styles/custom.css` で見た目を整える
- `public/` に画像や配布アセットを追加する

## 開発環境

- Node.js 22 系以上を推奨
- `pnpm`

## はじめかた

```bash
pnpm install
pnpm dev
```

ローカルサーバーは通常 `http://localhost:4321` で起動します。

## よく使うコマンド

```bash
pnpm dev
pnpm build
pnpm preview
pnpm astro -- --help
```

## ドキュメント案内

- [開発ガイド](docs/development.md)
- [コンテンツ作成ガイド](docs/content-authoring.md)
- [エージェント向け運用ルール](AGENTS.md)

## ディレクトリ概要

```text
.
├── public/                  # 画像や静的アセット
├── src/content/docs/        # Starlight の教材コンテンツ
├── src/styles/custom.css    # サイト固有のスタイル
├── astro.config.mjs         # サイト設定とサイドバー
├── AGENTS.md                # 開発・運用ルール
└── docs/                    # 開発者向けドキュメント
```

## ライセンス

コンテンツとコードの扱いは、各ファイルの表記およびリポジトリ設定に従ってください。
