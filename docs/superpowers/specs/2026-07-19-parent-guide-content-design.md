# 保護者向けコンテンツ「おうちの方へ」設計書

## 背景・目的

幼稚園〜小学生の子どもを持つ保護者が、家庭での生活習慣づくりと読書体験を、子どもを管理・採点せずに支えられるようにする。
保護者が長い説明を読まなくても使い始められ、子ども本人が見ても嫌な気持ちにならないことを重視する。

最初の公開範囲は次の2コンテンツ。

1. できた日を見つける 1か月記録シート（習慣化の記録シート）
2. 本との出会いを残す 読書記録ノート

## 全体方針（両ページ共通）

- 保護者の役割は「採点」ではなく「始めやすい環境づくり／気づき／子どもの言葉を残す／再開しやすくする」こと。
- ×は使わない。連続記録日数や達成率を強調しない。空欄・未達成を失敗として扱わない。
- 兄弟姉妹・他の子との比較、年間◯冊などの一律数値目標、感想文の文字数指定はしない。
- 読み聞かせ・読んでもらった読書も読書として扱う。読み終えていない本も記録できる。
- 保護者向け文章と子ども向け文章で文体を分ける（保護者：丁寧・簡潔・非強制。子ども：低学年でも読める・命令形を避ける・できたことに目を向ける）。
- 白黒印刷前提。家庭用プリンターでインクを大量に使わない。記入欄は鉛筆で書きやすい大きさを確保し、印刷時に端が切れない余白（`@page` margin）を取る。

## 情報設計

### サイドバー変更

`astro.config.mjs` の `sidebar` 配列を並べ替え、新カテゴリーを追加する。最終順序（上から）：

1. 学びのガイド（school-guide）— 現在の位置から最上部へ移動
2. 算数・数学（math）
3. 国語（japanese）
4. 理科（science）
5. 社会（social）
6. 外国語（english）
7. 図工・アート（art）
8. 体育（physical-education）
9. **おうちの方へ（parent-guide、新設）** — 体育の直後
10. このサイトについて（about）

`school-guide` と `parent-guide` の並び替え・追加以外の各カテゴリー内部（items）は変更しない。

### 新規ディレクトリ・ファイル

```
src/content/docs/parent-guide/
  index.md                      # カテゴリー趣旨の説明
  habit-tracking-sheet.mdx      # できた日を見つける 1か月記録シート
  reading-log-notebook.mdx      # 本との出会いを残す 読書記録ノート
```

URLは `/manabi-commons/parent-guide/habit-tracking-sheet/` 、`/manabi-commons/parent-guide/reading-log-notebook/` 。

`index.md` は他カテゴリーの index（例: `japanese/index.md`, `physical-education/index.md`）に倣い、カテゴリーの趣旨（採点のための道具ではなく、一緒に見つける・残すための道具であること）と2ページへのリンクを短く説明する。sidebar order は school-guide 等の既存 index パターンに合わせる。

### frontmatter

既存の `docs/content-authoring.md` の optional metadata に従う。AI支援下書きのため `confidence: medium`、`human_review: required` 等を明記する。

```yaml
---
title: できた日を見つける 1か月記録シート
description: <1〜2文>
sidebar:
  order: 1
learning_context:
  grade: 幼稚園〜小学校中学年
  subject: 家庭学習・生活習慣
  unit: 家庭での取り組みの記録
review:
  source_ref:
    - "文部科学省 幼児教育・家庭教育に関する一般的な考え方"
  ai_process: [structure, rewrite, critique]
  confidence: medium
  human_review: required
  safety_review: required
  age_level_review: required
content_status:
  claim_status: tentative
  related_pages:
    - /parent-guide/reading-log-notebook/
  update_note: "初版。習慣記録シートを新規作成。"
---
```

読書記録ノートも同様の構成で、`unit: 読書記録` 等に置き換える。

## 実装パターン（既存の km- / ht- を踏襲）

