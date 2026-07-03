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

## テストの実行

- `pnpm test:unit` — Vitest。`src/scripts/` のロジックと `tests/helpers/` のテスト補助を検証します。
- `pnpm test:e2e` — Playwright。インタラクティブ機能(Quiz / AnimatedStep / 読み上げ)と、全コンテンツページの表示スモークテスト(`tests/content-smoke.spec.ts`)を実行します。
- `pnpm test` — unit と E2E を続けて実行します。
- 記事を追加してもテストコードの追加は不要です。スモークテストが新しいページを自動で検証対象に含めます。

## ドキュメント案内

- [開発ガイド](docs/development.md)
- [コンテンツ作成ガイド](docs/content-authoring.md)
- [AI支援教材編集ポリシー](docs/ai-assisted-content-policy.md)
- [出典とレビューのポリシー](docs/source-and-review-policy.md)
- [教材ページ作成テンプレート](docs/article-template.md)
- [エージェント向け運用ルール](AGENTS.md)

## ディレクトリ概要

```text
.
├── public/                  # 画像や静的アセット
├── src/content/docs/        # Starlight の教材コンテンツ
├── src/styles/custom.css    # サイト固有のスタイル
├── tests/                   # E2E テストとテスト補助
├── astro.config.mjs         # サイト設定とサイドバー
├── vitest.config.ts         # ユニットテスト設定
├── playwright.config.ts     # E2E テスト設定
├── AGENTS.md                # 開発・運用ルール
└── docs/                    # 開発者向けドキュメント
```

## ライセンス

コンテンツとコードの扱いは、各ファイルの表記およびリポジトリ設定に従ってください。
