// Stats page specific functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Chart.js
  const ctx = document.getElementById('statsChart').getContext('2d')
  
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      datasets: [{
        label: '訪問者数',
        data: [120, 190, 300, 500, 200, 300],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
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
  })

  // Mock API call to get stats
  function updateStats() {
    // Simulate API call
    setTimeout(() => {
      document.getElementById('today-visitors').textContent = Math.floor(Math.random() * 100) + 50
      document.getElementById('month-visitors').textContent = Math.floor(Math.random() * 5000) + 1000
      document.getElementById('conversion-rate').textContent = (Math.random() * 10 + 2).toFixed(1) + '%'
      document.getElementById('avg-session').textContent = Math.floor(Math.random() * 10 + 2) + 'm'
    }, 1000)
  }

  // Update stats on page load
  updateStats()

  // Update stats every 60 seconds
  setInterval(updateStats, 60000)
})

