# 開発ガイド

このページは、`manabi-commons` をローカルで確認しながら編集するための開発メモです。
README は入口、ここでは実作業に必要な情報をまとめます。

## 技術スタック

- Astro 6
- Starlight
- pnpm
- GitHub Pages

## 前提環境

- Node.js 22.12 以上を推奨
- `pnpm` が使えること

`pnpm-lock.yaml` があるため、パッケージマネージャーは `pnpm` を前提にします。

## セットアップ

```bash
pnpm install
pnpm dev
```

起動後は通常 `http://localhost:4321` で確認できます。

## 主要コマンド

```bash
pnpm dev
pnpm build
pnpm preview
pnpm astro -- --help
```

## リポジトリ構成

```text
src/content/docs/
  教材本文。`.md` / `.mdx` を追加するとページになります。

astro.config.mjs
  サイトタイトル、説明、GitHub Pages 用の `site` / `base`、
  Starlight の sidebar 設定を持ちます。

src/styles/custom.css
  サイト固有のスタイル調整に使います。

public/
  画像や静的アセットの配置先です。
```

## コンテンツ追加の流れ

1. `src/content/docs/` に Markdown か MDX を追加する
2. 必要なら `astro.config.mjs` のサイドバー設定を見直す
3. `pnpm dev` で表示確認する
4. `pnpm build` で静的ビルドが通ることを確認する

具体的な本文ルールや frontmatter は [コンテンツ作成ガイド](content-authoring.md) を参照してください。

## GitHub Pages 公開メモ

- 公開先 URL の基準は `astro.config.mjs` の `site` と `base` にあります
- GitHub リポジトリへの編集リンクも `astro.config.mjs` の `editLink.baseUrl` で管理します
- `.github/workflows/` に GitHub Pages 用ワークフローがあります

## OGP画像

`pnpm build` は、教材の `title` から1200 × 630のPNGを自動生成します。教科ディレクトリに応じて色を変え、`learning_context.subject` と `learning_context.grade` があれば表示します。教材ごとの画像登録は不要です。

- 生成先: `dist/og/index.png`（トップ）、`dist/og/math/sho4-hissan-practice.png`（教材の例）
- ローカル確認: `pnpm dev` の起動後、`http://localhost:4321/manabi-commons/og/index.png` を開く
- `src/pages/og/[...slug].png.ts` がコレクションを列挙し、`src/lib/og-image.ts` が描画します。開発時は下書きも生成しますが、公開ビルドでは `draft: true` を除外します。
- `src/components/overrides/Head.astro` が絶対URLの `og:image` と `twitter:image` を追加します。404ページにはトップ画像を使います。frontmatterやサイト設定で明示した画像は優先されます。
- 長い題名は単語の途中や助詞の直前を避けながら折り返し、画像内に収まるよう文字サイズを調整します。

生成には既存依存の [Sharp](https://sharp.pixelplumbing.com/) を使います。SVGの図形と日本語の文字を合成するため、Rust用のビルド環境や画像配信用のサーバーは不要です。公開ビルド時と画像の閲覧時に、画像生成のための外部APIやフォント取得は行いません。

フォントは `public/fonts/zen-kaku-gothic-new/` に同梱した **Zen Kaku Gothic New Bold** を明示的に指定します。ページ表示用のWebフォントとしては読み込みません。配布元と元のライセンスは同ディレクトリのREADMEと `OFL.txt` にあります。

確認は `pnpm test:unit`、`pnpm test:e2e`、`pnpm build` で行います。全ページ共通スモークテストは、OGPタグ、画像のHTTP応答、PNG形式と寸法まで検証します。

## 現状の注意点

- `src/content/docs/index.mdx` と `src/content/docs/guides/example.md` などにはスターター由来のサンプルが残っています
- 実運用に入る前に、トップページ文言とサンプルページの置き換えを進める前提です
- テストは「機能ロジックの unit + 機能 E2E + 全ページスモーク」の3層構成です。記事別のテストファイルは作らないでください(過去にあったものは 2026-07 のリファクタリングで撤去済み)。
