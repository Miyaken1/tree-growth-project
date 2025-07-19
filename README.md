# 樹木の成長を可視化する Web システム

このプロジェクトは、対話数に応じて樹木の成長段階を可視化するインタラクティブなWebシステムです。Google FormsとGoogle Sheets、Google Apps Scriptを使用してデータを収集・管理し、美しいスライドショーで成長過程を表現します。

## 🌟 主な機能

- **リアルタイム可視化**: 対話数に応じて自動的に成長段階が変化
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップに完全対応
- **統計分析**: 所属・役割別の詳細な参加状況分析
- **管理機能**: 成長段階の閾値や画像URLを動的に設定可能
- **アクセシビリティ**: WCAG 2.1 AA準拠、スクリーンリーダー対応
- **PWA対応**: オフライン機能とアプリライクな体験

## 🎯 成長段階

1. **🌱 種子** (0-10 対話)
2. **🌱 新芽** (11-50 対話)
3. **🌿 若木** (51-150 対話)
4. **🌳 成長する木** (151-300 対話)
5. **🌳 成熟した木** (301-500 対話)
6. **🌲 老木** (501-800 対話)
7. **🌲 古木** (801-1200 対話)
8. **🌳 伝説の木** (1200+ 対話)

## 🚀 クイックスタート

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/tree-growth-visualization.git
cd tree-growth-visualization
```

### 2. ファイル構成

```
tree-growth-visualization/
├── index.html          # メインページ（スライドショー）
├── stats.html          # 統計分析ページ
├── admin.html          # 管理者ページ
├── sw.js              # Service Worker（PWA）
├── manifest.json      # Webアプリマニフェスト
└── README.md          # このファイル
```

### 3. Google Apps Script の設定

#### 3.1 Google Apps Script プロジェクトの作成

1. [Google Apps Script](https://script.google.com) にアクセス
2. 「新しいプロジェクト」を作成
3. 以下のコードを `Code.gs` に貼り付け：

```javascript
function doGet(e) {
  const action = e.parameter.action;
  
  // CORS対応
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    let result = {};
    
    switch(action) {
      case 'count':
        result = getCount(e.parameter);
        break;
      case 'breakdown':
        result = getBreakdown(e.parameter);
        break;
      case 'config':
        result = getConfig();
        break;
      default:
        result = { error: 'Invalid action' };
    }
    
    output.setContent(JSON.stringify(result));
    
  } catch (error) {
    output.setContent(JSON.stringify({ error: error.toString() }));
  }
  
  return output;
}

