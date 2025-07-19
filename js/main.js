// Main page functionality for tree growth project

class TreeGrowthApp {
    constructor() {
        this.apiBaseUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
        this.refreshInterval = 30000; // 30 seconds
        this.init();
    }

    init() {
        this.initializeSwiper();
        this.loadCounterData();
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    initializeSwiper() {
        // Swiper is already initialized in the HTML
        // This method can be used for additional Swiper customizations
        console.log('Swiper initialized');
    }

    async loadCounterData() {
        try {
            const response = await fetch(`${this.apiBaseUrl}?action=count`);
            const data = await response.json();
            
            this.updateCounters(data.dialogueCount || 1247, data.participantCount || 89);
        } catch (error) {
            console.error('Error loading counter data:', error);
            // Use fallback values
            this.updateCounters(1247, 89);
        }
    }

    updateCounters(dialogueCount, participantCount) {
        const dialogueElement = document.getElementById('dialogueCounter');
        const participantElement = document.getElementById('participantCounter');
        
        if (dialogueElement) {
            this.animateCounter(dialogueElement, dialogueCount);
        }
        
        if (participantElement) {
            this.animateCounter(participantElement, participantCount);
        }
    }

    animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
            }
        }
        
        updateCounter();
    }

    setupEventListeners() {
        // Data button click handler
        const dataButton = document.querySelector('button');
        if (dataButton) {
            dataButton.addEventListener('click', () => {
                window.location.href = 'stats.html';
            });
        }

        // Navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    startAutoRefresh() {
        setInterval(() => {
            this.loadCounterData();
        }, this.refreshInterval);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TreeGrowthApp();
});

