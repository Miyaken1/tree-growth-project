// Statistics page functionality

class StatsApp {
    constructor() {
        this.apiBaseUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
        this.charts = {};
        this.init();
    }

    init() {
        this.loadStatsData();
        this.initializeCharts();
    }

    async loadStatsData() {
        try {
            const response = await fetch(`${this.apiBaseUrl}?action=breakdown`);
            const data = await response.json();
            
            this.updateSummaryCards(data);
            this.updateCharts(data);
            this.updateDataTable(data);
        } catch (error) {
            console.error('Error loading stats data:', error);
            this.loadMockData();
        }
    }

    loadMockData() {
        const mockData = {
            today: 45,
            week: 312,
            avgParticipation: 78,
            daily: [
                { date: '2024-01-15', count: 23, participants: 12 },
                { date: '2024-01-16', count: 31, participants: 15 },
                { date: '2024-01-17', count: 28, participants: 14 },
                { date: '2024-01-18', count: 42, participants: 18 },
                { date: '2024-01-19', count: 35, participants: 16 },
                { date: '2024-01-20', count: 38, participants: 17 },
                { date: '2024-01-21', count: 45, participants: 19 }
            ]
        };
        
        this.updateSummaryCards(mockData);
        this.updateCharts(mockData);
        this.updateDataTable(mockData);
    }

    updateSummaryCards(data) {
        document.getElementById('todayCount').textContent = data.today || 0;
        document.getElementById('weekCount').textContent = data.week || 0;
        document.getElementById('avgParticipation').textContent = `${data.avgParticipation || 0}%`;
    }

    initializeCharts() {
        // Daily Chart
        const dailyCtx = document.getElementById('dailyChart').getContext('2d');
        this.charts.daily = new Chart(dailyCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '対話数',
                    data: [],
                    borderColor: '#4a7c59',
                    backgroundColor: 'rgba(74, 124, 89, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Participation Chart
        const participationCtx = document.getElementById('participationChart').getContext('2d');
        this.charts.participation = new Chart(participationCtx, {
            type: 'doughnut',
            data: {
                labels: ['アクティブ参加者', '一般参加者', '新規参加者'],
                datasets: [{
                    data: [40, 35, 25],
                    backgroundColor: ['#4a7c59', '#87a96b', '#2d5016']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    updateCharts(data) {
        if (data.daily && this.charts.daily) {
            const labels = data.daily.map(item => new Date(item.date).toLocaleDateString('ja-JP'));
            const counts = data.daily.map(item => item.count);
            
            this.charts.daily.data.labels = labels;
            this.charts.daily.data.datasets[0].data = counts;
            this.charts.daily.update();
        }
    }

    updateDataTable(data) {
        const tableBody = document.getElementById('dataTable');
        if (!tableBody || !data.daily) return;

        tableBody.innerHTML = '';
        
        data.daily.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-gray-50';
            
            const growthLevel = this.calculateGrowthLevel(item.count);
            
            row.innerHTML = `
                <td class="px-4 py-2">${new Date(item.date).toLocaleDateString('ja-JP')}</td>
                <td class="px-4 py-2">${item.count}</td>
                <td class="px-4 py-2">${item.participants}</td>
                <td class="px-4 py-2">
                    <span class="px-2 py-1 rounded-full text-xs ${this.getGrowthLevelClass(growthLevel)}">
                        ${growthLevel}
                    </span>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    calculateGrowthLevel(count) {
        if (count >= 40) return '大きく成長';
        if (count >= 30) return '順調に成長';
        if (count >= 20) return '成長中';
        return '発芽段階';
    }

    getGrowthLevelClass(level) {
        switch (level) {
            case '大きく成長': return 'bg-green-100 text-green-800';
            case '順調に成長': return 'bg-blue-100 text-blue-800';
            case '成長中': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StatsApp();
});