サイトには印刷教材の既存パターンがある（`japanese/grade-3-kanji-aquarium` の `km-` 、`school-guide/how-to-tackle-hard-tasks` の `ht-`）。新規2ページもこのパターンに合わせ、CSSプレフィックスのみ新設する。

- 習慣記録シート: `hb-` プレフィックス
- 読書記録ノート: `rn-` プレフィックス

再利用する既存の仕組み：

- `src/scripts/print-qr-core.js` の `mountPrintQr` が対象とするセレクタに `.hb-record-sheet` と `.rn-notebook-page` を追加する（`.km-mission, .ht-strategy-sheet` の並びに追記）。QRはページ右上に自動挿入され、印刷物からWeb版に戻れる。
- 印刷ボタンは `ht-print-button` 相当の見た目・挙動を `hb-`/`rn-` に付け替えて流用する。各ページに2つ設置：
  - 「説明とシートを一緒に印刷する」= `window.print()`
  - 「シートだけ印刷する」= `document.body.classList.add('hb-print-sheet-only')` → `window.print()` → `afterprint` で解除（`ht-print-sheet-only` と同じ実装）
- `src/styles/custom.css` に `===== おうちの方へ：習慣記録シート（hb- プレフィックス） =====` と `===== おうちの方へ：読書記録ノート（rn- プレフィックス） =====` の2セクションを追記する。既存の `@media print` ブロック内に追記し、新しい `@page` ルールは追加しない（`@page` は1つのCSSファイル内で用途ごとに複数書けるが、本サイトは既存の `@page { size: A4 portrait; margin: 12mm }` を上書きせず、印刷対象コンテナ側で landscape 切り替えが必要な場合は `@page :first` ではなく要素スコープの `size` プロパティ指定 or ページ全体を横向き専用ページとして扱う）。

  **技術判断**: 既存 `custom.css` の `@page` はサイト全体で `A4 portrait` 固定。`@page` はセレクタで要素スコープできず、CSSの出現順・詳細度でしか上書きできない。そこで習慣記録シートのみ、`habit-tracking-sheet.mdx` に `<style>` タグを直接書き `@page { size: A4 landscape; margin: 10mm }` を宣言する。Astroはページ固有の `<style>` をそのページ読み込み時にのみバンドルするため、他ページの `@page`（`custom.css` の `A4 portrait`）には影響しない。読書記録ノートは既存の `A4 portrait` と一致するため上書き不要。

- 記入マス・下線・チェック欄のCSSは `km-box` / `ht-write-lines` 等と同様、border-box・鉛筆で書きやすいサイズ（最小 8mm 四方目安）で新規に組む。背景色に依存させない。

## ページ構成（共通10セクション）

両ページとも以下の順で構成する（brief の指定通り）。

1. ページタイトル
2. 一文で分かる説明
3. このシートでできること
4. 印刷用シート（Web上にも埋め込み表示）
5. 使い方3ステップ
6. 年齢に合わせた使い方
7. うまくいかないとき
8. 保護者への短いメッセージ
9. 記入例
10. 印刷時の注意

説明とシートを一緒に印刷する版と、シートだけ印刷する版の両方を、2つの印刷ボタンで提供する（上記「実装パターン」参照）。

## ページ1: できた日を見つける 1か月記録シート

- A4横向き、1か月分。1〜31日を横軸、取り組み項目を最大5つまで縦軸（保護者が自由記入）。
- 記録方法: `○ できた` `△ 少しできた` `い 家族といっしょにできた` `空欄 休んだ/記録しなかった`。凡例をシート内に印刷する。×は使わない。
- 連続記録日数・達成率などの強調表示は作らない。
- 月末に「今月見つけたこと」の自由記述欄（3行程度、例のプレースホルダー付き）。
- 項目例（本文中でガイドとして紹介、シート自体は空欄）: 絵本をひらく／音読を1回する／明日の持ち物を見る／机に5分すわる／早めに布団に入る。「結果」ではなく「始めるための小さな行動」を書く例として明示する。
- 年齢に合わせた使い方: 幼児（保護者が印を付ける／絵と一緒に）、低学年（子どもが印を付けられる）、中学年（項目を子どもと一緒に決める）の3段階を短く紹介。
- うまくいかないとき: 空欄が続いても再開できる旨、週3回など頻度を下げてよい旨を保護者向けトーンで。

