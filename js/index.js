// Index page specific functionality
import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs'

document.addEventListener('DOMContentLoaded', function() {
  // Initialize Swiper
  const swiper = new Swiper('.mySwiper', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
  })

  // Mock API call to get counts
  function updateCounts() {
    // Simulate API call
    setTimeout(() => {
      document.getElementById('total-count').textContent = Math.floor(Math.random() * 1000) + 100
      document.getElementById('active-count').textContent = Math.floor(Math.random() * 500) + 50
      document.getElementById('pending-count').textContent = Math.floor(Math.random() * 100) + 10
    }, 1000)
  }

  // Update counts on page load
  updateCounts()

  // Update counts every 30 seconds
  setInterval(updateCounts, 30000)
})

