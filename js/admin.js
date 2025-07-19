// Admin panel functionality

class AdminApp {
    constructor() {
        this.apiBaseUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.loadConfiguration();
    }

    checkAuthentication() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        if (isLoggedIn) {
            this.showAdminPanel();
        } else {
            this.showLoginForm();
        }
    }

    showLoginForm() {
        document.getElementById('loginForm').style.display = 'flex';
        document.getElementById('adminPanel').classList.add('hidden');
    }

    showAdminPanel() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminPanel').classList.remove('hidden');
        this.isAuthenticated = true;
        this.loadSystemStatus();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('authForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Control buttons
        document.getElementById('refreshDataBtn').addEventListener('click', () => {
            this.refreshData();
        });

        document.getElementById('resetCounterBtn').addEventListener('click', () => {
            this.resetCounter();
        });

        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        // Configuration
        document.getElementById('saveConfigBtn').addEventListener('click', () => {
            this.saveConfiguration();
        });
    }

    async handleLogin() {
        const password = document.getElementById('password').value;
        
        // Simple password check (in production, use proper authentication)
        if (password === 'admin123') {
            localStorage.setItem('adminLoggedIn', 'true');
            this.showAdminPanel();
        } else {
            alert('パスワードが正しくありません');
        }
    }

    handleLogout() {
        localStorage.removeItem('adminLoggedIn');
        this.isAuthenticated = false;
        this.showLoginForm();
    }

    async refreshData() {
        if (!this.isAuthenticated) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}?action=refresh`, {
                method: 'POST'
            });
            
            if (response.ok) {
                alert('データを更新しました');
                this.loadSystemStatus();
            } else {
                throw new Error('更新に失敗しました');
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
            alert('データ更新中にエラーが発生しました');
        }
    }

    async resetCounter() {
        if (!this.isAuthenticated) return;

        if (confirm('カウンターをリセットしますか？この操作は取り消せません。')) {
            try {
                const response = await fetch(`${this.apiBaseUrl}?action=reset`, {
                    method: 'POST'
                });
                
                if (response.ok) {
                    alert('カウンターをリセットしました');
                    this.loadSystemStatus();
                } else {
                    throw new Error('リセットに失敗しました');
                }
            } catch (error) {
                console.error('Error resetting counter:', error);
                alert('カウンターリセット中にエラーが発生しました');
            }
        }
    }

    exportData() {
        if (!this.isAuthenticated) return;

        // Create mock CSV data
        const csvData = [
            ['日付', '対話数', '参加者数'],
            ['2024-01-15', '23', '12'],
            ['2024-01-16', '31', '15'],
            ['2024-01-17', '28', '14']
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `tree-growth-data-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    loadConfiguration() {
        // Load saved configuration from localStorage
        const config = JSON.parse(localStorage.getItem('adminConfig') || '{}');
        
        document.getElementById('apiUrl').value = config.apiUrl || '';
        document.getElementById('formUrl').value = config.formUrl || '';
        document.getElementById('refreshInterval').value = config.refreshInterval || 30;
        document.getElementById('growthThreshold').value = config.growthThreshold || 100;
    }

    saveConfiguration() {
        if (!this.isAuthenticated) return;

        const config = {
            apiUrl: document.getElementById('apiUrl').value,
            formUrl: document.getElementById('formUrl').value,
            refreshInterval: document.getElementById('refreshInterval').value,
            growthThreshold: document.getElementById('growthThreshold').value
        };

        localStorage.setItem('adminConfig', JSON.stringify(config));
        alert('設定を保存しました');
    }

    async loadSystemStatus() {
        if (!this.isAuthenticated) return;

        try {
            // Mock system status data
            const status = {
                apiConnected: true,
                lastUpdate: new Date().toLocaleString('ja-JP'),
                totalRecords: 1247,
                errorCount: 0
            };

            this.updateSystemStatus(status);
        } catch (error) {
            console.error('Error loading system status:', error);
        }
    }

    updateSystemStatus(status) {
        const apiStatusElement = document.getElementById('apiStatus');
        const statusIndicator = apiStatusElement.querySelector('div');
        const statusText = apiStatusElement.querySelector('span');

        if (status.apiConnected) {
            statusIndicator.className = 'w-3 h-3 rounded-full bg-green-400 mr-2';
            statusText.textContent = '接続中';
        } else {
            statusIndicator.className = 'w-3 h-3 rounded-full bg-red-400 mr-2';
            statusText.textContent = '切断';
        }

        document.getElementById('lastUpdate').textContent = status.lastUpdate;
        document.getElementById('totalRecords').textContent = status.totalRecords.toLocaleString();
        document.getElementById('errorCount').textContent = status.errorCount;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminApp();
});

