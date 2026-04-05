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

## コンテンツ生成時の品質基準

1. **正確性**: 学習指導要領に準拠しているか
2. **平易さ**: 対象学年の語彙で書かれているか
3. **安全性**: 不適切な表現・内容がないか
4. **構造**: frontmatterが正しく記述されているか

## PRコメントに含めること

コンテンツを追加・変更した場合、必ず以下を記載：
- 対象学年
- 対応する学習指導要領の項目（わかる場合）
- 参考にした情報源

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
