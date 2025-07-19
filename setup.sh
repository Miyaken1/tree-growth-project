#!/bin/bash

# Tree Growth Visualization - Setup Script
# このスクリプトは樹木の成長可視化システムの初期セットアップを行います

set -e  # エラー時に停止

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# プロジェクト情報
PROJECT_NAME="tree-growth-visualization"
PROJECT_DESCRIPTION="樹木の成長を可視化するWebシステム"

# 関数: 必要なツールの確認
check_requirements() {
    log_info "必要なツールを確認しています..."
    
    # Git
    if ! command -v git &> /dev/null; then
        log_error "Git がインストールされていません"
        exit 1
    fi
    
    # Node.js (オプション)
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_info "Node.js detected: $NODE_VERSION"
    else
        log_warning "Node.js がインストールされていません（推奨）"
    fi
    
    # Python (ローカルサーバー用)
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        log_info "Python3 detected: $PYTHON_VERSION"
    else
        log_warning "Python3 がインストールされていません（ローカルサーバー用に推奨）"
    fi
    
    log_success "要件チェック完了"
}

# 関数: プロジェクト構造の作成
create_project_structure() {
    log_info "プロジェクト構造を作成しています..."
    
    # ディレクトリ作成
    mkdir -p .github/workflows
    mkdir -p assets/icons
    mkdir -p docs
    mkdir -p scripts
    
    log_success "プロジェクト構造を作成しました"
}

# 関数: package.jsonの作成
create_package_json() {
    log_info "package.json を作成しています..."
    
    cat > package.json << EOF
{
  "name": "$PROJECT_NAME",
  "version": "1.0.0",
  "description": "$PROJECT_DESCRIPTION",
  "main": "index.html",
  "scripts": {
    "start": "python3 -m http.server 8080",
    "dev": "python3 -m http.server 8080",
    "build": "echo 'No build process required for static site'",
    "test": "echo 'No tests specified'",
    "lighthouse": "lhci autorun",
    "lighthouse:local": "lhci autorun --config=lighthouserc-local.js",
    "deploy": "gh-pages -d .",
    "setup": "./scripts/setup.sh"
  },
  "keywords": [
    "visualization",
    "tree",
    "growth",
    "education",
    "progress",
    "web",
    "pwa"
  ],
  "author": "Tree Growth Visualization Team",
  "license": "MIT",
  "homepage": "https://github.com/YOUR_USERNAME/$PROJECT_NAME#readme",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/YOUR_USERNAME/$PROJECT_NAME.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/$PROJECT_NAME/issues"
  },
  "devDependencies": {
    "@lhci/cli": "^0.12.0",
    "gh-pages": "^6.0.0"
  },
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead"
  ]
}
EOF
    
    log_success "package.json を作成しました"
}

# 関数: .gitignoreの作成
create_gitignore() {
    log_info ".gitignore を作成しています..."
    
    cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Lighthouse CI
.lighthouseci/
lhci_reports/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary files
*.tmp
*.temp
*.cache

# Logs
logs
*.log

# Build outputs
dist/
build/

# Google Apps Script files (if using clasp)
.clasp.json

# Backup files
*.backup
*.bak

# Archives
*.zip
*.tar.gz
*.rar

# Local development
.local/
EOF
    
    log_success ".gitignore を作成しました"
}

# 関数: LICENSEファイルの作成
create_license() {
    log_info "LICENSE ファイルを作成しています..."
    
    YEAR=$(date +%Y)
    
    cat > LICENSE << EOF
MIT License

Copyright (c) $YEAR Tree Growth Visualization Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
    
    log_success "LICENSE ファイルを作成しました"
}

