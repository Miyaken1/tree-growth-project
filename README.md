# 🌳 Tree Growth Project / 樹の成長プロジェクト

[![Deploy Status](https://github.com/[username]/tree-growth-project/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)]()
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://[username].github.io/tree-growth-project/)

## 📋 Project Overview / プロジェクト概要

A web visualization system that displays tree growth based on dialogue participation data collected through Google Forms.

Google Formで収集した対話参加データに基づいて、樹木の成長を可視化するWebシステムです。

## ✨ Features / 機能

- 📊 Real-time data visualization / リアルタイムデータ可視化
- 🌱 Interactive tree growth display / インタラクティブな樹木成長表示
- 📈 Statistical analysis dashboard / 統計分析ダッシュボード
- 🔐 Admin panel with authentication / 認証付き管理画面
- 📱 Responsive design / レスポンシブデザイン
- 🔄 Auto-refresh functionality / 自動更新機能

## 🛠 Technology Stack / 技術スタック

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Tailwind CSS
- **UI Libraries**: Swiper.js v11, Chart.js
- **Build Tool**: Vite
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions

## 🚀 Quick Start / クイックスタート

### Prerequisites / 前提条件
- Node.js 18+ 
- Git
- Google Account

### Installation / インストール
```bash
git clone https://github.com/[username]/tree-growth-project.git
cd tree-growth-project
npm install
npm run dev
```

### Deployment / デプロイ
```bash
npm run build
npm run deploy
```

## 🏗 Project Structure / プロジェクト構造

```
/
├── index.html          # トップページ
├── stats.html          # データ可視化ページ  
├── admin.html          # 管理画面
├── assets/            # 画像アセット
├── css/               # スタイルシート
├── js/                # JavaScript
└── .github/workflows/ # CI/CD設定
```

## 📊 API Documentation / API仕様

### Base URL
```
https://script.google.com/macros/s/[SCRIPT_ID]/exec
```

### Endpoints
- `GET ?action=count` - Get total dialogue count
- `GET ?action=breakdown&start=YYYY-MM-DD&end=YYYY-MM-DD` - Get breakdown data
- `POST ?action=config&pw=HASH` - Update configuration

## 🔧 Configuration / 設定

### Environment Variables
- `VITE_API_BASE_URL`: Apps Script Web App URL
- `VITE_FORM_URL`: Google Form URL

### Google Apps Script Setup
1. Create new Apps Script project
2. Deploy as Web App
3. Set permissions to "Anyone"
4. Update API URL in frontend

## 📈 Performance / パフォーマンス

- Lighthouse Score: ≥90
- Initial Load: <2s
- Image Optimization: WebP format
- CDN: GitHub Pages global distribution

## 🤝 Contributing / 貢献

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch  
5. Create Pull Request

## 📄 License / ライセンス

MIT License - see LICENSE file for details

## 🙋‍♂️ Support / サポート

For questions or issues, please open a GitHub issue.