## ページ2: 本との出会いを残す 読書記録ノート

- A4縦向き、1ページに1〜2冊分。
- 必須/候補項目: 読んだ日／本の名前／作者／読み方（読んでもらった・いっしょに読んだ・ひとりで読んだ）／気持ち（たのしい・びっくり・かなしい・こわい・ふしぎ・もっと知りたい、複数選択可）／心に残ったところ／自由に描く欄／おうちの人のメモ。
- 幼児・低学年向け: 「絵を描く」「気持ちを選ぶ」「一言だけ書く」「子どもが話した言葉を保護者が書く」のうちどれか1つで成立する設計。文章を書く欄を必須にしない。
- 中学年以降向け: 「心に残った場面は？」「初めて知ったことは？」「誰かに話したいことは？」から1つを選んで答える形式（自由記述の大きな「感想を書きましょう」欄は置かない）。
- 読了していない本も記録可。読み聞かせも読書として明記する。

## アクセシビリティ・スマートフォン表示

- 印刷用シートはWebページ埋め込み時、スマートフォン幅で1カラムに折り返す（既存 `ht-` の `@media screen and (max-width: 40rem/50rem/30rem)` パターンを踏襲）。
- チェック・記入欄はスマホ上では入力目的ではなく「見本の確認」用途である旨を示す（実記入は印刷して手書き）。
- 白黒印刷時も枠線・文字が判別できるよう `#111`〜`#444` 系のborder colorを用いる（既存踏襲）。

## 実装ファイル一覧

- `astro.config.mjs` — sidebar 並び替え・`parent-guide` カテゴリー追加
- `src/content/docs/parent-guide/index.md` — 新規
- `src/content/docs/parent-guide/habit-tracking-sheet.mdx` — 新規
- `src/content/docs/parent-guide/reading-log-notebook.mdx` — 新規
- `src/styles/custom.css` — `hb-` / `rn-` セクション追記（画面用 + `@media print` 用）
- `src/scripts/print-qr-core.js` — `mountPrintQr` の対象セレクタに `.hb-record-sheet`, `.rn-notebook-page` を追加
- 関連ページの `content_status.related_pages` 更新（`school-guide/kodomo-no-jikan-tsukaikata.md` 等、相互リンクが自然な既存ページがあれば追記）

## 確認項目（実装後）

印刷・スマホ表示:

- 習慣記録シートがA4横1枚に収まるか（`gotchas.md` の方針通り、余白圧縮ではなく記入面積の配分で確認）
- 読書記録ノートがA4縦で崩れないか、1〜2冊構成で余白が破綻しないか
- 白黒印刷でも枠線・文字が判読できるか
- 印刷用QRが右上に重ならず表示されるか（既存 `gotchas.md` の方針: 右上固定、見出し・導入文に右余白確保）
- スマートフォン幅（375px想定）で崩れないか

公開後に保護者へ確認する検証観点（brief 記載の7項目をそのまま運用指標として採用）:

- 説明をほとんど読まずに使い始められるか
- 子どもが嫌がらずにシートを見られるか
- 1週間後も使われているか
- 保護者の記入負担が大きすぎないか
- 空欄があっても再開できるか
- 子どもとの会話が増えたか
- 記録すること自体が目的になっていないか

## スコープ外（今回はやらない）

- 3つ目以降の記録シート・機能追加
- デジタル入力・保存機能（印刷して手書きする前提）
- 年間を通じた自動集計・グラフ化
