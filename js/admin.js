// Enhanced Admin page functionality with SHA-256 authentication and API integration

// Configuration
const API_BASE_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

// Global variables
let currentPasswordHash = null;
let thresholdCount = 0;
let imageUrlCount = 0;

document.addEventListener('DOMContentLoaded', function() {
  initializeElements();
  showPasswordModal();
});

function initializeElements() {
  const modalLogin = document.getElementById('modal-login');
  const modalCancel = document.getElementById('modal-cancel');
  const modalPassword = document.getElementById('modal-password');
  const saveConfigBtn = document.getElementById('save-config');
  const reloadConfigBtn = document.getElementById('reload-config');
  const addThresholdBtn = document.getElementById('add-threshold');
  const addImageUrlBtn = document.getElementById('add-image-url');

  // Modal event listeners
  modalLogin.addEventListener('click', handleLogin);
  modalCancel.addEventListener('click', () => window.location.href = 'index.html');
  modalPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  // Admin panel event listeners
  saveConfigBtn.addEventListener('click', saveConfiguration);
  reloadConfigBtn.addEventListener('click', loadConfiguration);
  addThresholdBtn.addEventListener('click', addThresholdInput);
  addImageUrlBtn.addEventListener('click', addImageUrlInput);
}

function showPasswordModal() {
  document.getElementById('password-modal').classList.remove('hidden');
  document.getElementById('modal-password').focus();
}

function hidePasswordModal() {
  document.getElementById('password-modal').classList.add('hidden');
}

function showErrorMessage(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
}

function hideErrorMessage() {
  document.getElementById('error-message').classList.add('hidden');
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function handleLogin() {
  const password = document.getElementById('modal-password').value;
  
  if (!password) {
    showErrorMessage('パスワードを入力してください');
    return;
  }

  try {
    hideErrorMessage();
    
    // Hash the password
    currentPasswordHash = await hashPassword(password);
    
    // Test authentication by trying to fetch config
    const response = await fetch(`${API_BASE_URL}?action=config&pw=${currentPasswordHash}`);
    const result = await response.json();
    
    if (result.error && result.status === 401) {
      showErrorMessage('パスワードが正しくありません');
      return;
    }
    
    if (result.error) {
      showErrorMessage('認証エラー: ' + result.error);
      return;
    }
    
    // Authentication successful
    hidePasswordModal();
    document.getElementById('admin-panel').classList.remove('hidden');
    
    // Load configuration
    await loadConfiguration();
    
  } catch (error) {
    console.error('Login error:', error);
    showErrorMessage('ログインに失敗しました: ' + error.message);
  }
}

async function loadConfiguration() {
  try {
    const response = await fetch(`${API_BASE_URL}?action=config&pw=${currentPasswordHash}`);
    const result = await response.json();
    
    if (result.error) {
      alert('設定の読み込みに失敗しました: ' + result.error);
      return;
    }
    
    const config = result.config;
    
    // Clear existing inputs
    document.getElementById('thresholds-container').innerHTML = '';
    document.getElementById('image-urls-container').innerHTML = '';
    thresholdCount = 0;
    imageUrlCount = 0;
    
    // Load period settings
    document.getElementById('period-start').value = config['period.start'] || '';
    document.getElementById('period-end').value = config['period.end'] || '';
    
    // Load thresholds
    const thresholds = [];
    let i = 0;
    while (config[`thresholds.${i}`] !== undefined) {
      thresholds.push(parseFloat(config[`thresholds.${i}`]));
      i++;
    }
    
    thresholds.forEach(threshold => {
      addThresholdInput(threshold);
    });
    
    // Load image URLs
    const imageUrls = [];
    i = 0;
    while (config[`imageUrls.${i}`] !== undefined) {
      imageUrls.push(config[`imageUrls.${i}`]);
      i++;
    }
    
    imageUrls.forEach(url => {
      addImageUrlInput(url);
    });
    
    // If no thresholds or image URLs exist, add empty ones
    if (thresholds.length === 0) {
      addThresholdInput();
      addThresholdInput();
    }
    
    if (imageUrls.length === 0) {
      addImageUrlInput();
      addImageUrlInput();
    }
    
  } catch (error) {
    console.error('Load configuration error:', error);
    alert('設定の読み込み中にエラーが発生しました: ' + error.message);
  }
}

function addThresholdInput(value = '') {
  const container = document.getElementById('thresholds-container');
  const div = document.createElement('div');
  div.className = 'flex items-center space-x-2';
  div.innerHTML = `
    <label class="text-sm font-medium text-gray-700 w-16">閾値 ${thresholdCount + 1}:</label>
    <input type="number" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="数値を入力" value="${value}" step="0.01">
    <button type="button" class="bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500" onclick="this.parentElement.remove(); updateThresholdLabels()">削除</button>
  `;
  container.appendChild(div);
  thresholdCount++;
}

function addImageUrlInput(value = '') {
  const container = document.getElementById('image-urls-container');
  const div = document.createElement('div');
  div.className = 'flex items-center space-x-2';
  div.innerHTML = `
    <label class="text-sm font-medium text-gray-700 w-20">画像 ${imageUrlCount + 1}:</label>
    <input type="url" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://example.com/image.jpg" value="${value}">
    <button type="button" class="bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500" onclick="this.parentElement.remove(); updateImageUrlLabels()">削除</button>
  `;
  container.appendChild(div);
  imageUrlCount++;
}

function updateThresholdLabels() {
  const container = document.getElementById('thresholds-container');
  const labels = container.querySelectorAll('label');
  labels.forEach((label, index) => {
    label.textContent = `閾値 ${index + 1}:`;
  });
  thresholdCount = labels.length;
}

function updateImageUrlLabels() {
  const container = document.getElementById('image-urls-container');
  const labels = container.querySelectorAll('label');
  labels.forEach((label, index) => {
    label.textContent = `画像 ${index + 1}:`;
  });
  imageUrlCount = labels.length;
}

async function saveConfiguration() {
  try {
    // Collect configuration data
    const config = {};
    
    // Period settings
    config['period.start'] = document.getElementById('period-start').value;
    config['period.end'] = document.getElementById('period-end').value;
    
    // Thresholds
    const thresholdInputs = document.querySelectorAll('#thresholds-container input[type="number"]');
    thresholdInputs.forEach((input, index) => {
      if (input.value.trim() !== '') {
        config[`thresholds.${index}`] = parseFloat(input.value);
      }
    });
    
    // Image URLs
    const imageUrlInputs = document.querySelectorAll('#image-urls-container input[type="url"]');
    imageUrlInputs.forEach((input, index) => {
      if (input.value.trim() !== '') {
        config[`imageUrls.${index}`] = input.value.trim();
      }
    });
    
    // Send POST request
    const response = await fetch(`${API_BASE_URL}?action=config&pw=${currentPasswordHash}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config)
    });
    
    const result = await response.json();
    
    if (result.error) {
      alert('設定の保存に失敗しました: ' + result.error);
      return;
    }
    
    if (result.status === 'ok') {
      alert('設定が正常に保存されました');
    } else {
      alert('設定の保存結果が不明です');
    }
    
  } catch (error) {
    console.error('Save configuration error:', error);
    alert('設定の保存中にエラーが発生しました: ' + error.message);
  }
}

// Make functions available globally for onclick handlers
window.updateThresholdLabels = updateThresholdLabels;
window.updateImageUrlLabels = updateImageUrlLabels;

