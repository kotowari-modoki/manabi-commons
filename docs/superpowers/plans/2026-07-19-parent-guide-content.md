# おうちの方へ（保護者向けコンテンツ）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "おうちの方へ" (parent-guide) sidebar category with two printable A4 worksheets — a monthly habit-tracking sheet and a reading-log notebook — following the site's existing `km-`/`ht-` print-worksheet pattern.

**Architecture:** Two new `.mdx` content pages under `src/content/docs/parent-guide/`, each with a feature-prefixed CSS block (`hb-` / `rn-`) added to the single global `src/styles/custom.css`, reusing the existing print-QR auto-mount script and the two-button "print everything" / "print sheet only" pattern already used by `how-to-tackle-hard-tasks.mdx`.

**Tech Stack:** Astro + Starlight (content collections, `.mdx` with embedded JSX expressions), plain CSS (`@media print`, `@page`), vitest (unit), Playwright (e2e smoke test — auto-discovers new routes, no new test file needed for that).

## Global Constraints

- ×は使わない。連続記録日数・達成率の強調表示を作らない。空欄・未達成を失敗として扱わない。
- 兄弟姉妹・他の子との比較、年間◯冊などの一律数値目標、感想文の文字数指定はしない。
- 読み聞かせ・読んでもらった読書も読書として扱う。読了していない本も記録できる。
- 保護者向け文章と子ども向け文章で文体を分ける（保護者：丁寧・簡潔・非強制。子ども向け表記：低学年でも読める・命令形を避ける）。
- 白黒印刷前提。インクを大量に使わない。記入欄は鉛筆で書きやすい大きさ、印刷時に端が切れない余白を確保する。
- frontmatter は `docs/content-authoring.md` の optional metadata 形式（`learning_context` / `review` / `content_status`）を使い、`confidence: medium`、`human_review: required` を明記する（AI支援下書きのため）。
- 新規CSSクラスは機能ごとにプレフィックスを付ける（習慣記録シート = `hb-`、読書記録ノート = `rn-`）。既存の `km-` / `ht-` と同じ命名規則。
- `astro.config.mjs` のサイドバー順序を変更する: `学びのガイド` を最上部へ、新設 `おうちの方へ` を `体育` の直後に挿入する。

---

## File Structure

```
astro.config.mjs                                        # modify: sidebar reorder + new category
src/scripts/print-qr-core.js                             # modify: mountPrintQr target selectors
src/scripts/print-qr-core.test.ts                        # modify: add coverage for new selectors
src/styles/custom.css                                    # modify: append hb- and rn- sections
src/content/docs/parent-guide/index.md                   # create: category intro
src/content/docs/parent-guide/habit-tracking-sheet.mdx    # create: habit-tracking sheet page
src/content/docs/parent-guide/reading-log-notebook.mdx    # create: reading-log notebook page
```

`tests/content-smoke.spec.ts` requires no edits — it enumerates routes from `tests/helpers/content-routes.ts`, which scans `src/content/docs/` at test time, so the two new pages are picked up automatically.

---

### Task 1: Extend print-QR auto-mount to the new worksheet classes

