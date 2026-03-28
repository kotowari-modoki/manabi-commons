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

## 現状の注意点

- `src/content/docs/index.mdx` と `src/content/docs/guides/example.md` などにはスターター由来のサンプルが残っています
- 実運用に入る前に、トップページ文言とサンプルページの置き換えを進める前提です