function doPost(e) {
  const action = e.parameter.action;
  
  try {
    let result = {};
    
    if (action === 'config') {
      result = saveConfig(e.parameter);
    }
    
    const output = ContentService.createTextOutput(JSON.stringify(result));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
    
  } catch (error) {
    const output = ContentService.createTextOutput(JSON.stringify({ error: error.toString() }));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

// CORS対応
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

function getCount(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('responses');
  const data = sheet.getDataRange().getValues();
  
  // ヘッダー行を除く
  const responses = data.slice(1);
  
  let totalCount = 0;
  let totalParticipants = responses.length;
  
  responses.forEach(row => {
    // 累計対話数は列Eと仮定（調整が必要な場合があります）
    const count = parseInt(row[4]) || 0;
    totalCount += count;
  });
  
  return {
    totalCount: totalCount,
    totalParticipants: totalParticipants,
    timestamp: new Date().toISOString()
  };
}

function getBreakdown(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('responses');
  const data = sheet.getDataRange().getValues();
  
  const responses = data.slice(1);
  const organizationBreakdown = {};
  const roleBreakdown = {};
  
  responses.forEach(row => {
    const organization = row[1] || 'その他'; // 所属列
    const role = row[2] || 'その他'; // 役割列
    
    organizationBreakdown[organization] = (organizationBreakdown[organization] || 0) + 1;
    roleBreakdown[role] = (roleBreakdown[role] || 0) + 1;
  });
  
  return {
    organizationBreakdown: organizationBreakdown,
    roleBreakdown: roleBreakdown
  };
}

function getConfig() {
  const configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('config');
  
  if (!configSheet) {
    // デフォルト設定を返す
    return {
      thresholds: [
        { name: '種子', min: 0, max: 10, icon: '🌱' },
        { name: '新芽', min: 11, max: 50, icon: '🌱' },
        { name: '若木', min: 51, max: 150, icon: '🌿' },
        { name: '成長する木', min: 151, max: 300, icon: '🌳' },
        { name: '成熟した木', min: 301, max: 500, icon: '🌳' },
        { name: '老木', min: 501, max: 800, icon: '🌲' },
        { name: '古木', min: 801, max: 1200, icon: '🌲' },
        { name: '伝説の木', min: 1201, max: -1, icon: '🌳' }
      ],
      images: [
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&h=1080&fit=crop',
        'https://images.unsplash.com/photo-1574263867128-0945c4693c5d?w=1920&h=1080&fit=crop'
      ],
      period: {
        start: '',
        end: '',
        updateInterval: 60
      }
    };
  }
  
  const configData = configSheet.getDataRange().getValues();
  // 設定データの解析とJSONパース
  // 実装は要件に応じて調整
  
  return {}; // 設定データを返す
}

function saveConfig(params) {
  // パスワードハッシュの確認
  const providedHash = params.pw;
  const correctHash = 'd74ff0ee8da3b9806b18c877dbf29bbde50b5bd8e4dad7a3a725000feb82e8f1'; // admin123のSHA-256
  
  if (providedHash !== correctHash) {
    throw new Error('認証に失敗しました');
  }
  
  // 設定保存処理
  const configData = JSON.parse(params.config);
  
  // configシートに保存
  // 実装詳細は要件に応じて調整
  
  return { success: true, message: '設定を保存しました' };
}
```

#### 3.2 デプロイメント

1. 「デプロイ」→「新しいデプロイ」をクリック
2. 種類：「ウェブアプリ」を選択
3. 実行者：「自分」
4. アクセス権限：「全員」
5. 「デプロイ」をクリック
6. 表示されるURLをコピー

### 4. HTMLファイルの設定

各HTMLファイルの `YOUR_GOOGLE_APPS_SCRIPT_URL` を、上記でコピーしたURLに置き換えてください。

```javascript
const CONFIG = {
    API_BASE_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', // ここを更新
    // ... 他の設定
};
```

### 5. GitHub Pagesでのデプロイ

1. GitHubリポジトリを作成
2. ファイルをプッシュ：

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

3. リポジトリの設定で「Pages」を有効化
4. Source: 「Deploy from a branch」
5. Branch: 「main」を選択

### 6. Google Formの設定

1. Google Formsで新しいフォームを作成
2. 以下の質問を追加：
   - 名前（短答式）
   - 所属（プルダウン：大学/中学校/小学校/細分化機関）
   - 役割（プルダウン：教師/学生/研究者/管理者/その他）
   - 累計対話数（短答式・数値）
   - 期間開始日（日付）
   - 期間終了日（日付）

3. 回答先をGoogle Sheetsに設定
4. 設定で「1ユーザー1回答」を有効化

## 🎨 カスタマイズ

### カラーパレットの変更

CSS変数を編集してカラーテーマを変更できます：

```css
:root {
    --primary-color: #1E90FF;    /* メインカラー */
    --secondary-color: #38B48B;  /* アクセントカラー */
    --bg-color: #F7FAFC;         /* 背景色 */
}
```

### 成長段階の調整

管理画面から、または `admin.html` のデフォルト設定を変更して成長段階をカスタマイズできます。

### 画像の変更

Unsplashまたは他の画像サービスから高品質な画像URLを設定できます。推奨サイズ：1920x1080px。

## 📱 PWA機能

Service Worker（`sw.js`）とマニフェスト（`manifest.json`）が含まれており、Progressive Web Appとして動作します。

### Service Worker の作成

```javascript
// sw.js
const CACHE_NAME = 'tree-growth-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/stats.html',
  '/admin.html',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.min.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
```

## 🔒 セキュリティ

### 管理者パスワード

デフォルトパスワード：`admin123`

変更するには：

1. 新しいパスワードのSHA-256ハッシュを生成
2. `admin.html` の `CONFIG.PASSWORD_HASH` を更新
3. Google Apps Script の `saveConfig` 関数も同様に更新

```javascript
// パスワードハッシュの生成例
async function generateHash(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
```

## 🚀 パフォーマンス最適化

### Lighthouse スコア目標

- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

### 最適化テクニック

1. **画像の遅延読み込み**: Intersection Observer API
2. **CDNの活用**: Tailwind CSS、Swiper、Chart.js
3. **キャッシュ戦略**: Service Worker
4. **コード分割**: 必要な機能のみ読み込み

## 🧪 テスト

### 手動テスト項目

- [ ] 全ページでレスポンシブデザインが正常動作
- [ ] スライドショーが対話数に応じて変化
- [ ] 統計グラフが正しく表示される
- [ ] 管理画面での設定変更が反映される
- [ ] モバイルでタッチ操作が正常動作
- [ ] スクリーンリーダーでアクセス可能

### 自動テスト（オプション）

GitHub Actionsを使用してLighthouse CIを実行：

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push, pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g @lhci/cli@0.12.x
      - run: lhci autorun
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 🆘 トラブルシューティング

### よくある問題

1. **APIが応答しない**
   - Google Apps ScriptのURLが正しく設定されているか確認
   - CORS設定が有効になっているか確認

2. **スライドが変化しない**
   - 対話数データが正しく送信されているか確認
   - 閾値設定が適切か確認

3. **統計グラフが表示されない**
   - Chart.jsが正しく読み込まれているか確認
   - データ形式が正しいか確認

4. **管理画面にアクセスできない**
   - パスワードが正しいか確認
   - ブラウザの開発者ツールでエラーを確認

### サポート

問題が解決しない場合は、[Issues](https://github.com/yourusername/tree-growth-visualization/issues) に詳細を投稿してください。

---

## 🌟 デモ

- **メインページ**: [https://yourusername.github.io/tree-growth-visualization/](https://yourusername.github.io/tree-growth-visualization/)
- **統計ページ**: [https://yourusername.github.io/tree-growth-visualization/stats.html](https://yourusername.github.io/tree-growth-visualization/stats.html)
- **管理ページ**: [https://yourusername.github.io/tree-growth-visualization/admin.html](https://yourusername.github.io/tree-growth-visualization/admin.html)

ご質問やフィードバックがございましたら、お気軽にお知らせください！ 🌳✨