**Files:**
- Modify: `src/scripts/print-qr-core.js:219-221` (the `mountPrintQr` selector list)
- Test: `src/scripts/print-qr-core.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `mountPrintQr(documentObj, windowObj)` now also mounts `.print-page-qr` onto any `.hb-record-sheet` and `.rn-notebook-page` element found in the document — later tasks' worksheet markup relies on this to get an automatic print QR code in the top-right corner.

- [ ] **Step 1: Write the failing test**

Add this `it` block inside the existing `describe('print QR code', ...)` in `src/scripts/print-qr-core.test.ts`, right after the existing `'adds one current-page QR link to every printable section'` test:

```ts
  it('also mounts QR links onto the parent-guide worksheet containers', () => {
    document.body.innerHTML = `
      <main>
        <section class="hb-record-sheet"></section>
        <section class="rn-notebook-page"></section>
      </main>
    `;
    const windowObj = { location: { href: 'https://example.com/parent-guide/habit-tracking-sheet/' } } as Window;

    expect(mountPrintQr(document, windowObj)).toBe(2);
    const links = [...document.querySelectorAll<HTMLAnchorElement>('.print-page-qr')];
    expect(links).toHaveLength(2);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:unit -- print-qr-core`
Expected: FAIL — the new test returns `0` mounted QR links because `.hb-record-sheet` and `.rn-notebook-page` are not in the current selector list.

- [ ] **Step 3: Update the selector list**

In `src/scripts/print-qr-core.js`, change:

```js
  const targets = documentObj.querySelectorAll('.km-mission, .ht-strategy-sheet');
```

to:

```js
  const targets = documentObj.querySelectorAll(
    '.km-mission, .ht-strategy-sheet, .hb-record-sheet, .rn-notebook-page',
  );
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:unit -- print-qr-core`
Expected: PASS (all tests in the file, including the pre-existing ones).

- [ ] **Step 5: Commit**

```bash
git add src/scripts/print-qr-core.js src/scripts/print-qr-core.test.ts
git commit -m "feat(print-qr): mount print QR on parent-guide worksheet sheets"
```

---

### Task 2: Reorder sidebar and add the "おうちの方へ" category

**Files:**
- Modify: `astro.config.mjs:31-81` (the `sidebar` array)

**Interfaces:**
- Consumes: nothing new.
- Produces: a `parent-guide` sidebar group pointing at `src/content/docs/parent-guide/` — later tasks' content files must live under that directory for the sidebar entry to resolve.

- [ ] **Step 1: Replace the sidebar array**

In `astro.config.mjs`, replace the whole `sidebar: [...]` block with:

```js
      sidebar: [
        {
          label: "学びのガイド",
          items: [{ autogenerate: { directory: "school-guide" } }],
        },
        {
          label: "算数・数学",
          items: [{ autogenerate: { directory: "math" } }],
        },
        {
          label: "国語",
          items: [
            "japanese",
            "japanese/elementary-kanji-by-grade",
            {
              label: "3年生の漢字 水族館ドリル",
              collapsed: true,
              items: [
                { autogenerate: { directory: "japanese/grade-3-kanji-aquarium" } },
              ],
            },
            "japanese/hyakunin-isshu",
            "japanese/hyakunin-isshu-complete",
            "japanese/junior-high-japanese-overview",
          ],
        },
        {
          label: "理科",
          items: [{ autogenerate: { directory: "science" } }],
        },
        {
          label: "社会",
          items: [{ autogenerate: { directory: "social" } }],
        },
        {
          label: "外国語",
          items: [{ autogenerate: { directory: "english" } }],
        },
        {
          label: "図工・アート",
          items: [{ autogenerate: { directory: "art" } }],
        },
        {
          label: "体育",
          items: [{ autogenerate: { directory: "physical-education" } }],
        },
        {
          label: "おうちの方へ",
          items: [{ autogenerate: { directory: "parent-guide" } }],
        },
        {
          label: "このサイトについて",
          items: [{ autogenerate: { directory: "about" } }],
        },
      ],
```

- [ ] **Step 2: Verify the site still builds**

Run: `pnpm build`
Expected: succeeds (the `parent-guide` directory doesn't exist yet, but `autogenerate` on an empty/missing directory does not fail an Astro/Starlight build — it just contributes zero sidebar items until Task 3 creates content). If the build fails with a missing-directory error instead, create an empty `src/content/docs/parent-guide/.gitkeep` and re-run before proceeding — but do not commit that placeholder if Task 3's `index.md` supersedes it in the same work session.

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "feat(nav): move school-guide to top and add parent-guide category"
```

---

### Task 3: Category index page

**Files:**
- Create: `src/content/docs/parent-guide/index.md`

**Interfaces:**
- Consumes: sidebar group from Task 2.
- Produces: the `/manabi-commons/parent-guide/` route, and the two links Task 5 and Task 7 must match exactly (`/manabi-commons/parent-guide/habit-tracking-sheet/`, `/manabi-commons/parent-guide/reading-log-notebook/`).

- [ ] **Step 1: Create the file**

```markdown
---
title: おうちの方へ
description: 生活習慣づくりや読書を、子どもと一緒に無理なく続けるための保護者向け印刷シート集です。
sidebar:
  order: 1
---

このカテゴリーには、家庭での取り組みを子どもと一緒に見つけて残すための、印刷して使うシートをまとめています。

子どもを採点したり、他の子と比べたりするための道具ではありません。始めやすい環境を一緒につくり、できたことに気づき、子どもの言葉を残すための道具です。

## このカテゴリーのページ

- [できた日を見つける 1か月記録シート](/manabi-commons/parent-guide/habit-tracking-sheet/) — 生活習慣やちいさな取り組みを、○△いの印でゆるやかに記録する、A4横向きの記録シートです。
- [本との出会いを残す 読書記録ノート](/manabi-commons/parent-guide/reading-log-notebook/) — 読んだ本の記憶を、絵や気持ち、ひとことで残す、A4縦向きの読書記録ノートです。

## 使い方の共通ルール

- 空らんや未達成を失敗として扱いません。次の日からまた始められます。
- 兄弟姉妹や他の子と比べるための記録ではありません。
- 毎日続けることを前提にしていません。家庭に合ったペースで使ってください。
```

- [ ] **Step 2: Verify the route renders**

Run: `pnpm build && pnpm preview &`
Then in another terminal: `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4321/manabi-commons/parent-guide/`
Expected: `200`. Stop the preview server afterward (`kill %1` or `fg` then Ctrl+C).

- [ ] **Step 3: Commit**

```bash
git add src/content/docs/parent-guide/index.md
git commit -m "feat(parent-guide): add category index page"
```

---

### Task 4: `hb-` (habit sheet) CSS

**Files:**
- Modify: `src/styles/custom.css` (append a new section; also append to the existing `@media print { ... }` block that starts at line 867)

**Interfaces:**
- Consumes: nothing new.
- Produces: the full `hb-` class vocabulary Task 5's page markup depends on: `hb-web-tools`, `hb-print-buttons`, `hb-print-button`, `hb-print-button--secondary`, `hb-record-sheet`, `hb-sheet-head`, `hb-sheet-meta`, `hb-write` (+ `--name`, `--year`, `--month`, `--item` modifiers), `hb-legend`, `hb-scroll-hint`, `hb-grid-wrap`, `hb-grid`, `hb-grid-item-head`, `hb-grid-item`, `hb-cell`, `hb-notes`, `hb-notes-hint`, `hb-notes-lines`. Also produces the `hb-print-sheet-only` `<body>` class toggle behavior.

- [ ] **Step 1: Append the screen (non-print) styles**

Add at the end of `src/styles/custom.css`, before the `/* ===== 印刷スタイル ===== */` comment block that starts the `@page`/`@media print` section (i.e. insert this new section right before line 860's `/* ===== 印刷スタイル（A4 たて・1ミッション1ページ） ===== */`):

```css
/* ===== おうちの方へ：習慣記録シート（hb- プレフィックス） ===== */

.hb-web-tools {
  border: 1px solid var(--sl-color-gray-5, #cbd5e1);
  border-radius: 0.8rem;
  padding: 0.9rem 1rem;
  margin-block: 1rem 2rem;
}

.hb-web-tools p {
  margin-block: 0 0.75rem;
}

.hb-print-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.hb-print-button {
  border: 2px solid var(--sl-color-accent-high, #1d4ed8);
  border-radius: 999px;
  padding: 0.65rem 1.1rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  color: var(--sl-color-black, #fff);
  background: var(--sl-color-accent-high, #1d4ed8);
}

.hb-print-button--secondary {
  color: var(--sl-color-text, #111827);
  background: transparent;
}

.hb-print-button:hover,
.hb-print-button:focus-visible {
  outline: 3px solid var(--sl-color-accent, #60a5fa);
  outline-offset: 2px;
}

.hb-record-sheet {
  border: 3px solid var(--sl-color-gray-3, #64748b);
  border-radius: 1rem;
  padding: 1.25rem;
  margin-block: 1.5rem 1rem;
}

.hb-record-sheet > .sl-heading-wrapper:first-child,
.hb-record-sheet > h2:first-child {
  margin-top: 0;
}

.hb-sheet-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  border-block-end: 2px solid var(--sl-color-gray-5, #cbd5e1);
  padding-block-end: 0.8rem;
  margin-block-end: 0.8rem;
}

.hb-sheet-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  font-size: 0.95rem;
}

.hb-write {
  display: inline-block;
  min-inline-size: 4rem;
  block-size: 1.4rem;
  border-block-end: 1px solid currentColor;
  vertical-align: bottom;
}

.hb-write--name {
  min-inline-size: 8rem;
}

.hb-write--year,
.hb-write--month {
  min-inline-size: 3rem;
}

.hb-write--item {
  display: block;
  min-inline-size: 7rem;
  block-size: 1.4rem;
  border-block-end: 1px solid currentColor;
}

.hb-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  border: 1px solid var(--sl-color-gray-4, #94a3b8);
  border-radius: 0.6rem;
  padding: 0.6rem 0.9rem;
  margin-block: 0.8rem;
  font-size: 0.95rem;
}

.hb-scroll-hint {
  font-size: 0.85rem;
  color: var(--sl-color-gray-2, #334155);
  margin-block: 0.4rem 0;
}

.hb-grid-wrap {
  overflow-x: auto;
  margin-block: 1rem;
}

.hb-grid {
  width: 100%;
  min-width: 60rem;
  border-collapse: collapse;
  table-layout: fixed;
}

.hb-grid th,
.hb-grid td {
  border: 1px solid var(--sl-color-gray-4, #94a3b8);
  text-align: center;
  padding: 0.3rem;
}

.hb-grid-item-head,
.hb-grid-item {
  width: 9rem;
  text-align: start;
}

.hb-cell {
  min-width: 1.8rem;
  height: 2.4rem;
}

.hb-notes {
  margin-block: 1.5rem 0;
}

.hb-notes h3 {
  margin-block: 0 0.3rem;
  font-size: 1rem;
}

.hb-notes-hint {
  margin-block: 0 0.5rem;
  font-size: 0.85rem;
  color: var(--sl-color-gray-2, #334155);
}

.hb-notes-lines {
  display: grid;
  gap: 0;
}

.hb-notes-lines span {
  display: block;
  block-size: 2rem;
  border-block-end: 1px solid var(--sl-color-gray-3, #64748b);
}

@media screen and (max-width: 40rem) {
  .hb-print-button {
    width: 100%;
  }

  .hb-record-sheet {
    padding: 0.9rem;
  }
}
```

- [ ] **Step 2: Append the print styles**

Inside the existing `@media print { ... }` block (the one that already contains the `km-` and `ht-` rules), add this section right before the block's final closing `}` (i.e. after the last `ht-` rule, still inside `@media print`):

```css
  /* おうちの方へ：習慣記録シート */
  .hb-web-tools {
    display: none !important;
  }

  main:has(.hb-record-sheet) .content-panel,
  main:has(.hb-record-sheet) .sl-container {
    max-width: none;
    padding-inline: 0 !important;
  }

  .hb-record-sheet {
    position: relative;
    box-sizing: border-box;
    max-width: none;
    break-before: page;
    page-break-before: always;
    border: none;
    border-radius: 0;
    padding: 0;
    margin: 0;
    font-size: 9pt;
    line-height: 1.3;
  }

  .hb-record-sheet > .print-page-qr {
    position: absolute;
    inset-inline-end: 0;
    inset-block-start: 0;
  }

  .hb-record-sheet > .sl-heading-wrapper:first-child,
  .hb-record-sheet > h2:first-child,
  .hb-sheet-head {
    padding-inline-end: 24mm;
  }

  .hb-record-sheet h2 {
    font-size: 15pt;
  }

  .hb-legend {
    font-size: 8pt;
    padding: 1.5mm 2.5mm;
    margin-block: 1.5mm;
  }

  .hb-grid-wrap {
    overflow: visible;
  }

  .hb-grid {
    min-width: 0;
    font-size: 7pt;
  }

  .hb-grid th,
  .hb-grid td {
    padding: 0.8mm;
    border-color: #333;
  }

  .hb-grid-item-head,
  .hb-grid-item {
    width: 32mm;
  }

  .hb-cell {
    height: 8mm;
  }

  .hb-write,
  .hb-write--item {
    border-color: #333;
  }

  .hb-notes {
    margin-block-start: 2mm;
  }

  .hb-notes-hint {
    font-size: 7pt;
  }

  .hb-notes-lines span {
    block-size: 6mm;
    border-color: #333;
  }

  .hb-record-sheet,
  .hb-grid,
  .hb-legend,
  .hb-notes-lines {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  body.hb-print-sheet-only main > .content-panel:first-child,
  body.hb-print-sheet-only main .sl-markdown-content > :not(.hb-record-sheet) {
    display: none !important;
  }

  body.hb-print-sheet-only .hb-record-sheet {
    display: block !important;
    break-before: auto;
    page-break-before: auto;
  }
```

- [ ] **Step 3: Verify the stylesheet still builds**

Run: `pnpm build`
Expected: succeeds (CSS is not type-checked, but a broken `@media` brace nesting will surface as an Astro/Vite CSS parse error — confirm none appears in the build output).

- [ ] **Step 4: Commit**

```bash
git add src/styles/custom.css
git commit -m "feat(styles): add hb- habit-tracking-sheet print/screen styles"
```

---

### Task 5: Habit-tracking sheet page

**Files:**
- Create: `src/content/docs/parent-guide/habit-tracking-sheet.mdx`

**Interfaces:**
- Consumes: `hb-*` classes from Task 4, `hb-record-sheet` QR auto-mount from Task 1, category index link target from Task 3.
- Produces: the `/manabi-commons/parent-guide/habit-tracking-sheet/` route; linked from Task 3's index and from Task 7's related-pages section.

- [ ] **Step 1: Create the file**

```mdx
---
title: できた日を見つける 1か月記録シート
description: 家庭でのちいさな取り組みを、○△いの印でゆるやかに残す、A4横向き・1か月分の印刷用記録シートです。
sidebar:
  order: 1
learning_context:
  grade: 幼稚園〜小学校中学年
  subject: 家庭学習・生活習慣
  unit: 家庭でのちいさな取り組みの記録
review:
  source_ref:
    - "一般的な家庭学習支援・行動形成支援に関する考え方"
  ai_process:
    - structure
    - rewrite
    - critique
  confidence: medium
  human_review: required
  safety_review: required
  age_level_review: required
content_status:
  claim_status: tentative
  related_pages:
    - /parent-guide/reading-log-notebook/
    - /school-guide/kodomo-no-jikan-tsukaikata/
  update_note: "初版。習慣記録シートを新規作成。"
---

{/* ABOUTME: 幼稚園〜小学校中学年の子どもと保護者が、家庭でのちいさな取り組みを一緒に見つけて残すための印刷シートです。 */}
{/* ABOUTME: 採点や達成率を強調せず、○△いの3つの印と空らんだけで、ゆるやかに1か月を記録します。 */}

<style>
{`
  @page {
    size: A4 landscape;
    margin: 10mm;
  }
`}
</style>

毎日の「できた」を見つけて、ゆるやかに残すための、A4横1枚の記録シートです。

<div class="hb-web-tools">

<p>印刷して、お子さんと一緒に使ってください。採点するための表ではありません。</p>

<div class="hb-print-buttons" aria-label="印刷メニュー">
  <button class="hb-print-button" type="button" onclick="window.print()">説明とシートを一緒に印刷する</button>
  <button class="hb-print-button hb-print-button--secondary" type="button" onclick="document.body.classList.add('hb-print-sheet-only'); window.addEventListener('afterprint', () => document.body.classList.remove('hb-print-sheet-only'), { once: true }); window.print()">シートだけ印刷する</button>
</div>

</div>

## このシートでできること

- 毎日の取り組みを、○（できた）△（少しできた）い（家族といっしょにできた）の3つの印で残せます
- 空らんは「休んだ」「記録しなかった」という意味で、失敗の印ではありません
- 「20分勉強する」のような量ではなく、「絵本をひらく」のような始めるための小さな行動を記録できます
- 月末に、家庭に合ったやり方を短くメモできる欄があります

以下は、印刷して使うシートです。

<section class="hb-record-sheet" aria-labelledby="hb-sheet-title">

## <span id="hb-sheet-title">できた日を見つける 1か月記録シート</span>

<div class="hb-sheet-head">
<span class="hb-sheet-meta"><span>名前：<i class="hb-write hb-write--name"></i></span><span><i class="hb-write hb-write--year"></i>年 <i class="hb-write hb-write--month"></i>月</span></span>
</div>

<p class="hb-legend" aria-label="記録のしかた">
<span>○　できた</span>
<span>△　すこしできた</span>
<span>い　かぞくといっしょにできた</span>
<span>空らん　休んだ・記録しなかった</span>
</p>

<p class="hb-scroll-hint">画面ではば全体を確認しにくいときは、表を横にスクロールできます。実際の記入は、印刷してからご利用ください。</p>

<div class="hb-grid-wrap">
<table class="hb-grid">
<thead>
<tr>
<th scope="col" class="hb-grid-item-head">やりたいこと</th>
{Array.from({ length: 31 }).map((_, index) => <th scope="col">{index + 1}</th>)}
</tr>
</thead>
<tbody>
{Array.from({ length: 5 }).map((_, row) => (
<tr>
<td class="hb-grid-item"><span class="hb-write hb-write--item"></span></td>
{Array.from({ length: 31 }).map((_, day) => <td class="hb-cell"></td>)}
</tr>
))}
</tbody>
</table>
</div>

<div class="hb-notes">

### 今月見つけたこと

<p class="hb-notes-hint">例：朝より夕方のほうが取り組みやすかった／親と一緒なら始められた／毎日ではなく週3回くらいがちょうどよかった</p>

<div class="hb-notes-lines"><span></span><span></span><span></span></div>

</div>

</section>

## 使い方 3ステップ

1. 「やりたいこと」の欄に、5つまで書きます。結果ではなく、始めるための小さな行動にすると続けやすくなります。
2. 1日の終わりや気づいたタイミングで、○△いのどれかを書きます。できなかった日は空らんのままで大丈夫です。
3. 月末に「今月見つけたこと」を、お子さんと話しながら短くメモします。

## 年齢に合わせた使い方

### 幼稚園・年少〜年中

保護者が印をつけながら、「今日はこれ、できたね」と声をかける使い方が中心です。お子さんが絵を描き足しても構いません。

### 幼稚園・年長〜小学校低学年

お子さんが自分で印をつけられます。うまく書けなくても、印の場所が合っていれば十分です。

### 小学校中学年

取り組む項目を、お子さんと一緒に選ぶところから始めると、続けやすくなります。振り返りの欄も、お子さん自身の言葉で埋めてみてください。

## うまくいかないとき

- 空らんの日が続いても、そこで終わりにする必要はありません。次の日からまた印をつければ大丈夫です。
- 5項目すべてを埋めようとしなくて構いません。1つか2つから始めても十分です。
- 毎日ではなく、週に3回くらいのペースが合う家庭もあります。ペースは家庭ごとに調整してください。

## 保護者の方へ

このシートの役目は、採点することではありません。始めやすい環境を一緒につくり、できたことに気づき、続けやすい時間ややり方を一緒に見つけることです。空らんの日があっても、それは失敗の記録ではなく、次の日からまた始められる余白です。

## 記入例

| やりたいこと | 1日 | 2日 | 3日 | 4日 | 5日 |
|---|---|---|---|---|---|
| 絵本をひらく | ○ | ○ | △ | い |  |
| 音読を1回する | ○ |  | ○ | ○ | ○ |
| 明日の持ち物を見る | ○ | ○ | ○ |  | ○ |

今月見つけたこと（例）：朝より夕方のほうが取り組みやすかった。

## 印刷するときの注意

- A4横向き、白黒印刷で使えます。
- 「シートだけ印刷する」ボタンを使うと、説明を省いてシートだけを1枚印刷できます。
- 印刷後、家庭で使う項目や記録の頻度に合わせて調整してください。

## このページについて

- 対象：幼稚園〜小学校中学年の子どもと保護者
- 参考にした情報：一般的な家庭学習支援・行動形成支援に関する考え方
- この教材はAIの支援を受けて作成しており、公開前に内容・安全性・学年相応性の人間レビューが必要です。

## 関連ページ

- [本との出会いを残す 読書記録ノート](/manabi-commons/parent-guide/reading-log-notebook/)
- [子どもの時間のつかい方](/manabi-commons/school-guide/kodomo-no-jikan-tsukaikata/)
```

- [ ] **Step 2: Build and check for MDX compile errors**

Run: `pnpm build`
Expected: succeeds with no MDX/JSX compile errors. If the nested `Array.from(...).map(...)` inside the table fails to compile, check the error line — it is most likely a missing `.map` vs `Array.from`'s second-argument form; both are valid, but if the build complains, switch to the two-argument form `Array.from({ length: 31 }, (_, index) => <th scope="col">{index + 1}</th>)` (matching the exact pattern already used in `src/content/docs/japanese/grade-3-kanji-aquarium/extra-practice.mdx:63`) and rebuild.

- [ ] **Step 3: Verify the route renders with the sheet content**

Run: `pnpm build && pnpm preview &`
Then: `curl -s http://localhost:4321/manabi-commons/parent-guide/habit-tracking-sheet/ | grep -c 'hb-record-sheet'`
Expected: a non-zero count. Then: `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4321/manabi-commons/parent-guide/habit-tracking-sheet/` → expect `200`. Stop the preview server afterward.

- [ ] **Step 4: Commit**

```bash
git add src/content/docs/parent-guide/habit-tracking-sheet.mdx
git commit -m "feat(parent-guide): add habit-tracking sheet page"
```

---

### Task 6: `rn-` (reading notebook) CSS

**Files:**
- Modify: `src/styles/custom.css` (append after the `hb-` screen section from Task 4, and append to the `@media print` block after the `hb-` print rules from Task 4)

**Interfaces:**
- Consumes: nothing new.
- Produces: the `rn-` class vocabulary Task 7's page markup depends on: `rn-web-tools`, `rn-print-buttons`, `rn-print-button`, `rn-print-button--secondary`, `rn-notebook-page`, `rn-entry`, `rn-entry-head`, `rn-inline-write` (+ `--wide` modifier), `rn-field`, `rn-write-lines` (+ `--one` modifier), `rn-two-columns`, `rn-draw-box`, `rn-hint`, `rn-checks`. Also produces the `rn-print-sheet-only` `<body>` class toggle behavior.

- [ ] **Step 1: Append the screen (non-print) styles**

Add at the end of `src/styles/custom.css`, right after the `hb-` screen section's closing `@media screen and (max-width: 40rem) { ... }` block from Task 4, and still before the `/* ===== 印刷スタイル ===== */` comment:

```css
/* ===== おうちの方へ：読書記録ノート（rn- プレフィックス） ===== */

.rn-web-tools {
  border: 1px solid var(--sl-color-gray-5, #cbd5e1);
  border-radius: 0.8rem;
  padding: 0.9rem 1rem;
  margin-block: 1rem 2rem;
}

.rn-web-tools p {
  margin-block: 0 0.75rem;
}

.rn-print-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.rn-print-button {
  border: 2px solid var(--sl-color-accent-high, #1d4ed8);
  border-radius: 999px;
  padding: 0.65rem 1.1rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  color: var(--sl-color-black, #fff);
  background: var(--sl-color-accent-high, #1d4ed8);
}

.rn-print-button--secondary {
  color: var(--sl-color-text, #111827);
  background: transparent;
}

.rn-print-button:hover,
.rn-print-button:focus-visible {
  outline: 3px solid var(--sl-color-accent, #60a5fa);
  outline-offset: 2px;
}

.rn-notebook-page {
  max-width: 44rem;
  border: 3px solid var(--sl-color-gray-3, #64748b);
  border-radius: 1rem;
  padding: 1.25rem;
  margin-block: 1.5rem 1rem;
}

.rn-notebook-page > .sl-heading-wrapper:first-child,
.rn-notebook-page > h2:first-child {
  margin-top: 0;
}

.rn-entry {
  border: 1px solid var(--sl-color-gray-4, #94a3b8);
  border-radius: 0.8rem;
  padding: 1rem;
  margin-block: 1rem;
}

.rn-entry-head {
  display: grid;
  gap: 0.5rem;
  margin-block-end: 0.8rem;
}

.rn-entry-head p {
  margin-block: 0;
}

.rn-inline-write {
  display: inline-block;
  min-inline-size: 6rem;
  border-block-end: 1px solid currentColor;
  vertical-align: bottom;
}

.rn-inline-write--wide {
  min-inline-size: 12rem;
}

.rn-field {
  margin-block: 0.8rem;
}

.rn-field h4 {
  margin-block: 0 0.35rem;
  font-size: 0.95rem;
}

.rn-write-lines {
  display: grid;
}

.rn-write-lines span {
  display: block;
  block-size: 2rem;
  border-block-end: 1px solid var(--sl-color-gray-3, #64748b);
}

.rn-write-lines--one span {
  block-size: 1.6rem;
}

.rn-two-columns {
  display: grid;
  grid-template-columns: minmax(8rem, 10rem) minmax(0, 1fr);
  gap: 0.8rem;
  align-items: start;
}

.rn-draw-box {
  box-sizing: border-box;
  aspect-ratio: 1 / 1;
  border: 1.5px solid var(--sl-color-gray-4, #94a3b8);
}

.rn-hint {
  margin-block: 0.5rem 0;
  font-size: 0.85rem;
  color: var(--sl-color-gray-2, #334155);
}

.rn-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
}

.rn-checks label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-block: 0;
}

.rn-checks input {
  inline-size: 1.1rem;
  block-size: 1.1rem;
  margin: 0;
  accent-color: var(--sl-color-accent-high, #1d4ed8);
}

@media screen and (max-width: 40rem) {
  .rn-print-button {
    width: 100%;
  }

  .rn-two-columns {
    grid-template-columns: 1fr;
  }

  .rn-notebook-page {
    padding: 0.9rem;
  }
}
```

- [ ] **Step 2: Append the print styles**

Inside the existing `@media print { ... }` block, right after the `hb-` print rules added in Task 4, add:

```css
  /* おうちの方へ：読書記録ノート */
  .rn-web-tools {
    display: none !important;
  }

  main:has(.rn-notebook-page) .content-panel,
  main:has(.rn-notebook-page) .sl-container {
    max-width: none;
    padding-inline: 0 !important;
  }

  .rn-notebook-page {
    position: relative;
    box-sizing: border-box;
    max-width: none;
    min-height: 260mm;
    break-before: page;
    page-break-before: always;
    border: none;
    border-radius: 0;
    padding: 0;
    margin: 0;
    font-size: 9.5pt;
    line-height: 1.35;
  }

  .rn-notebook-page > .print-page-qr {
    position: absolute;
    inset-inline-end: 0;
    inset-block-start: 0;
  }

  .rn-notebook-page > .sl-heading-wrapper:first-child,
  .rn-notebook-page > h2:first-child {
    padding-inline-end: 24mm;
  }

  .rn-notebook-page h2 {
    font-size: 16pt;
  }

  .rn-entry {
    border-color: #444;
    padding: 3mm 4mm;
    margin-block: 3mm;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .rn-inline-write {
    border-color: #444;
  }

  .rn-field {
    margin-block: 2mm;
  }

  .rn-field h4 {
    font-size: 8.5pt;
  }

  .rn-write-lines span {
    block-size: 6mm;
    border-color: #444;
  }

  .rn-write-lines--one span {
    block-size: 5mm;
  }

  .rn-draw-box {
    border-color: #444;
  }

  .rn-hint {
    font-size: 7pt;
  }

  .rn-checks {
    font-size: 8pt;
    gap: 1mm 4mm;
  }

  body.rn-print-sheet-only main > .content-panel:first-child,
  body.rn-print-sheet-only main .sl-markdown-content > :not(.rn-notebook-page) {
    display: none !important;
  }

  body.rn-print-sheet-only .rn-notebook-page {
    display: block !important;
    break-before: auto;
    page-break-before: auto;
  }
```

- [ ] **Step 3: Verify the stylesheet still builds**

Run: `pnpm build`
Expected: succeeds with no CSS parse errors.

- [ ] **Step 4: Commit**

```bash
git add src/styles/custom.css
git commit -m "feat(styles): add rn- reading-log-notebook print/screen styles"
```

---

### Task 7: Reading-log notebook page

**Files:**
- Create: `src/content/docs/parent-guide/reading-log-notebook.mdx`

**Interfaces:**
- Consumes: `rn-*` classes from Task 6, `rn-notebook-page` QR auto-mount from Task 1, category index link target from Task 3, links back to Task 5's page.
- Produces: the `/manabi-commons/parent-guide/reading-log-notebook/` route.

- [ ] **Step 1: Create the file**

```mdx
---
title: 本との出会いを残す 読書記録ノート
description: 読んだ本の記憶を、絵や気持ち、ひとことばで残す、A4縦向きの印刷用読書記録ノートです。
sidebar:
  order: 2
learning_context:
  grade: 幼稚園〜小学校中学年
  subject: 家庭学習・読書
  unit: 読書の記録
review:
  source_ref:
    - "一般的な読書経験の記録・対話支援に関する考え方"
  ai_process:
    - structure
    - rewrite
    - critique
  confidence: medium
  human_review: required
  safety_review: required
  age_level_review: required
content_status:
  claim_status: tentative
  related_pages:
    - /parent-guide/habit-tracking-sheet/
  update_note: "初版。読書記録ノートを新規作成。"
---

{/* ABOUTME: 幼稚園〜小学校中学年の子どもと保護者が、本と出会った記憶を残すための印刷ノートです。 */}
{/* ABOUTME: 読書量の管理表ではなく、絵・気持ち・ひとことのどれか一つでも記録として成立する設計です。 */}

読んだ本の記憶を残す、A4縦1枚の読書記録ノートです。読み聞かせも読書として記録できます。

<div class="rn-web-tools">

<p>印刷して、お子さんと一緒に使ってください。読んだ冊数を競うための表ではありません。</p>

<div class="rn-print-buttons" aria-label="印刷メニュー">
  <button class="rn-print-button" type="button" onclick="window.print()">説明とノートを一緒に印刷する</button>
  <button class="rn-print-button rn-print-button--secondary" type="button" onclick="document.body.classList.add('rn-print-sheet-only'); window.addEventListener('afterprint', () => document.body.classList.remove('rn-print-sheet-only'), { once: true }); window.print()">ノートだけ印刷する</button>
</div>

</div>

## このノートでできること

- 読んでもらった本・いっしょに読んだ本・ひとりで読んだ本を、同じように記録できます
- 絵を描く、気持ちを選ぶ、ひとこと書く、話した言葉を書いてもらうのうち、どれか一つだけでも記録として成立します
- 読み終えていない本も記録できます
- 中学年以降は、3つの問いから1つを選んで答える形式が使えます

以下は、印刷して使うノートです。1枚に2冊分を記録できます。

<section class="rn-notebook-page" aria-labelledby="rn-page-title">

## <span id="rn-page-title">本との出会いを残す 読書記録ノート</span>

{Array.from({ length: 2 }).map((_, index) => (
<article class="rn-entry" aria-label="本の記録">

<div class="rn-entry-head">
<p>読んだ日：<i class="rn-inline-write"></i>　　本の名前：<i class="rn-inline-write rn-inline-write--wide"></i></p>
<p>作者・作った人：<i class="rn-inline-write rn-inline-write--wide"></i></p>
</div>

<div class="rn-field">
<h4>どのように読んだか</h4>
<div class="rn-checks" role="group" aria-label="どのように読んだか">
<label><input type="checkbox" /> 読んでもらった</label>
<label><input type="checkbox" /> いっしょに読んだ</label>
<label><input type="checkbox" /> ひとりで読んだ</label>
</div>
</div>

<div class="rn-field">
<h4>どんな気持ちになったか（いくつ選んでもよい）</h4>
<div class="rn-checks" role="group" aria-label="どんな気持ちになったか">
<label><input type="checkbox" /> たのしい</label>
<label><input type="checkbox" /> びっくり</label>
<label><input type="checkbox" /> かなしい</label>
<label><input type="checkbox" /> こわい</label>
<label><input type="checkbox" /> ふしぎ</label>
<label><input type="checkbox" /> もっと知りたい</label>
</div>
</div>

<div class="rn-field rn-two-columns">
<div>
<h4>絵を描く</h4>
<div class="rn-draw-box" aria-label="絵を描く欄"></div>
</div>
<div>
<h4>心に残ったところ</h4>
<div class="rn-write-lines" aria-label="心に残ったところの記入欄"><span></span><span></span></div>
<p class="rn-hint">中学年以降は、次のどれか一つに答えてもよいです。心に残った場面は？／初めて知ったことは？／誰かに話したいことは？</p>
</div>
</div>

<div class="rn-field">
<h4>おうちの人のメモ</h4>
<div class="rn-write-lines rn-write-lines--one" aria-label="おうちの人のメモの記入欄"><span></span></div>
</div>

</article>
))}

</section>

## 使い方 3ステップ

1. 本を読み終えたときや、読んでいる途中でも、気が向いたタイミングで開きます。
2. 「どのように読んだか」と「どんな気持ちになったか」に印をつけます。迷ったら、いくつ選んでも構いません。
3. 「絵を描く」「心に残ったところ」のどちらか、書きやすいほうを埋めます。両方でなくて大丈夫です。

## 年齢に合わせた使い方

### 幼児・小学校低学年

文章を書けなくても、絵を描く、気持ちを選ぶ、ひとことだけ書く、お子さんが話した言葉をおうちの方が書く、のどれか一つで記録が完成します。

### 小学校中学年以降

「心に残った場面は？」「初めて知ったことは？」「誰かに話したいことは？」の中から1つを選んで答えてみます。すべてに答える必要はありません。

## うまくいかないとき

- 途中で読むのをやめた本も、記録して構いません。
- 毎回すべての欄を埋めようとしなくて大丈夫です。1つの欄だけでも記録になります。
- 読み聞かせだけの期間が続いても、それも読書の記録です。

## 保護者の方へ

このノートの役目は、読んだ冊数を管理することではありません。本と出会った記憶と、お子さんの言葉を残すことです。読み聞かせも、ひとりで読んだ本と同じように大切な記録です。空らんの欄があっても、次に開いたときにまた書き足せます。

## 記入例

- 読んだ日：7月10日　本の名前：おおきなかぶ　作者：Aさん
- どのように読んだか：いっしょに読んだ
- どんな気持ちになったか：たのしい、ふしぎ
- 心に残ったところ（ひとこと）：「うんとこしょ、どっこいしょ」のところがおもしろかった

## 印刷するときの注意

- A4縦向き、白黒印刷で使えます。1枚に2冊分を記録できます。
- 「ノートだけ印刷する」ボタンを使うと、説明を省いてノートだけを印刷できます。
- 複数冊を続けて記録したいときは、必要な枚数だけ印刷してください。

## このページについて

- 対象：幼稚園〜小学校中学年の子どもと保護者
- 参考にした情報：一般的な読書経験の記録・対話支援に関する考え方
- この教材はAIの支援を受けて作成しており、公開前に内容・安全性・学年相応性の人間レビューが必要です。

## 関連ページ

- [できた日を見つける 1か月記録シート](/manabi-commons/parent-guide/habit-tracking-sheet/)
```

- [ ] **Step 2: Build and check for MDX compile errors**

Run: `pnpm build`
Expected: succeeds. If the `{Array.from({ length: 2 }).map((_, index) => ( ... ))}` block fails to compile because `index` is unused, remove the unused binding or replace with `Array.from({ length: 2 }, () => ( ... ))` (no index needed since both entries render identical blank markup).

- [ ] **Step 3: Verify the route renders**

Run: `pnpm build && pnpm preview &`
Then: `curl -s http://localhost:4321/manabi-commons/parent-guide/reading-log-notebook/ | grep -c 'rn-notebook-page'`
Expected: non-zero. Then confirm `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4321/manabi-commons/parent-guide/reading-log-notebook/` → `200`. Stop the preview server afterward.

- [ ] **Step 4: Commit**

```bash
git add src/content/docs/parent-guide/reading-log-notebook.mdx
git commit -m "feat(parent-guide): add reading-log notebook page"
```

---

### Task 8: Full verification pass

**Files:** none created or modified — this task only runs checks.

**Interfaces:**
- Consumes: everything from Tasks 1–7.
- Produces: confidence that the full test suite, build, and print rendering are correct before considering the feature done.

- [ ] **Step 1: Run the unit test suite**

Run: `pnpm test:unit`
Expected: all tests pass, including the two `print-qr-core.test.ts` cases from Task 1 and the pre-existing `content-routes.test.ts` (unaffected, since it only reads directory structure, not specific filenames).

- [ ] **Step 2: Run the full build**

Run: `pnpm build`
Expected: succeeds with no errors, and the output includes:
- `dist/parent-guide/index.html`
- `dist/parent-guide/habit-tracking-sheet/index.html`
- `dist/parent-guide/reading-log-notebook/index.html`

Verify with: `ls dist/parent-guide/ dist/parent-guide/habit-tracking-sheet/ dist/parent-guide/reading-log-notebook/`

- [ ] **Step 3: Run the e2e smoke suite**

Run: `pnpm test:e2e`
Expected: all tests pass, including three new auto-discovered cases from `tests/content-smoke.spec.ts` (`renders /parent-guide`, `renders /parent-guide/habit-tracking-sheet`, `renders /parent-guide/reading-log-notebook`), each asserting HTTP 200 and a visible `main h1`.

- [ ] **Step 4: Visually verify print rendering**

This step follows the `gotchas.md` requirement that a print worksheet is not "done" just because it fits one page — the actual ink/space allocation must be checked visually.

Run (from the scratchpad directory, using the already-installed Playwright browser):

```bash
cd /private/tmp/claude-501/-Users-masumi-ghq-github-com-kotowari-modoki-manabi-commons/4cbfcf3c-de00-4819-90b1-dd5af3f7adbc/scratchpad
cat > print-check.mjs <<'EOF'
import { chromium } from '@playwright/test';

const base = 'http://localhost:4321/manabi-commons/parent-guide';
const pages = [
  ['habit-tracking-sheet', 'landscape'],
  ['reading-log-notebook', 'portrait'],
];

const browser = await chromium.launch();
for (const [slug, orientation] of pages) {
  const page = await browser.newPage();
  await page.goto(`${base}/${slug}/`);
  await page.emulateMedia({ media: 'print' });
  await page.evaluate((slug) => {
    document.body.classList.add(slug.startsWith('habit') ? 'hb-print-sheet-only' : 'rn-print-sheet-only');
  }, slug);
  await page.pdf({
    path: `${slug}.pdf`,
    format: 'A4',
    landscape: orientation === 'landscape',
    printBackground: true,
  });
  await page.close();
}
await browser.close();
EOF
node print-check.mjs
```

(Run `pnpm build && pnpm preview &` first so `localhost:4321` is serving; stop it with `kill %1` afterward.)

Then read `habit-tracking-sheet.pdf` and `reading-log-notebook.pdf` (or convert the first page to PNG with a tool like `pdftoppm -png -r 150` if available) and visually confirm, per `gotchas.md`:
- the habit sheet fits one A4 landscape page without cramped/illegible day cells
- the reading notebook's two entries fit one A4 portrait page with genuinely usable write-in space (not just technically non-overflowing)
- the print QR code appears top-right on both, without overlapping the heading
- all borders and text are legible in black/white (no color-dependent meaning)

If any sheet is too cramped or too sparse, go back to the relevant Task 4/6 CSS (`mm` sizing) and adjust, then re-run this step.

- [ ] **Step 5: Verify mobile screen layout**

Run: `pnpm preview &` (if not already running), then use a browser or Playwright to load both pages at a 375px-wide viewport and confirm:
- the `hb-grid` table scrolls horizontally inside `.hb-grid-wrap` without breaking the page layout
- the `rn-two-columns` field stacks to one column (per the `@media screen and (max-width: 40rem)` rule in Task 6)
- the print button pair wraps to full-width buttons

Stop the preview server when done.

- [ ] **Step 6: Final commit (if Step 4 required CSS adjustments)**

Only if Step 4 required changes:

```bash
git add src/styles/custom.css
git commit -m "fix(parent-guide): adjust print sheet sizing after visual QA"
```

If no adjustments were needed, skip this step — Tasks 1–7 already committed everything.

---

## Self-Review Notes

- **Spec coverage:** all 10 required page sections are present in both Task 5 and Task 7 content; ×-avoidance, no-streaks, no-comparison, read-aloud-counts, and incomplete-books-count rules are all reflected in the copy; sidebar reorder matches the user's exact instruction (`school-guide` to top, `parent-guide` after `physical-education`); print QR, print-sheet-only toggle, and A4 landscape/portrait `@page` sizing are all implemented; mobile and print verification are both explicit steps in Task 8.
- **Placeholder scan:** no TBD/TODO markers; all copy is real, final-draft Japanese text (still subject to the site's standard human-review gate per frontmatter `human_review: required`, which is a content-review requirement, not a plan placeholder).
- **Type/name consistency:** `hb-record-sheet` and `rn-notebook-page` are the exact class names used consistently across Task 1 (JS selector), Task 4/6 (CSS), and Task 5/7 (markup). `hb-print-sheet-only` / `rn-print-sheet-only` body classes match between the inline `onclick` handlers (Task 5/7) and the CSS `body.*-print-sheet-only` rules (Task 4/6).
