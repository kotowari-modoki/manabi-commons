# AGENTS.md — manabi-commons

## エージェントへの基本指示

このリポジトリは子供向け無料教科書サイト。
コンテンツの品質と安全性を最優先とする。

AIが commit したら必ず `Co-authored-by` を付ける。

## 許可されるタスク

- `src/content/docs/` 以下の `.md` / `.mdx` ファイルの作成・編集
- `astro.config.mjs` のサイドバー設定の更新
- `src/styles/custom.css` のスタイル調整
- `public/` への画像・アセット追加

## 禁止されるタスク

- `package.json` の依存関係変更（人間がレビューする）
- GitHub Actions ワークフローの変更
- 外部URLへのfetch・API呼び出し
- ライセンス・著作権表記の変更
- 記事(`src/content/docs/` 配下)ごとの専用テストを追加すること。ページの表示検証は `tests/content-smoke.spec.ts` が全ページを自動で対象にし、frontmatter の構造は `src/content.config.ts` のスキーマと `astro build` が検証する。記事の追加・修正にテストコードの追加は不要。

## コンテンツ生成時の品質基準

1. **正確性**: 学習指導要領に準拠しているか
2. **平易さ**: 対象学年の語彙で書かれているか
3. **安全性**: 不適切な表現・内容がないか
4. **構造**: frontmatterが正しく記述されているか

## AI-Assisted Educational Content Rules

- AI支援で作成・修正した教材は、人間レビューを前提にする
- 正確性に自信がない内容は、公開教材へ直接入れず、レビュー候補として残す
- AIが行った処理は、必要に応じて `review.ai_process` に残す
- 断定できない内容は断定しない。「確認が必要」「学年や単元によって扱いが変わる」など、読者に誤解を与えない表現にする
- AI活用そのものを前面に出すより、教材として正確で読みやすく、安全であることを優先する

## Source and Review Requirements

- 教材を追加・大幅更新する場合は、対象学年、教科、単元、学習指導要領との対応、参考情報源を確認する
- `learning_context`、`review`、`content_status` は新規教材や大幅更新教材で使える任意メタデータとして扱う
- 学習指導要領、公式資料、信頼できる参考情報を優先する
- 人間レビューが必要な場合は `review.human_review: required` を付ける

## Age-Level and Safety Review

- 対象学年に語彙、例題、文量、抽象度が合っているか確認する
- 子どもに危険・不適切・偏った内容を含めない
- 保護者・教師が見ても不自然でない説明にする
- つまずきやすい表現、誤解しやすい例、答えと解説の不一致を確認する
- 安全性、年齢相応性に不安があれば `review.safety_review: required` または `review.age_level_review: required` を付ける

## No Silent Overwrite Policy

- 過去教材と説明が変わる場合は、黙って上書きせず update note や review note を残す
- 旧説明が誤解を招く場合でも、変更理由をPRコメントか `content_status.update_note` に残す
- 矛盾、難易度不一致、学習指導要領とのずれは自動修正だけで済ませず、レビュー候補にする

## PRコメントに含めること

コンテンツを追加・変更した場合、必ず以下を記載：
- 対象学年
- 対応する学習指導要領の項目（わかる場合）
- 参考にした情報源
- AI process（AI支援を使った場合）
- confidence
- human_review / safety_review / age_level_review の要否
- update note や過去教材との違い（説明を変えた場合）

## エラー時の挙動

コンテンツの正確性に自信がない場合は生成せず、
その旨をコメントに残して人間のレビューを求める。



## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