# 関数: 開発用スクリプトの作成
create_dev_scripts() {
    log_info "開発用スクリプトを作成しています..."
    
    # ローカルサーバー起動スクリプト
    cat > scripts/start-server.sh << 'EOF'
#!/bin/bash

# ローカル開発サーバーの起動

PORT=${1:-8080}

echo "Starting local server on port $PORT..."
echo "Open http://localhost:$PORT in your browser"
echo "Press Ctrl+C to stop the server"

if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    python -m http.server $PORT
elif command -v node &> /dev/null && npm list -g live-server &> /dev/null; then
    live-server --port=$PORT
else
    echo "Error: No suitable server found. Please install Python3 or Node.js with live-server"
    exit 1
fi
EOF
    
    # デプロイスクリプト
    cat > scripts/deploy.sh << 'EOF'
#!/bin/bash

# GitHub Pagesへのデプロイスクリプト

set -e

echo "Deploying to GitHub Pages..."

# Gitの状態確認
if [ -n "$(git status --porcelain)" ]; then
    echo "Warning: You have uncommitted changes"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 現在のブランチを確認
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Warning: You are not on the main branch (current: $CURRENT_BRANCH)"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# GitHub Pagesの設定確認
echo "Make sure GitHub Pages is enabled in repository settings:"
echo "1. Go to Settings > Pages"
echo "2. Source: Deploy from a branch"
echo "3. Branch: main / (root)"

read -p "Press Enter to continue after confirming GitHub Pages settings..."

# プッシュ
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || true
git push origin main

echo "Deployment completed!"
echo "Your site will be available at: https://YOUR_USERNAME.github.io/YOUR_REPO/"
EOF
    
    # 設定更新スクリプト
    cat > scripts/update-config.sh << 'EOF'
#!/bin/bash

# 設定ファイルの一括更新

echo "Updating configuration files..."

# Google Apps Script URLの設定
read -p "Enter your Google Apps Script URL: " GAS_URL

if [ -n "$GAS_URL" ]; then
    # HTMLファイル内のURLを置換
    for file in *.html; do
        if [ -f "$file" ]; then
            sed -i.bak "s|YOUR_GOOGLE_APPS_SCRIPT_URL|$GAS_URL|g" "$file"
            rm "$file.bak"
            echo "Updated $file"
        fi
    done
    
    echo "Configuration updated successfully!"
else
    echo "No URL provided. Configuration not updated."
fi
EOF
    
    # 実行権限を付与
    chmod +x scripts/*.sh
    
    log_success "開発用スクリプトを作成しました"
}

# 関数: 設定ファイルの作成
create_config_files() {
    log_info "設定ファイルを作成しています..."
    
    # EditorConfig
    cat > .editorconfig << EOF
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.{js,html,css,json}]
indent_size = 2

[*.yml]
indent_size = 2
EOF
    
    # Prettier設定（オプション）
    cat > .prettierrc << EOF
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
EOF
    
    # VSCode設定
    mkdir -p .vscode
    cat > .vscode/settings.json << EOF
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  },
  "files.associations": {
    "*.html": "html"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "live-server.settings.donotShowInfoMsg": true,
  "live-server.settings.port": 8080
}
EOF
    
    cat > .vscode/extensions.json << EOF
{
  "recommendations": [
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "ms-vscode.live-server",
    "esbenp.prettier-vscode"
  ]
}
EOF
    
    log_success "設定ファイルを作成しました"
}

# 関数: ドキュメントの作成
create_documentation() {
    log_info "ドキュメントを作成しています..."
    
    # CONTRIBUTING.md
    cat > CONTRIBUTING.md << EOF
# Contributing to Tree Growth Visualization

このプロジェクトへの貢献に興味を持っていただき、ありがとうございます！

## 開発環境のセットアップ

1. リポジトリをフォーク・クローン
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/tree-growth-visualization.git
cd tree-growth-visualization
\`\`\`

2. 依存関係のインストール
\`\`\`bash
npm install
\`\`\`

3. ローカルサーバーの起動
\`\`\`bash
npm start
# または
./scripts/start-server.sh
\`\`\`

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

\`\`\`bash
# Lighthouse CI実行
npm run lighthouse:local
\`\`\`

## 質問・議論

GitHubのIssuesまたはDiscussionsをご利用ください。
EOF
    
    # CHANGELOG.md
    cat > CHANGELOG.md << EOF
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - $(date +%Y-%m-%d)

### Added
- 初期リリース
- 樹木の成長段階可視化機能
- リアルタイム統計表示
- 管理者画面
- PWA対応
- レスポンシブデザイン
- アクセシビリティ対応
- Google Forms/Sheets連携
- Lighthouse CI対応

### Changed

### Deprecated

### Removed

### Fixed

### Security
EOF
    
    log_success "ドキュメントを作成しました"
}

# 関数: Git初期化
initialize_git() {
    if [ ! -d ".git" ]; then
        log_info "Gitリポジトリを初期化しています..."
        
        git init
        git add .
        git commit -m "Initial commit: Tree Growth Visualization System"
        
        log_success "Gitリポジトリを初期化しました"
    else
        log_info "Gitリポジトリは既に初期化されています"
    fi
}

# 関数: セットアップ完了メッセージ
show_completion_message() {
    echo
    log_success "=== セットアップ完了 ==="
    echo
    echo -e "${GREEN}樹木の成長可視化システムのセットアップが完了しました！${NC}"
    echo
    echo "次のステップ:"
    echo "1. Google Apps Script の設定"
    echo "   - Google Apps Scriptプロジェクトを作成"
    echo "   - Code.gsの内容をコピー&ペースト"
    echo "   - SPREADSHEET_IDを設定"
    echo "   - Webアプリとしてデプロイ"
    echo
    echo "2. HTMLファイルの設定"
    echo "   - 各HTMLファイルのYOUR_GOOGLE_APPS_SCRIPT_URLを置換"
    echo "   - または scripts/update-config.sh を実行"
    echo
    echo "3. ローカル開発サーバーの起動"
    echo "   npm start または ./scripts/start-server.sh"
    echo
    echo "4. GitHub Pagesでのデプロイ"
    echo "   - GitHubリポジトリを作成"
    echo "   - リポジトリ設定でGitHub Pagesを有効化"
    echo "   - git push でデプロイ"
    echo
    echo "詳細な手順はREADME.mdをご確認ください。"
    echo
}

# メイン実行
main() {
    echo -e "${BLUE}=== Tree Growth Visualization - Setup Script ===${NC}"
    echo
    
    check_requirements
    create_project_structure
    create_package_json
    create_gitignore
    create_license
    create_dev_scripts
    create_config_files
    create_documentation
    initialize_git
    show_completion_message
}

# スクリプトが直接実行された場合のみmainを実行
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi