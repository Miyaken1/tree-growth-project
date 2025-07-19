# Contributing to Tree Growth Visualization

このプロジェクトへの貢献に興味を持っていただき、ありがとうございます！

## 開発環境のセットアップ

1. リポジトリをフォーク・クローン
```bash
git clone https://github.com/YOUR_USERNAME/tree-growth-visualization.git
cd tree-growth-visualization
```

2. 依存関係のインストール
```bash
npm install
```

3. ローカルサーバーの起動
```bash
npm start
# または
./scripts/start-server.sh
```

## 開発ガイドライン

### コードスタイル
- HTML: セマンティックなマークアップを心がける
- CSS: Tailwind CSSを使用
- JavaScript: ES6+ を使用し、モダンな書き方を心がける

### コミットメッセージ
- feat: 新機能
- fix: バグ修正
- docs: ドキュメント更新
- style: コードスタイル変更
- refactor: リファクタリング
- test: テスト追加・修正

### プルリクエスト
1. フィーチャーブランチを作成
2. 変更を実装
3. テストを実行
4. プルリクエストを作成

## テスト

```bash
# Lighthouse CI実行
npm run lighthouse:local
```

## 質問・議論

GitHubのIssuesまたはDiscussionsをご利用ください。
